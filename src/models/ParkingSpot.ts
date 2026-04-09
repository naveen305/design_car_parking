import { SpotSize, SpotStatus } from './enums';

/**
 * Represents an individual parking spot on a floor.
 */
export interface ParkingSpot {
  /** Unique identifier (UUID) */
  id: string;
  /** Which floor this spot is on (1-indexed) */
  floorNumber: number;
  /** Human-readable spot label on the floor (e.g., 1, 2, 3...) */
  spotNumber: number;
  /** Physical size classification of this spot */
  size: SpotSize;
  /** Current availability status */
  status: SpotStatus;
  /** ID of the vehicle currently occupying this spot (undefined if available) */
  vehicleId?: string;
}
