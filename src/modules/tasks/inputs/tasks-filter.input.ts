import {Field, ID, InputType} from "@nestjs/graphql";
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
}