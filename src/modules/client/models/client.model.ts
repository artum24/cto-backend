import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Vehicle } from '@/modules/vehicle/models/vehicle.model';

@ObjectType()
export class Client {
  @Field(() => ID)
  id!: number;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => Date, { name: 'createdAt' })
  created_at!: Date;

  @Field(() => Date, { name: 'updatedAt' })
  updated_at!: Date;

  @Field(() => Boolean)
  archived!: boolean;

  @Field(() => ID)
  company_id!: string;

  @Field(() => [Vehicle], { nullable: 'itemsAndList' })
  vehicles?: Vehicle[];
}
