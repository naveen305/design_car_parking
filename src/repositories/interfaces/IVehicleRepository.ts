import { Vehicle } from '../../models/Vehicle';

/**
 * Repository interface for Vehicle persistence.
 * Implementations can use in-memory, SQL, NoSQL, etc.
 */
export interface IVehicleRepository {
  save(vehicle: Vehicle): Promise<Vehicle>;
  findById(id: string): Promise<Vehicle | null>;
  findByLicensePlate(licensePlate: string): Promise<Vehicle | null>;
  findAll(): Promise<Vehicle[]>;
}
