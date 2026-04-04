import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DetailHistory {
  @Field(() => ID)
  id!: string;

  @Field(() => Int, { nullable: true })
  action_type?: number | null;

  @Field(() => Int, { nullable: true })
  count_diff?: number | null;

  @Field(() => Int, { nullable: true })
  count_result?: number | null;

  @Field(() => String, { nullable: true })
  comment?: string | null;

  @Field(() => ID)
  user_id!: string;

  @Field(() => ID)
  detail_id!: string;

  @Field(() => ID, { nullable: true })
  task_id?: string | null;

  @Field(() => ID)
  storage_id!: string;
}
