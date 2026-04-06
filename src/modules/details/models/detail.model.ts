import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Category } from '@/modules/categories/models/category.model';
import { Suplier } from '@/modules/supliers/models/suplier.model';

@ObjectType()
export class Detail {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => String, { nullable: true })
  article?: string | null;

  @Field(() => Int, { nullable: true })
  count?: number | null;

  @Field(() => Int, { nullable: true })
  minimum_count?: number | null;

  @Field(() => Float, { nullable: true })
  sell_price?: number | null;

  @Field(() => Float, { nullable: true })
  buy_price?: number | null;

  @Field(() => ID, { nullable: true })
  category_id?: string | null;

  @Field(() => ID, { nullable: true })
  suplier_id?: string | null;

  @Field(() => ID)
  storage_id!: string;

  @Field(() => Boolean)
  archived!: boolean;

  @Field(() => Category, { nullable: true })
  category?: Category | null;

  @Field(() => Suplier, { nullable: true })
  suplier?: Suplier | null;
}
