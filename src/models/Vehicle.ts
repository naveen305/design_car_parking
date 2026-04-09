import { VehicleType } from './enums';

/**
 * Represents a vehicle attempting to park.
 */
export interface Vehicle {
  /** Unique identifier (UUID) */
  id: string;
  /** Vehicle license plate number */
  licensePlate: string;
  /** Size/type category of the vehicle */
  type: VehicleType;
}
