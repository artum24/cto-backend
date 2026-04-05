import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

@InputType()
export class UpdateTaskInput {
  @Field(() => ID)
  @IsNotEmpty()
  id!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  vehicle_id?: string;
}
