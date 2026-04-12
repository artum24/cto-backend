import { registerEnumType } from '@nestjs/graphql';

export enum DetailHistoryActionType {
  ARRIVAL = 1,
  OUTLAY = 2,
  CORRECTION = 3,
}

registerEnumType(DetailHistoryActionType, {
  name: 'DetailHistoryActionType',
  description: 'Possible detail history action types',
  valuesMap: {
    ARRIVAL: { description: 'detail arrival' },
    OUTLAY: { description: 'detail outlay' },
    CORRECTION: { description: 'detail correction' },
  },
});
