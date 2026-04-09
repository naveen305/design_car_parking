import { ParkingTicket } from '../models/ParkingTicket';
import { ITicketRepository } from './interfaces/ITicketRepository';
import { AppError } from '../errors/AppError';

/**
 * In-memory implementation of ITicketRepository.
 * Maintains a secondary index over vehicleId for O(1) active-ticket lookup.
 */
export class InMemoryTicketRepository implements ITicketRepository {
  private readonly store = new Map<string, ParkingTicket>();
  /** Maps vehicleId → ticketId for open (unpaid) tickets */
  private readonly activeIndex = new Map<string, string>();

  async save(ticket: ParkingTicket): Promise<ParkingTicket> {
    this.store.set(ticket.ticketId, { ...ticket });
    if (!ticket.isPaid) {
      this.activeIndex.set(ticket.vehicle.id, ticket.ticketId);
    }
    return ticket;
  }

  async findById(ticketId: string): Promise<ParkingTicket | null> {
    return this.store.get(ticketId) ?? null;
  }

  async findActiveByVehicleId(vehicleId: string): Promise<ParkingTicket | null> {
    const ticketId = this.activeIndex.get(vehicleId);
    if (!ticketId) return null;
    return this.store.get(ticketId) ?? null;
  }

  async update(ticket: ParkingTicket): Promise<ParkingTicket> {
    if (!this.store.has(ticket.ticketId)) {
      throw new AppError(`Ticket "${ticket.ticketId}" not found`, 404);
    }
    this.store.set(ticket.ticketId, { ...ticket });
    // Remove from active index once paid
    if (ticket.isPaid) {
      this.activeIndex.delete(ticket.vehicle.id);
    }
    return ticket;
  }

  async findAll(): Promise<ParkingTicket[]> {
    return [...this.store.values()];
  }
}
