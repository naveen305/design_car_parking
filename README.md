# 🚗 Smart Parking Lot — Low-Level Design (TypeScript)

A fully-typed, production-patterned backend implementation of a smart parking lot system.

---

## Features

| Requirement | Implementation |
|---|---|
| Parking spot allocation by vehicle size | `SpotAllocationService` — greedy nearest-first with Mutex |
| Check-in / Check-out with timestamps | `CheckInService` + `CheckOutService` |
| Fee calculation (duration × vehicle rate) | `FeeCalculationService` — ceiling-based billing |
| Real-time availability updates | `ParkingLotService` — queryable after every operation |
| Concurrency handling | `async-mutex` per-allocation global lock |
| Double check-in prevention | Active-ticket guard in `CheckInService` |

---

## Architecture

```
src/
├── models/           # Domain interfaces (Vehicle, ParkingSpot, ParkingTicket …)
├── repositories/
│   ├── interfaces/   # IVehicleRepository, ISpotRepository, ITicketRepository
│   └── InMemory*.ts  # In-memory Map-based implementations
├── services/
│   ├── SpotAllocationService.ts   # Greedy allocation + Mutex concurrency
│   ├── CheckInService.ts          # Entry orchestration
│   ├── CheckOutService.ts         # Exit + fee orchestration
│   ├── FeeCalculationService.ts   # Duration × rate billing
│   └── ParkingLotService.ts       # Real-time availability aggregation
├── controllers/      # VehicleController, ParkingController
├── routes/           # vehicle.routes.ts, parking.routes.ts
├── middleware/        # errorHandler.ts, validate.ts
├── errors/            # AppError (carries HTTP status code)
├── seed/              # seedLot.ts — 3 floors, 60 spots
└── index.ts           # Bootstrap + manual DI wiring
```

---

## Vehicle → Spot Compatibility

| Vehicle Type | Compatible Spot Sizes (preference order) |
|---|---|
| MOTORCYCLE | SMALL → MEDIUM |
| CAR | MEDIUM → LARGE |
| BUS | LARGE only |

---

## Fee Rates

| Vehicle | Rate |
|---|---|
| MOTORCYCLE | $1.00 / hour |
| CAR | $2.00 / hour |
| BUS | $5.00 / hour |

**Billing rules:** Ceiling-based hourly rounding. Minimum charge: 1 hour.

---

## Quickstart

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Type-check without building
npm run type-check

# Run all unit tests
npm test
```

Server starts at **http://localhost:3000**

---

## API Reference

### Vehicle Endpoints

```
POST /api/v1/vehicles/checkin
Body: { "licensePlate": "KA01AB1234", "vehicleType": "CAR" }

POST /api/v1/vehicles/checkout/:ticketId

GET  /api/v1/vehicles/ticket/:ticketId
```

### Parking Lot Endpoints

```
GET /api/v1/parking/availability      # Real-time counts + per-floor breakdown
GET /api/v1/parking/spots             # All spots with status
GET /api/v1/parking/floors            # Spots by floor
GET /api/v1/parking/rates             # Fee rates per vehicle type
GET /api/v1/parking/compatibility     # Vehicle→spot compatibility matrix
GET /api/v1/parking/active-tickets    # All open parking sessions
```

---

## Example: Full Check-In → Check-Out Flow

```bash
# 1. Check in a CAR
curl -s -X POST http://localhost:3000/api/v1/vehicles/checkin \
  -H "Content-Type: application/json" \
  -d '{"licensePlate":"KA01AB9999","vehicleType":"CAR"}' | jq .

# 2. Check out using the ticketId returned above
curl -s -X POST http://localhost:3000/api/v1/vehicles/checkout/<ticketId> | jq .

# 3. Verify availability updated
curl -s http://localhost:3000/api/v1/parking/availability | jq .
```

---

## Concurrency Design

```
Thread 1 (check-in)          Thread 2 (check-in)
       │                             │
       ├── acquire Mutex ────────────┤ (blocked)
       ├── findAvailableBySize()     │
       ├── updateStatus(OCCUPIED)    │
       └── release Mutex ────────────┤
                                     ├── acquire Mutex
                                     ├── findAvailableBySize()
                                     ├── updateStatus(OCCUPIED)
                                     └── release Mutex
```

The find-and-mark operation is wrapped in a single Mutex, preventing TOCTOU races where two concurrent requests could observe the same "available" spot.

---

## Data Model

```
ParkingLot
  └── ParkingFloor[]
        └── ParkingSpot[]   ← size, status, vehicleId

ParkingTicket
  ├── vehicle: Vehicle
  ├── spot: ParkingSpot
  ├── entryTime: Date
  ├── exitTime?: Date
  ├── fee?: number
  └── isPaid: boolean
```

---

## Running Tests

```bash
npm test
```

Test coverage:
- `FeeCalculationService.test.ts` — minimum charge, ceiling rounding, all rates, error case
- `SpotAllocationService.test.ts` — compatibility rules, nearest-first ordering, lifecycle, concurrency
