import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { Category } from '@/modules/categories/models/category.model';
import { Suplier } from '@/modules/supliers/models/suplier.model';
import { DetailStatuses } from '../enums/detail-statuses.enum';

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

  @Field(() => Int, { nullable: true, name: 'minimumCount' })
  minimum_count?: number | null;

  @Field(() => Float, { nullable: true, name: 'sellPrice' })
  sell_price?: number | null;

  @Field(() => Float, { nullable: true, name: 'buyPrice' })
  buy_price?: number | null;

  @Field(() => ID, { nullable: true })
  category_id?: string | null;

  @Field(() => ID, { nullable: true })
  suplier_id?: string | null;

  @Field(() => ID, { name: 'storageId' })
  storage_id!: string;

  @Field(() => Date, { name: 'createdAt' })
  created_at!: Date;

  @Field(() => Date, { name: 'updatedAt' })
  updated_at!: Date;

  @Field(() => Boolean)
  archived!: boolean;

  @Field(() => Date, { name: 'archivedAt', nullable: true })
  archived_at?: Date | null;

  // computed via @ResolveField in DetailsResolver
  @Field(() => DetailStatuses, { nullable: true })
  status?: DetailStatuses | null;

  @Field(() => Category, { nullable: true })
  category?: Category | null;

  @Field(() => Suplier, { nullable: true })
  suplier?: Suplier | null;
}
