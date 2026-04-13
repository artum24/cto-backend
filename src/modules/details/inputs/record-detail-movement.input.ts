import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsInt, MaxLength } from 'class-validator';
import { DetailHistoryActionType } from '../enums/detail-history-action-type.enum';

@InputType()
export class RecordDetailMovementInput {
  @Field(() => String)
  @IsString()
  detailId: string;

  @Field(() => DetailHistoryActionType)
  @IsEnum(DetailHistoryActionType)
  action_type: DetailHistoryActionType;

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
