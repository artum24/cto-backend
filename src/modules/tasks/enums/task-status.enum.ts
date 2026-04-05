import { registerEnumType } from '@nestjs/graphql';

export enum TaskStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Possible statuses for a task',
  valuesMap: {
    CREATED: { description: 'Task has been created' },
    IN_PROGRESS: { description: 'Task is currently in progress' },
    FINISHED: { description: 'Task has been completed' },
  },
});

/** Maps DB integer → GraphQL enum */
export const STATUS_INT_TO_ENUM: Record<number, TaskStatus> = {
  1: TaskStatus.CREATED,
  2: TaskStatus.IN_PROGRESS,
  3: TaskStatus.FINISHED,
};

/** Maps GraphQL enum → DB integer */
export const STATUS_ENUM_TO_INT: Record<TaskStatus, number> = {
  [TaskStatus.CREATED]: 1,
  [TaskStatus.IN_PROGRESS]: 2,
  [TaskStatus.FINISHED]: 3,
};
