import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class InviteMemberInput {
  @Field(() => String)
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
