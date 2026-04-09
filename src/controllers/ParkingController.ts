import { Request, Response, NextFunction } from 'express';
import { ParkingLotService } from '../services/ParkingLotService';
import { SpotAllocationService } from '../services/SpotAllocationService';
import { FeeCalculationService } from '../services/FeeCalculationService';

/**
 * ParkingController — HTTP handlers for parking lot status and informational endpoints.
 */
export class ParkingController {
  constructor(
    private readonly lotService: ParkingLotService,
    private readonly allocationService: SpotAllocationService,
    private readonly feeService: FeeCalculationService
  ) {}

  /**
   * GET /api/v1/parking/availability
   * Returns real-time summary: total, available, occupied counts + per-floor breakdown.
   */
  getAvailability = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const summary = await this.lotService.getAvailability();
      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/parking/spots
   * Returns every spot with its current status.
   */
  getAllSpots = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const spots = await this.lotService.getAllSpots();
      res.status(200).json({ success: true, data: spots, total: spots.length });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/parking/floors
   * Returns spots organised per floor.
   */
  getFloors = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const byFloor = await this.lotService.getSpotsByFloor();
      const floors = [...byFloor.entries()]
        .sort(([a], [b]) => a - b)
        .map(([floorNumber, spots]) => ({ floorNumber, spots }));
      res.status(200).json({ success: true, data: floors });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/parking/rates
   * Returns the current fee rates per vehicle type.
   */
  getRates = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const rates = this.feeService.getRates();
      res.status(200).json({
        success: true,
        data: { rates, currency: 'USD', billingUnit: 'per hour (minimum 1 hour)' },
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/parking/compatibility
   * Returns the vehicle-type → spot-size compatibility matrix.
   */
  getCompatibility = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const matrix = this.allocationService.getCompatibilityMatrix();
      res.status(200).json({ success: true, data: matrix });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/parking/active-tickets
   * Returns all currently open (unpaid) tickets.
   */
  getActiveTickets = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tickets = await this.lotService.getActiveTickets();
      res.status(200).json({ success: true, data: tickets, total: tickets.length });
    } catch (err) {
      next(err);
    }
  };
}
