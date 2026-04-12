import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { DetailHistoryActionType } from '../enums/detail-history-action-type.enum';
import { DetailHistoryUser } from './detail-history-user.model';

@ObjectType()
export class DetailHistory {
  @Field(() => ID)
  id!: string;

  @Field(() => DetailHistoryActionType, { name: 'actionType', nullable: true })
  action_type?: DetailHistoryActionType | null;

  @Field(() => Int, { name: 'countDiff', nullable: true })
  count_diff?: number | null;

  @Field(() => Int, { name: 'countResult', nullable: true })
  count_result?: number | null;

  @Field(() => String, { nullable: true })
  comment?: string | null;

  /** From DB; not in GraphQL schema (used by `DetailHistoryResolver.user`). */
  user_id?: string;

  @Field(() => DetailHistoryUser, { nullable: true })
  user?: DetailHistoryUser | null;

  @Field(() => ID, { name: 'taskId', nullable: true })
  task_id?: string | null;

  @Field(() => Date, { name: 'createdAt' })
  created_at!: Date;
}
