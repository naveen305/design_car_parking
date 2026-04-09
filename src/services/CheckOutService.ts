import { ParkingTicket } from '../models/ParkingTicket';
import { ITicketRepository } from '../repositories/interfaces/ITicketRepository';
import { SpotAllocationService } from './SpotAllocationService';
import { FeeCalculationService } from './FeeCalculationService';
import { AppError } from '../errors/AppError';

/**
 * CheckOutService orchestrates the vehicle exit flow:
 *  1. Retrieve and validate the ticket
 *  2. Record exit time
 *  3. Calculate parking fee
 *  4. Mark ticket as paid
 *  5. Release the parking spot back to AVAILABLE
 */
export class CheckOutService {
  constructor(
    private readonly ticketRepo: ITicketRepository,
    private readonly allocationService: SpotAllocationService,
    private readonly feeService: FeeCalculationService
  ) {}

  /**
   * @param ticketId - The ticket ID issued at check-in
   * @returns Updated ParkingTicket with exitTime, fee, and isPaid=true
   */
  async checkOut(ticketId: string): Promise<ParkingTicket> {
    const ticket = await this.ticketRepo.findById(ticketId);
    if (!ticket) {
      throw new AppError(`Ticket "${ticketId}" not found`, 404);
    }
    if (ticket.isPaid) {
      throw new AppError(`Ticket "${ticketId}" has already been checked out`, 409);
    }

    const exitTime = new Date();

    // Calculate fee based on duration and vehicle type
    const fee = this.feeService.calculate(
      ticket.entryTime,
      exitTime,
      ticket.vehicle.type
    );

    // Build updated ticket
    const updatedTicket: ParkingTicket = {
      ...ticket,
      exitTime,
      fee,
      isPaid: true,
    };

    // Persist updated ticket
    await this.ticketRepo.update(updatedTicket);

    // Free up the spot — update vehicleId to undefined
    await this.allocationService.release(ticket.spot.id);

    return updatedTicket;
  }
}
