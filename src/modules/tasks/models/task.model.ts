import { Field, ID, ObjectType } from '@nestjs/graphql';
import { TaskStatus } from '../enums/task-status.enum';

@ObjectType()
export class Task {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => TaskStatus)
  status!: TaskStatus;

  @Field(() => ID)
  vehicle_id!: string;

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}
