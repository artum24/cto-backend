import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

@InputType()
export class CreateClientInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string | null;

  @Field(() => String)
  @IsString()
  @Length(10, 13, {
    message: 'Phone must be 10–13 digits (optionally with country code)',
  })
  @Matches(/^[0-9+\s\-()]+$/, {
    message: 'Phone can only contain digits, spaces, +, -, (, )',
  })
  phone: string;
}
