import { Mutex } from 'async-mutex';
import { ParkingSpot } from '../models/ParkingSpot';
import { VehicleType, SpotSize, SpotStatus } from '../models/enums';
import { ISpotRepository } from '../repositories/interfaces/ISpotRepository';
import { AppError } from '../errors/AppError';

/**
 * Vehicle type → compatible spot sizes, in preference order.
 *
 * Rules:
 *  - MOTORCYCLE: fits SMALL (preferred) or MEDIUM (fallback)
 *  - CAR:        fits MEDIUM (preferred) or LARGE (fallback)
 *  - BUS:        fits LARGE only — buses must not share smaller spots
 */
const VEHICLE_SPOT_COMPATIBILITY: Record<VehicleType, SpotSize[]> = {
  [VehicleType.MOTORCYCLE]: [SpotSize.SMALL, SpotSize.MEDIUM],
  [VehicleType.CAR]: [SpotSize.MEDIUM, SpotSize.LARGE],
  [VehicleType.BUS]: [SpotSize.LARGE],
};

/**
 * SpotAllocationService — allocates the nearest available compatible spot.
 *
 * Concurrency design:
 * A single global Mutex is acquired for the duration of the
 * find-and-mark critical section. This prevents two simultaneous
 * requests from being assigned the same spot (TOCTOU race).
 *
 * In a distributed system this would be replaced with a database
 * row-level lock (SELECT ... FOR UPDATE) or a Redis-based distributed lock.
 */
export class SpotAllocationService {
  /** Global allocation mutex — covers the entire find+update critical section */
  private readonly mutex = new Mutex();

  constructor(private readonly spotRepository: ISpotRepository) {}

  /**
   * Finds and reserves the nearest available spot for the given vehicle type.
   * @returns The reserved ParkingSpot
   * @throws AppError(503) if no suitable spot is available
   */
  async allocate(vehicleType: VehicleType): Promise<ParkingSpot> {
    const compatibleSizes = VEHICLE_SPOT_COMPATIBILITY[vehicleType];

    // Acquire mutex — only one thread enters this section at a time
    const release = await this.mutex.acquire();
    try {
      // 1. Find all available compatible spots (sorted nearest-first by repo)
      const candidates = await this.spotRepository.findAvailableBySize(
        compatibleSizes
      );

      if (candidates.length === 0) {
        throw new AppError(
          `No available parking spot for vehicle type "${vehicleType}"`,
          503
        );
      }

      // 2. Pick the nearest (first in sorted list)
      const chosen = candidates[0];

      // 3. Atomically mark as OCCUPIED (still inside mutex)
      const reserved = await this.spotRepository.updateStatus(
        chosen.id,
        SpotStatus.OCCUPIED
      );

      return reserved;
    } finally {
      // Always release the mutex — even if an error is thrown
      release();
    }
  }

  /** Release a spot back to AVAILABLE (called on checkout) */
  async release(spotId: string): Promise<ParkingSpot> {
    return this.spotRepository.updateStatus(spotId, SpotStatus.AVAILABLE);
  }

  /** Returns the compatibility map for informational use */
  getCompatibilityMatrix(): Record<VehicleType, SpotSize[]> {
    return { ...VEHICLE_SPOT_COMPATIBILITY };
  }
}
