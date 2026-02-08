import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NovaPoshtaAddress {
  @Field()
  name: string;

  @Field()
  ref: string;
}
