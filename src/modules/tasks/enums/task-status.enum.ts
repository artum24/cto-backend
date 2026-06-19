import { registerEnumType } from '@nestjs/graphql';

export enum TaskStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  OVERDUE = 'OVERDUE',
}

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Possible statuses for a task',
  valuesMap: {
    CREATED: { description: 'Task has been created (Заплановано)' },
    IN_PROGRESS: { description: 'Task is currently in progress (В роботі)' },
    FINISHED: { description: 'Task has been completed (Виконано)' },
    OVERDUE: { description: 'Task is past its end time and not finished (Прострочено)' },
  },
});

/** Maps DB integer → GraphQL enum (OVERDUE is computed, not stored) */
export const STATUS_INT_TO_ENUM: Record<number, TaskStatus> = {
  1: TaskStatus.CREATED,
  2: TaskStatus.IN_PROGRESS,
  3: TaskStatus.FINISHED,
};

/** Maps GraphQL enum → DB integer (OVERDUE is not writable directly) */
export const STATUS_ENUM_TO_INT: Record<TaskStatus, number> = {
  [TaskStatus.CREATED]: 1,
  [TaskStatus.IN_PROGRESS]: 2,
  [TaskStatus.FINISHED]: 3,
  [TaskStatus.OVERDUE]: 1, // fallback — should not be set directly
};
