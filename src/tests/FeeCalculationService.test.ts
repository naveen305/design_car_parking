import { FeeCalculationService } from '../services/FeeCalculationService';
import { VehicleType } from '../models/enums';

describe('FeeCalculationService', () => {
  const service = new FeeCalculationService();

  // Helper: builds a Date offset by `minutes` from a base time
  const at = (base: Date, minutes: number) =>
    new Date(base.getTime() + minutes * 60 * 1000);

  const base = new Date('2024-01-01T10:00:00Z');

  describe('minimum charge (1 hour)', () => {
    it('charges minimum 1 hour for a 10-minute motorcycle stay', () => {
      const fee = service.calculate(base, at(base, 10), VehicleType.MOTORCYCLE);
      expect(fee).toBe(1.0); // 1hr × $1
    });

    it('charges minimum 1 hour for an instant check-out (0 minutes)', () => {
      const fee = service.calculate(base, base, VehicleType.CAR);
      expect(fee).toBe(2.0); // 1hr × $2
    });
  });

  describe('hourly rounding (ceiling)', () => {
    it('rounds 61 minutes up to 2 hours for a CAR', () => {
      const fee = service.calculate(base, at(base, 61), VehicleType.CAR);
      expect(fee).toBe(4.0); // 2hrs × $2
    });

    it('charges exactly 1 hour for 60 minutes', () => {
      const fee = service.calculate(base, at(base, 60), VehicleType.CAR);
      expect(fee).toBe(2.0); // 1hr × $2
    });

    it('rounds 90 minutes up to 2 hours for a BUS', () => {
      const fee = service.calculate(base, at(base, 90), VehicleType.BUS);
      expect(fee).toBe(10.0); // 2hrs × $5
    });
  });

  describe('rate differences by vehicle type', () => {
    const twoHours = at(base, 120);

    it('MOTORCYCLE: $1/hr → $2 for 2 hours', () => {
      expect(service.calculate(base, twoHours, VehicleType.MOTORCYCLE)).toBe(2.0);
    });

    it('CAR: $2/hr → $4 for 2 hours', () => {
      expect(service.calculate(base, twoHours, VehicleType.CAR)).toBe(4.0);
    });

    it('BUS: $5/hr → $10 for 2 hours', () => {
      expect(service.calculate(base, twoHours, VehicleType.BUS)).toBe(10.0);
    });
  });

  describe('error handling', () => {
    it('throws if exitTime is before entryTime', () => {
      expect(() =>
        service.calculate(at(base, 60), base, VehicleType.CAR)
      ).toThrow('Exit time cannot be before entry time');
    });
  });
});
