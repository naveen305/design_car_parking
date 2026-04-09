import { Vehicle } from './Vehicle';
import { ParkingSpot } from './ParkingSpot';

/**
 * A parking ticket issued when a vehicle checks in.
 * Tracks the full lifecycle of a parking transaction.
 */
export interface ParkingTicket {
  /** Unique ticket identifier (UUID) */
  ticketId: string;
  /** The vehicle that owns this ticket */
  vehicle: Vehicle;
  /** The assigned parking spot */
  spot: ParkingSpot;
  /** Timestamp when the vehicle entered the lot */
  entryTime: Date;
  /** Timestamp when the vehicle exited the lot (undefined until checkout) */
  exitTime?: Date;
  /** Calculated parking fee in currency units (undefined until checkout) */
  fee?: number;
  /** Whether the ticket has been paid and closed */
  isPaid: boolean;
}
