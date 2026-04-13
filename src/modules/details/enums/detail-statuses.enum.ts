import { registerEnumType } from '@nestjs/graphql';

export enum DetailStatuses {
  OUT_OF_STOCK = 'out_of_stock',
  LOW_STOCK = 'low_stock',
  IN_STOCK = 'in_stock',
}

registerEnumType(DetailStatuses, {
  name: 'DetailStatuses',
  description: 'Possible detail statuses based on stock level',
  valuesMap: {
    OUT_OF_STOCK: { description: 'Count is 0' },
    LOW_STOCK: { description: 'Count is below minimum' },
    IN_STOCK: { description: 'Count meets or exceeds minimum' },
  },
});
