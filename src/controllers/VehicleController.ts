import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CheckInService } from '../services/CheckInService';
import { CheckOutService } from '../services/CheckOutService';
import { ITicketRepository } from '../repositories/interfaces/ITicketRepository';
import { IVehicleRepository } from '../repositories/interfaces/IVehicleRepository';
import { VehicleType } from '../models/enums';
import { AppError } from '../errors/AppError';

/**
 * VehicleController — HTTP handlers for vehicle check-in / check-out / ticket lookup.
 * All business logic is delegated to the service layer.
 */
export class VehicleController {
  constructor(
    private readonly checkInService: CheckInService,
    private readonly checkOutService: CheckOutService,
    private readonly ticketRepo: ITicketRepository,
    private readonly vehicleRepo: IVehicleRepository
  ) {}

  /**
   * POST /api/v1/vehicles/checkin
   * Body: { licensePlate: string, vehicleType: VehicleType }
   */
  checkIn = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { licensePlate, vehicleType } = req.body as {
        licensePlate: string;
        vehicleType: VehicleType;
      };

      // Reuse existing vehicle record if license plate is known
      let vehicle = await this.vehicleRepo.findByLicensePlate(licensePlate);
      if (!vehicle) {
        vehicle = { id: uuidv4(), licensePlate: licensePlate.toUpperCase(), type: vehicleType };
      }

      const ticket = await this.checkInService.checkIn(vehicle);

      res.status(201).json({
        success: true,
        data: {
          ticketId: ticket.ticketId,
          vehicle: ticket.vehicle,
          spot: {
            id: ticket.spot.id,
            floor: ticket.spot.floorNumber,
            spotNumber: ticket.spot.spotNumber,
            size: ticket.spot.size,
          },
          entryTime: ticket.entryTime,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/v1/vehicles/checkout/:ticketId
   */
  checkOut = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { ticketId } = req.params;
      const ticket = await this.checkOutService.checkOut(ticketId);

      res.status(200).json({
        success: true,
        data: {
          ticketId: ticket.ticketId,
          vehicle: ticket.vehicle,
          spot: {
            id: ticket.spot.id,
            floor: ticket.spot.floorNumber,
            spotNumber: ticket.spot.spotNumber,
          },
          entryTime: ticket.entryTime,
          exitTime: ticket.exitTime,
          durationMinutes: ticket.exitTime
            ? Math.ceil(
                (ticket.exitTime.getTime() - ticket.entryTime.getTime()) / 60000
              )
            : null,
          fee: ticket.fee,
          currency: 'USD',
          isPaid: ticket.isPaid,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/vehicles/ticket/:ticketId
   */
  getTicket = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { ticketId } = req.params;
      const ticket = await this.ticketRepo.findById(ticketId);
      if (!ticket) {
        throw new AppError(`Ticket "${ticketId}" not found`, 404);
      }
      res.status(200).json({ success: true, data: ticket });
    } catch (err) {
      next(err);
    }
  };
}
