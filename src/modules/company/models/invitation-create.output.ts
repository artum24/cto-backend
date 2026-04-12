import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InvitationCreateOutput {
  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  error?: string | null;
}
