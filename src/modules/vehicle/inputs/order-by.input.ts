import { Field, InputType } from '@nestjs/graphql';
import { OrderByValues } from '../../../common/enums/order-by-values.enum';

@InputType()
class ClientOrderInput {
  @Field(() => OrderByValues, { nullable: true })
  name?: OrderByValues;
}

@InputType()
class VehicleOrderInput {
  @Field(() => OrderByValues, { nullable: true })
  vehicle_year?: OrderByValues;

  @Field(() => OrderByValues, { nullable: true })
  vehicle_distance?: OrderByValues;
}

@InputType()
export class OrderByInput {
  @Field(() => ClientOrderInput, { nullable: true })
  client?: ClientOrderInput;

  @Field(() => VehicleOrderInput, { nullable: true })
  vehicle?: VehicleOrderInput;
}
