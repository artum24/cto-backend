import {Field, ID, Int, ObjectType} from "@nestjs/graphql";
import {TaskStatus} from "@/modules/tasks/enums/task-status.enum";
import {Vehicle} from "@/modules/vehicle/models/vehicle.model";
import {Workspace} from "@/modules/workspaces/models/workspaces.model";
import {User} from "@/modules/user/models/user.model";
import {VehicleHistory} from "@/modules/vehicle-history/models/vehicle-history.model";
import {DetailHistory} from "@/modules/details/models/detail-history.model";

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

    @Field(() => User, { nullable: true })
    performer?: User | null;

    @Field(() => [VehicleHistory], { nullable: true })
    vehicleHistories?: VehicleHistory[] | null;

    @Field(() => [DetailHistory], { nullable: true })
    detailHistories?: DetailHistory[] | null;

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
