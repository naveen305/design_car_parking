import { Router } from 'express';
import { VehicleController } from '../controllers/VehicleController';
import { validateCheckIn } from '../middleware/validate';

/**
 * Vehicle routes — all prefixed with /api/v1/vehicles by the app entry point.
 *
 * POST   /checkin           → Check a vehicle in, issue a parking ticket
 * POST   /checkout/:ticketId → Check a vehicle out, compute & return fee
 * GET    /ticket/:ticketId   → Retrieve a ticket by ID
 */
export function createVehicleRouter(controller: VehicleController): Router {
  const router = Router();

  router.post('/checkin', validateCheckIn, controller.checkIn);
  router.post('/checkout/:ticketId', controller.checkOut);
  router.get('/ticket/:ticketId', controller.getTicket);

  return router;
}
