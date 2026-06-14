import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

@InputType()
export class UpdateClientInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone number is too long' })
  @Matches(/^[0-9+\s\-()]+$/, {
    message: 'Phone can only contain digits, spaces, +, -, (, )',
  })
  @Matches(/(?:.*\d){10}/, {
    message: 'Phone must contain at least 10 digits',
  })
  phone?: string | null;
}
