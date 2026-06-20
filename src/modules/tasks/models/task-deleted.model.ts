import {Field, ID, ObjectType} from "@nestjs/graphql";

@ObjectType()
export class TaskDeletedPayload {
    @Field(() => ID)
    id: string;

    @Field()
    companyId: string;
}