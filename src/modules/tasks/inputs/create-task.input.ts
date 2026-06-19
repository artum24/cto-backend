import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

@InputType()
export class CreateTaskInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field(() => ID)
  @IsNotEmpty()
  vehicle_id!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  workspace_id?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  performer_id?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  start_time?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  end_time?: Date;
}
