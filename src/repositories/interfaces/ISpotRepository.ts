import { ParkingSpot } from '../../models/ParkingSpot';
import { SpotSize, SpotStatus } from '../../models/enums';

/**
 * Repository interface for ParkingSpot persistence.
 */
export interface ISpotRepository {
  save(spot: ParkingSpot): Promise<ParkingSpot>;
  saveBulk(spots: ParkingSpot[]): Promise<void>;
  findById(id: string): Promise<ParkingSpot | null>;
  findAll(): Promise<ParkingSpot[]>;
  /** Find available spots of given size(s), ordered by floor then spot number */
  findAvailableBySize(sizes: SpotSize[]): Promise<ParkingSpot[]>;
  /** Atomically update a spot's status and vehicleId */
  updateStatus(
    id: string,
    status: SpotStatus,
    vehicleId?: string
  ): Promise<ParkingSpot>;
}
