import { Field, ID, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class Report {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  job_id!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  data_errors?: any;

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}
