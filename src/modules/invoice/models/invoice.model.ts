import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Invoice {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  task_id!: string;

  @Field(() => Float)
  total_amount!: number;

  @Field(() => String, { nullable: true })
  pdf_url?: string | null;

  @Field()
  created_at!: Date;

  @Field()
  updated_at!: Date;
}
