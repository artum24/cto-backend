import {Field, ID, Int, ObjectType} from "@nestjs/graphql";
import {TaskStatus} from "@/modules/tasks/enums/task-status.enum";

@ObjectType()
export class Vehicle {
    @Field(() => ID)
    id!: string;

    @Field(() => String, { nullable: true })
    vehicleMakeName?: string | null;

    @Field(() => String, { nullable: true })
    vehicleModelName?: string | null;

    @Field(() => Int, { nullable: true })
    vehicleYear?: number | null;

    @Field(() => Client, { nullable: true })
    client?: Client | null;
}

@ObjectType()
export class Client {
    @Field(() => ID)
    id!: string;

    @Field(() => String, { nullable: true })
    name?: string | null;

    @Field(() => String, { nullable: true })
    phone?: string | null;
}

@ObjectType()
export class Workspace {
    @Field(() => ID)
    id!: string;

    @Field(() => String, { nullable: true })
    title?: string | null;

    @Field(() => Number, { nullable: true })
    number?: number | null;
}

@ObjectType()
export class Performer {
    @Field(() => ID)
    id!: string;

    @Field(() => String, { nullable: true })
    email?: string | null;
}

@ObjectType()
export class Task {
    @Field(() => ID)
    id!: string;

    @Field(() => String, { nullable: true })
    title?: string | null;

    @Field(() => TaskStatus)
    status!: TaskStatus;

    @Field(() => Date, { nullable: true })
    start_time?: Date | null;

    @Field(() => Date, { nullable: true })
    end_time?: Date | null;

    @Field(() => ID, { nullable: true })
    workspace_id?: string | null;

    @Field(() => ID, { nullable: true })
    performer_id?: string | null;

    @Field(() => Vehicle, { nullable: true })
    vehicle?: Vehicle | null;

    @Field(() => Workspace, { nullable: true })
    workspace?: Workspace | null;

    @Field(() => Performer, { nullable: true })
    performer?: Performer | null;

    @Field(() => Date)
    created_at!: Date;

    @Field(() => Date)
    updated_at!: Date;

    @Field(() => ID)
    vehicle_id!: string;

    companyId?: string | null;
}

@ObjectType()
export class TasksByDate {
    @Field(() => String)
    date!: string;

    @Field(() => Number)
    count!: number;

    @Field(() => [Task])
    tasks!: Task[];
}

@ObjectType()
export class AllTasksResult {
    @Field(() => [TasksByDate])
    groups!: TasksByDate[];

    @Field(() => Int)
    totalCount!: number;

    @Field(() => Int)
    totalPages!: number;

    @Field(() => Int)
    page!: number;
}
