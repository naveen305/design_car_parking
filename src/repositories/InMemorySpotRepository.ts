import { ParkingSpot } from '../models/ParkingSpot';
import { SpotSize, SpotStatus } from '../models/enums';
import { ISpotRepository } from './interfaces/ISpotRepository';
import { AppError } from '../errors/AppError';

/**
 * In-memory implementation of ISpotRepository.
 *
 * Spot ordering for allocation:
 *   Primary   → floorNumber ASC  (prefer ground floor — closest to entrance)
 *   Secondary → spotNumber ASC   (prefer lower numbered spots — nearest within floor)
 *
 * Note: updateStatus is intentionally synchronous under the hood so that when
 * called inside an async-mutex critical section it behaves atomically within
 * the Node.js event loop.
 */
export class InMemorySpotRepository implements ISpotRepository {
  private readonly store = new Map<string, ParkingSpot>();

  async save(spot: ParkingSpot): Promise<ParkingSpot> {
    this.store.set(spot.id, { ...spot });
    return spot;
  }

  async saveBulk(spots: ParkingSpot[]): Promise<void> {
    for (const spot of spots) {
      this.store.set(spot.id, { ...spot });
    }
  }

  async findById(id: string): Promise<ParkingSpot | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<ParkingSpot[]> {
    return [...this.store.values()];
  }

  async findAvailableBySize(sizes: SpotSize[]): Promise<ParkingSpot[]> {
    const sizeSet = new Set(sizes);
    return [...this.store.values()]
      .filter(
        (s) => s.status === SpotStatus.AVAILABLE && sizeSet.has(s.size)
      )
      .sort((a, b) =>
        a.floorNumber !== b.floorNumber
          ? a.floorNumber - b.floorNumber
          : a.spotNumber - b.spotNumber
      );
  }

  async updateStatus(
    id: string,
    status: SpotStatus,
    vehicleId?: string
  ): Promise<ParkingSpot> {
    const spot = this.store.get(id);
    if (!spot) {
      throw new AppError(`Spot with id "${id}" not found`, 404);
    }
    const updated: ParkingSpot = {
      ...spot,
      status,
      vehicleId: status === SpotStatus.OCCUPIED ? vehicleId : undefined,
    };
    this.store.set(id, updated);
    return updated;
  }
}
