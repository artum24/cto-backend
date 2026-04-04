import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, MaxLength } from 'class-validator';

@InputType()
export class RecordDetailMovementInput {
  @Field(() => String)
  @IsString()
  detailId: string;

  @Field(() => Int)
  @IsInt()
  action_type: number;

  @Field(() => Int)
  @IsInt()
  count_diff: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  taskId?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string | null;
}
