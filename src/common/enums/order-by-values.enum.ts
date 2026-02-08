import { registerEnumType } from '@nestjs/graphql';

export enum OrderByValues {
  ASC = 'asc',
  DESC = 'desc',
}

registerEnumType(OrderByValues, {
  name: 'OrderByValues',
  description: 'Possible values for ordering',
});
