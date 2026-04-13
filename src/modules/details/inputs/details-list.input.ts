import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max, IsEnum, IsBoolean } from 'class-validator';
import { DetailStatuses } from '../enums/detail-statuses.enum';

@InputType()
export class DetailsListInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  categoryId?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  suplierId?: string | null;

  @Field(() => DetailStatuses, { nullable: true })
  @IsOptional()
  @IsEnum(DetailStatuses)
  status?: DetailStatuses | null;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  archived?: boolean | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  search?: string | null;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;
}
