import { registerEnumType } from '@nestjs/graphql';

export enum CompanyType {
  CTO = 'cto',
  TIRE_SERVICE = 'tire_service',
  CAR_WASH = 'car_wash',
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
