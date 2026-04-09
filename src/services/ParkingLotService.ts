import { ISpotRepository } from '../repositories/interfaces/ISpotRepository';
import { ITicketRepository } from '../repositories/interfaces/ITicketRepository';
import { SpotStatus } from '../models/enums';
import { ParkingSpot } from '../models/ParkingSpot';

export interface FloorAvailability {
  floorNumber: number;
  total: number;
  available: number;
  occupied: number;
}

export interface LotAvailabilitySummary {
  totalSpots: number;
  availableSpots: number;
  occupiedSpots: number;
  byFloor: FloorAvailability[];
}

/**
 * ParkingLotService — aggregation-level queries.
 * Provides real-time availability snapshots without touching
 * business logic owned by the other services.
 */
export class ParkingLotService {
  constructor(
    private readonly spotRepo: ISpotRepository,
    private readonly ticketRepo: ITicketRepository
  ) {}

  /** Returns a full real-time availability summary grouped by floor */
  async getAvailability(): Promise<LotAvailabilitySummary> {
    const allSpots = await this.spotRepo.findAll();

    const byFloor = new Map<number, FloorAvailability>();
    for (const spot of allSpots) {
      if (!byFloor.has(spot.floorNumber)) {
        byFloor.set(spot.floorNumber, {
          floorNumber: spot.floorNumber,
          total: 0,
          available: 0,
          occupied: 0,
        });
      }
      const floor = byFloor.get(spot.floorNumber)!;
      floor.total++;
      if (spot.status === SpotStatus.AVAILABLE) floor.available++;
      else floor.occupied++;
    }

    const floorList = [...byFloor.values()].sort(
      (a, b) => a.floorNumber - b.floorNumber
    );

    return {
      totalSpots: allSpots.length,
      availableSpots: allSpots.filter((s) => s.status === SpotStatus.AVAILABLE)
        .length,
      occupiedSpots: allSpots.filter((s) => s.status === SpotStatus.OCCUPIED)
        .length,
      byFloor: floorList,
    };
  }

  /** Returns all spots with their current status */
  async getAllSpots(): Promise<ParkingSpot[]> {
    return this.spotRepo.findAll();
  }

  /** Returns spots grouped by floor */
  async getSpotsByFloor(): Promise<Map<number, ParkingSpot[]>> {
    const spots = await this.spotRepo.findAll();
    const map = new Map<number, ParkingSpot[]>();
    for (const spot of spots) {
      if (!map.has(spot.floorNumber)) map.set(spot.floorNumber, []);
      map.get(spot.floorNumber)!.push(spot);
    }
    return map;
  }

  /** Returns all active (unpaid) tickets */
  async getActiveTickets() {
    const all = await this.ticketRepo.findAll();
    return all.filter((t) => !t.isPaid);
  }
}
