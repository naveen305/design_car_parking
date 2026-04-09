import { VehicleType } from '../models/enums';

/**
 * Parking fee rates per vehicle type (in USD per hour).
 * Using the Strategy pattern — swap this map or inject a different
 * IFeeStrategy implementation to change pricing without touching other logic.
 */
const HOURLY_RATES: Record<VehicleType, number> = {
  [VehicleType.MOTORCYCLE]: 1.0,
  [VehicleType.CAR]: 2.0,
  [VehicleType.BUS]: 5.0,
};

/** Minimum billing duration: 1 hour */
const MINIMUM_HOURS = 1;

/**
 * Calculates parking fees based on duration and vehicle type.
 *
 * Fee formula:
 *   billableHours = max(ceil((exitTime - entryTime) / ms_per_hour), MINIMUM_HOURS)
 *   fee = billableHours * HOURLY_RATES[vehicleType]
 */
export class FeeCalculationService {
  /**
   * @param entryTime  - When the vehicle entered the lot
   * @param exitTime   - When the vehicle is exiting the lot
   * @param vehicleType - The type of vehicle (determines rate)
   * @returns Calculated fee in USD
   */
  calculate(entryTime: Date, exitTime: Date, vehicleType: VehicleType): number {
    const durationMs = exitTime.getTime() - entryTime.getTime();
    if (durationMs < 0) {
      throw new Error('Exit time cannot be before entry time');
    }

    const MS_PER_HOUR = 1000 * 60 * 60;
    const rawHours = durationMs / MS_PER_HOUR;
    const billableHours = Math.max(Math.ceil(rawHours), MINIMUM_HOURS);
    const rate = HOURLY_RATES[vehicleType];

    return parseFloat((billableHours * rate).toFixed(2));
  }

  /** Expose rates for informational APIs */
  getRates(): Record<VehicleType, number> {
    return { ...HOURLY_RATES };
  }
}
