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
    let done = false;

    const listener = (payload: T) => {
      if (done) return;
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

    const cleanup = () => {
      done = true;
      this.listeners.get(trigger)?.delete(listener as (p: unknown) => void);
      // Clean up empty sets to avoid memory growth
      if (this.listeners.get(trigger)?.size === 0) {
        this.listeners.delete(trigger);
      }
      resolvers.forEach((r) => r({ value: undefined as unknown as T, done: true }));
      resolvers.length = 0;
    };

    const iterator: AsyncIterableIterator<T> = {
      [Symbol.asyncIterator]() {
        return this;
      },
      next(): Promise<IteratorResult<T>> {
        if (done) return Promise.resolve({ value: undefined as unknown as T, done: true });
        if (queue.length > 0) {
          return Promise.resolve({ value: queue.shift()!, done: false });
        }
        return new Promise<IteratorResult<T>>((resolve) => resolvers.push(resolve));
      },
      return(): Promise<IteratorResult<T>> {
        cleanup();
        return Promise.resolve({ value: undefined as unknown as T, done: true });
      },
      throw(e?: unknown): Promise<IteratorResult<T>> {
        cleanup();
        return Promise.reject(e);
      },
    };

    return iterator;
  }
}

export const TaskPubSubProvider = {
  provide: TASK_PUB_SUB,
  useValue: new TaskPubSub(),
};
