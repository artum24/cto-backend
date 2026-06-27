import { Field, InputType } from '@nestjs/graphql';
import { IsDecimal, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateServiceInput {
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
