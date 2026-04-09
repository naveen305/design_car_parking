import { ParkingTicket } from '../../models/ParkingTicket';

/**
 * Repository interface for ParkingTicket persistence.
 */
export interface ITicketRepository {
  save(ticket: ParkingTicket): Promise<ParkingTicket>;
  findById(ticketId: string): Promise<ParkingTicket | null>;
  findActiveByVehicleId(vehicleId: string): Promise<ParkingTicket | null>;
  update(ticket: ParkingTicket): Promise<ParkingTicket>;
  findAll(): Promise<ParkingTicket[]>;
}
