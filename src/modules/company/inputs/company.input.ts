import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { CompanyType } from '@/modules/company/enums/company-type.enum';

@InputType()
export class CompanyInput {
  @Field()
  @IsString()
  @Length(3)
  title: string;

  @Field(() => CompanyType)
  @IsEnum(CompanyType)
  companyType: CompanyType;

  @Field()
  @IsString()
  @IsNotEmpty()
  city: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  cityRef: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  address: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  addressRef: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  houseNumber: string;
}
