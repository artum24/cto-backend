import { PubSub } from 'graphql-subscriptions';

export const TASK_PUB_SUB = 'TASK_PUB_SUB';

export const TaskPubSubProvider = {
    provide: TASK_PUB_SUB,
    useValue: new PubSub(),
};