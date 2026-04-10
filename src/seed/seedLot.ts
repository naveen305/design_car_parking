import { v4 as uuidv4 } from 'uuid';
import { ISpotRepository } from '../repositories/interfaces/ISpotRepository';
import { ParkingSpot } from '../models/ParkingSpot';
import { SpotSize, SpotStatus } from '../models/enums';

/**
 * Floor layout configuration.
 * Each entry describes one floor's spot distribution.
 *
 * Design rationale:
 *  - Floor 1 (Ground): More MEDIUM (car) spots + some LARGE (bus) near the entrance
 *  - Floor 2         : Balanced mix — SMALL for motorcycles, MEDIUM for cars
 *  - Floor 3 (Top)   : Mostly SMALL + MEDIUM, fewer LARGE (buses rarely go to top floors)
 */
const FLOOR_LAYOUTS: Array<{
  floorNumber: number;
  spots: Array<{ size: SpotSize; count: number }>;
}> = [
  {
    floorNumber: 1,
    spots: [
      { size: SpotSize.SMALL, count: 5 },
      { size: SpotSize.MEDIUM, count: 10 },
      { size: SpotSize.LARGE, count: 5 },
    ],
  },
  {
    floorNumber: 2,
    spots: [
      { size: SpotSize.SMALL, count: 8 },
      { size: SpotSize.MEDIUM, count: 10 },
      { size: SpotSize.LARGE, count: 2 },
    ],
  },
  {
    floorNumber: 3,
    spots: [
      { size: SpotSize.SMALL, count: 10 },
      { size: SpotSize.MEDIUM, count: 8 },
      { size: SpotSize.LARGE, count: 2 },
    ],
  },
];

/**
 * Seeds the in-memory spot repository with a 3-floor parking lot.
 * Total spots: 60 (23 SMALL, 28 MEDIUM, 9 LARGE)
 *
 * @returns Total number of spots created
 */
export async function seedParkingLot(
  spotRepo: ISpotRepository
): Promise<number> {
  const spots: ParkingSpot[] = [];

  for (const floor of FLOOR_LAYOUTS) {
    let spotNumber = 1;
    for (const group of floor.spots) {
      for (let i = 0; i < group.count; i++) {
        spots.push({
          id: uuidv4(),
          floorNumber: floor.floorNumber,
          spotNumber: spotNumber++,
          size: group.size,
          status: SpotStatus.AVAILABLE,
        });
      }
    }
  }

  await spotRepo.saveBulk(spots);

  console.log(
    `[Seed] Parking lot initialised: ${spots.length} spots across ${FLOOR_LAYOUTS.length} floors`
  );

  // Print a summary table
  const summary: Record<SpotSize, number> = {
    [SpotSize.SMALL]: 0,
    [SpotSize.MEDIUM]: 0,
    [SpotSize.LARGE]: 0,
  };
  for (const s of spots) summary[s.size]++;
  console.table(summary);

  return spots.length;
}
