import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VehicleHistory {
  @Field(() => ID)
  id!: string;

  @Field(() => Int, { nullable: true })
  distance?: number | null;

  @Field(() => String, { nullable: true })
  status?: string | null;

  @Field(() => ID)
  task_id!: string;

  @Field(() => ID)
  service_id!: string;

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}
