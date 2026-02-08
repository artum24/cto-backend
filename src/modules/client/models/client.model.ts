import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Vehicle } from '../../vehicle/models/vehicle.model';

@ObjectType()
export class Client {
  @Field(() => ID)
  id!: number;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String)
  created_at!: string;

  @Field(() => String)
  updated_at!: string;

  @Field(() => Boolean)
  archived!: boolean;

  @Field(() => ID)
  company_id!: string;

  @Field(() => [Vehicle], { nullable: 'itemsAndList' })
  vehicles?: Vehicle[];
}
