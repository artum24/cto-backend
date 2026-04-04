import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  MaxLength,
  IsNumber,
} from 'class-validator';

@InputType()
export class UpdateDetailInput {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  article?: string | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  count?: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimum_count?: number | null;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sell_price?: number | null;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  buy_price?: number | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  category_id?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  suplier_id?: string | null;
}
