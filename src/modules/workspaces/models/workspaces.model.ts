import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Workspace {
    @Field(() => ID)
    id!: bigint;

    @Field(() => String, { nullable: true })
    title?: string | null;

    @Field(() => Number, { nullable: true })
    number?: number | null;

    @Field(() => ID)
    company_id!: bigint;
}