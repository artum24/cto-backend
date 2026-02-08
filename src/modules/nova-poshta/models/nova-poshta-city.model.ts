import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NovaPoshtaCity {
  @Field()
  name: string;

  @Field()
  ref: string;
}
