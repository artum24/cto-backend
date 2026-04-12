import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { DetailHistoryActionType } from '../enums/detail-history-action-type.enum';
import { DetailHistoryUser } from './detail-history-user.model';

@ObjectType()
export class DetailHistory {
  @Field(() => ID)
  id!: string;

  @Field(() => DetailHistoryActionType)
  action_type!: DetailHistoryActionType;

  @Field(() => Int)
  count_diff!: number;

  @Field(() => Int)
  count_result!: number;

  @Field(() => String, { nullable: true })
  comment?: string | null;

  @Field(() => ID)
  user_id!: string;

  @Field(() => DetailHistoryUser, { nullable: true })
  user?: DetailHistoryUser | null;

  @Field(() => ID)
  detail_id!: string;

  @Field(() => ID, { nullable: true })
  task_id?: string | null;

  @Field(() => ID)
  storage_id!: string;

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}
