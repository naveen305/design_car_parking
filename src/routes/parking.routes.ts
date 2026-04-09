import { Router } from 'express';
import { ParkingController } from '../controllers/ParkingController';

/**
 * Parking lot routes — all prefixed with /api/v1/parking by the app entry point.
 *
 * GET  /availability    → Real-time counts: total, available, occupied + per-floor
 * GET  /spots           → All spots with current status
 * GET  /floors          → Spots grouped by floor
 * GET  /rates           → Current fee rates per vehicle type
 * GET  /compatibility   → Vehicle type → spot size compatibility matrix
 * GET  /active-tickets  → All currently open (unpaid) parking sessions
 */
export function createParkingRouter(controller: ParkingController): Router {
  const router = Router();

  router.get('/availability', controller.getAvailability);
  router.get('/spots', controller.getAllSpots);
  router.get('/floors', controller.getFloors);
  router.get('/rates', controller.getRates);
  router.get('/compatibility', controller.getCompatibility);
  router.get('/active-tickets', controller.getActiveTickets);

  return router;
}
