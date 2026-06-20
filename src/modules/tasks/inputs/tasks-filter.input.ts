import {Field, ID, InputType, Int} from "@nestjs/graphql";
import {TaskStatus} from "@/modules/tasks/enums/task-status.enum";
import {IsOptional} from "class-validator";

@InputType()
export class TasksFilterInput {
    @Field(() => [ID], { nullable: true })
    @IsOptional()
    workspaceIds?: string[];

    @Field(() => [ID], { nullable: true })
    @IsOptional()
    performerIds?: string[];

    @Field(() => [TaskStatus], { nullable: true })
    @IsOptional()
    statuses?: TaskStatus[];

    @Field(() => Date, { nullable: true })
    @IsOptional()
    dateFrom?: Date;

    @Field(() => Date, { nullable: true })
    @IsOptional()
    dateTo?: Date;

    @Field(() => Int, { nullable: true, defaultValue: 1 })
    @IsOptional()
    page?: number;

    @Field(() => Int, { nullable: true, defaultValue: 30 })
    @IsOptional()
    limit?: number;
}
