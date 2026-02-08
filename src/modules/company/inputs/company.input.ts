import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { CompanyType } from '../enums/company-type.enum';

@InputType()
export class CompanyInput {
  @Field()
  @IsString()
  @Length(3)
  title: string;

  @Field(() => CompanyType)
  @IsEnum(CompanyType)
  company_type: CompanyType;

  @Field()
  @IsString()
  @IsNotEmpty()
  city: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  city_ref: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  address: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  address_ref: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  house_number: string;
}
