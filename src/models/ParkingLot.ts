import { ParkingFloor } from './ParkingFloor';

/**
 * Top-level aggregate representing the entire parking lot facility.
 */
export interface ParkingLot {
  /** Unique identifier */
  id: string;
  /** Human-readable name of the parking facility */
  name: string;
  /** Physical address */
  address: string;
  /** All floors in this parking lot */
  floors: ParkingFloor[];
}
