import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { VehicleType } from '../models/enums';

/**
 * Validates the body of POST /vehicles/checkin requests.
 * Ensures licensePlate is a non-empty string and vehicleType is a known enum value.
 */
export function validateCheckIn(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { licensePlate, vehicleType } = req.body as Record<string, unknown>;

  if (
    typeof licensePlate !== 'string' ||
    licensePlate.trim().length === 0
  ) {
    return next(
      new AppError('`licensePlate` must be a non-empty string', 400)
    );
  }

  const validTypes = Object.values(VehicleType) as string[];
  if (typeof vehicleType !== 'string' || !validTypes.includes(vehicleType)) {
    return next(
      new AppError(
        `\`vehicleType\` must be one of: ${validTypes.join(', ')}`,
        400
      )
    );
  }

  next();
}
