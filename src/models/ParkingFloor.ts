import { ParkingSpot } from './ParkingSpot';

/**
 * Represents a single floor in the parking lot.
 * Each floor has an ordered list of parking spots.
 */
export interface ParkingFloor {
  /** Floor number (1-indexed) */
  floorNumber: number;
  /** All parking spots on this floor */
  spots: ParkingSpot[];
}
