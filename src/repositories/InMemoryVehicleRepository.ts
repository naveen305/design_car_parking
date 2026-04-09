import { Vehicle } from '../models/Vehicle';
import { IVehicleRepository } from './interfaces/IVehicleRepository';

/**
 * In-memory implementation of IVehicleRepository using a Map.
 * Thread-safe for single-process Node.js runtime (event loop is single-threaded).
 * Swap this out with a Prisma/TypeORM implementation for production.
 */
export class InMemoryVehicleRepository implements IVehicleRepository {
  private readonly store = new Map<string, Vehicle>();
  private readonly plateIndex = new Map<string, string>(); // licensePlate → vehicleId

  async save(vehicle: Vehicle): Promise<Vehicle> {
    this.store.set(vehicle.id, { ...vehicle });
    this.plateIndex.set(vehicle.licensePlate.toUpperCase(), vehicle.id);
    return vehicle;
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.store.get(id) ?? null;
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const id = this.plateIndex.get(licensePlate.toUpperCase());
    if (!id) return null;
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<Vehicle[]> {
    return [...this.store.values()];
  }
}
