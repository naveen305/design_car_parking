/**
 * Core enumerations for the Smart Parking Lot system.
 */

/** Types of vehicles the parking lot can accommodate */
export enum VehicleType {
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  BUS = 'BUS',
}

/** Physical sizes of parking spots */
export enum SpotSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

/** Availability status of a parking spot */
export enum SpotStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
}
