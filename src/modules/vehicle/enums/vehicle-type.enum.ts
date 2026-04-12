import { registerEnumType } from '@nestjs/graphql';

// Integer values match DB storage (vehicle_type column is Int)
// Mapped from Rails VehicleTypeEnum concern
export enum VehicleType {
  MOTO = 1,
  CAR = 2,
  TRUCK = 3,
  BUS = 5,
  TRAILER = 6,
  MPV = 7,
  LSV = 9,
  INCOMPLETE = 10,
  OFF_ROAD = 13,
}

registerEnumType(VehicleType, {
  name: 'VehicleType',
  description: 'Possible vehicle types',
  valuesMap: {
    MOTO: { description: 'motorcycle type' },
    CAR: { description: 'passenger car type' },
    TRUCK: { description: 'truck type' },
    BUS: { description: 'bus type' },
    TRAILER: { description: 'trailer type' },
    MPV: { description: 'mpv type' },
    LSV: { description: 'lsv type' },
    INCOMPLETE: { description: 'incomplete vehicle type' },
    OFF_ROAD: { description: 'off-road vehicle type' },
  },
});
