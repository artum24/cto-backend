import { Field, ID, InputType } from '@nestjs/graphql';
import { IsDecimal, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class UpdateServiceInput {
  @Field(() => ID)
  @IsNotEmpty()
  id!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDecimal()
  price?: string;
}
