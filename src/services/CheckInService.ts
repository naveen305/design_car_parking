import { v4 as uuidv4 } from 'uuid';
import { Vehicle } from '../models/Vehicle';
import { ParkingTicket } from '../models/ParkingTicket';
import { IVehicleRepository } from '../repositories/interfaces/IVehicleRepository';
import { ITicketRepository } from '../repositories/interfaces/ITicketRepository';
import { SpotAllocationService } from './SpotAllocationService';
import { AppError } from '../errors/AppError';

/** DTO for incoming check-in requests */
export interface CheckInDto {
  licensePlate: string;
  vehicleType: string; // validated & cast to VehicleType by controller
}

/**
 * CheckInService orchestrates the vehicle entry flow:
 *  1. Validate vehicle is not already parked
 *  2. Register (or retrieve) the vehicle
 *  3. Allocate the nearest suitable spot (via SpotAllocationService)
 *  4. Issue a ParkingTicket with entry timestamp
 */
export class CheckInService {
  constructor(
    private readonly vehicleRepo: IVehicleRepository,
    private readonly ticketRepo: ITicketRepository,
    private readonly allocationService: SpotAllocationService
  ) {}

  async checkIn(vehicle: Vehicle): Promise<ParkingTicket> {
    // Guard: prevent double check-in for the same vehicle
    const existingTicket = await this.ticketRepo.findActiveByVehicleId(
      vehicle.id
    );
    if (existingTicket) {
      throw new AppError(
        `Vehicle "${vehicle.licensePlate}" is already checked in (ticket: ${existingTicket.ticketId})`,
        409
      );
    }

    // Save/update the vehicle record
    await this.vehicleRepo.save(vehicle);

    // Allocate a spot — throws 503 if none available
    const spot = await this.allocationService.allocate(vehicle.type);

    // Create and persist the ticket
    const ticket: ParkingTicket = {
      ticketId: uuidv4(),
      vehicle,
      spot,
      entryTime: new Date(),
      isPaid: false,
    };

    return this.ticketRepo.save(ticket);
  }
}
