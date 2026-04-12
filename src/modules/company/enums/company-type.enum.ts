import { registerEnumType } from '@nestjs/graphql';

export enum CompanyType {
  CTO = 1,
  TIRE_SERVICE = 2,
  CAR_WASH = 3,
}

registerEnumType(CompanyType, {
  name: 'CompanyType',
  description: 'Possible company types',
  valuesMap: {
    CTO: { description: 'service station' },
    TIRE_SERVICE: { description: 'tire service' },
    CAR_WASH: { description: 'car wash' },
  },
});
