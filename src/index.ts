import express from 'express';

// ── Repositories ──────────────────────────────────────────────────────────────
import { InMemoryVehicleRepository } from './repositories/InMemoryVehicleRepository';
import { InMemorySpotRepository } from './repositories/InMemorySpotRepository';
import { InMemoryTicketRepository } from './repositories/InMemoryTicketRepository';

// ── Services ──────────────────────────────────────────────────────────────────
import { FeeCalculationService } from './services/FeeCalculationService';
import { SpotAllocationService } from './services/SpotAllocationService';
import { CheckInService } from './services/CheckInService';
import { CheckOutService } from './services/CheckOutService';
import { ParkingLotService } from './services/ParkingLotService';

// ── Controllers ───────────────────────────────────────────────────────────────
import { VehicleController } from './controllers/VehicleController';
import { ParkingController } from './controllers/ParkingController';

// ── Routes ────────────────────────────────────────────────────────────────────
import { createVehicleRouter } from './routes/vehicle.routes';
import { createParkingRouter } from './routes/parking.routes';

// ── Middleware ────────────────────────────────────────────────────────────────
import { errorHandler } from './middleware/errorHandler';

// ── Seed ──────────────────────────────────────────────────────────────────────
import { seedParkingLot } from './seed/seedLot';

const PORT = process.env.PORT ?? 3000;

async function bootstrap(): Promise<void> {
  // 1. Instantiate repositories (data layer)
  const vehicleRepo = new InMemoryVehicleRepository();
  const spotRepo = new InMemorySpotRepository();
  const ticketRepo = new InMemoryTicketRepository();

  // 2. Seed the parking lot (creates 60 spots across 3 floors)
  await seedParkingLot(spotRepo);

  // 3. Instantiate services (business layer)
  const feeService = new FeeCalculationService();
  const allocationService = new SpotAllocationService(spotRepo);
  const checkInService = new CheckInService(vehicleRepo, ticketRepo, allocationService);
  const checkOutService = new CheckOutService(ticketRepo, allocationService, feeService);
  const lotService = new ParkingLotService(spotRepo, ticketRepo);

  // 4. Instantiate controllers (presentation layer)
  const vehicleController = new VehicleController(
    checkInService,
    checkOutService,
    ticketRepo,
    vehicleRepo
  );
  const parkingController = new ParkingController(
    lotService,
    allocationService,
    feeService
  );

  // 5. Build Express app
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount routers
  app.use('/api/v1/vehicles', createVehicleRouter(vehicleController));
  app.use('/api/v1/parking', createParkingRouter(parkingController));

  // 404 handler (must come after all valid routes)
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { message: 'Route not found', statusCode: 404 } });
  });

  // Global error handler (must be last middleware)
  app.use(errorHandler);

  // 6. Start server
  app.listen(PORT, () => {
    console.log(`\n🚗  Smart Parking Lot API running on http://localhost:${PORT}`);
    console.log(`    Health : GET  http://localhost:${PORT}/health`);
    console.log(`    Check-in : POST http://localhost:${PORT}/api/v1/vehicles/checkin`);
    console.log(`    Check-out: POST http://localhost:${PORT}/api/v1/vehicles/checkout/:ticketId`);
    console.log(`    Availability: GET  http://localhost:${PORT}/api/v1/parking/availability\n`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
