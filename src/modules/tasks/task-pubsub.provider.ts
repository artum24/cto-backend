export const TASK_PUB_SUB = 'TASK_PUB_SUB';

/**
 * Simple in-memory PubSub compatible with graphql-ws.
 * graphql-subscriptions v3 removed asyncIterableIterator — this replaces it.
 */
export class TaskPubSub {
  private listeners = new Map<string, Set<(payload: unknown) => void>>();

  publish(trigger: string, payload: unknown): void {
    this.listeners.get(trigger)?.forEach((fn) => fn(payload));
  }

  asyncIterableIterator<T>(trigger: string): AsyncIterableIterator<T> {
    const queue: T[] = [];
    const resolvers: Array<(value: IteratorResult<T>) => void> = [];

    const listener = (payload: T) => {
      if (resolvers.length > 0) {
        resolvers.shift()!({ value: payload, done: false });
      } else {
        queue.push(payload);
      }
    };

    if (!this.listeners.has(trigger)) {
      this.listeners.set(trigger, new Set());
    }
    this.listeners.get(trigger)!.add(listener as (p: unknown) => void);

    const iterator: AsyncIterableIterator<T> = {
      [Symbol.asyncIterator]() {
        return this;
      },
      next(): Promise<IteratorResult<T>> {
        if (queue.length > 0) {
          return Promise.resolve({ value: queue.shift()!, done: false });
        }
        return new Promise<IteratorResult<T>>((resolve) => resolvers.push(resolve));
      },
      return(): Promise<IteratorResult<T>> {
        this.listeners?.get(trigger)?.delete(listener as (p: unknown) => void);
        resolvers.forEach((r) => r({ value: undefined as unknown as T, done: true }));
        return Promise.resolve({ value: undefined as unknown as T, done: true });
      },
    };

    // Keep reference to listeners for cleanup in return()
    (iterator as unknown as { listeners: typeof this.listeners }).listeners = this.listeners;

    return iterator;
  }
}

export const TaskPubSubProvider = {
  provide: TASK_PUB_SUB,
  useValue: new TaskPubSub(),
};
