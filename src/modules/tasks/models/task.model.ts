import { Field, ID, ObjectType } from '@nestjs/graphql';
import { TaskStatus } from '../enums/task-status.enum';
import {Vehicle} from "@/modules/vehicle/models/vehicle.model";
import {Workspace} from "@/modules/workspaces/models/workspaces.model";
import {User} from "@/modules/user/models/user.model";

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

  @Field(() => Vehicle, { nullable: true })
  vehicle?: Vehicle | null;

  @Field(() => ID, { nullable: true })
  workspace_id?: string | null;

  @Field(() => Workspace, { nullable: true })
  workspace?: Workspace | null;

  @Field(() => ID, { nullable: true })
  performer_id?: string | null;

  @Field(() => User, { nullable: true })
  performer?: User | null;

  @Field(() => Date, { nullable: true })
  start_time?: Date | null;

  @Field(() => Date, { nullable: true })
  end_time?: Date | null;

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}

@ObjectType()
export class TasksByDate {
  @Field(() => String)
  date!: string;

  @Field(() => Number)
  count!: number;

  @Field(() => [Task])
  tasks!: Task[];
}
