import { Field, ObjectType } from '@nestjs/graphql';
import { Vehicle } from './vehicle.model';
import { Client } from '@/modules/client/models/client.model';

@ObjectType()
export class VehicleUpdateOutput {
  @Field(() => Vehicle, { nullable: true })
  vehicle?: Vehicle | null;

  @Field(() => Client, { nullable: true })
  client?: Client | null;
}
