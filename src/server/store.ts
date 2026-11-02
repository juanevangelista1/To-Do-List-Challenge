import type { TaskData } from "@/lib/task-schema";
import { sampleTasks } from "@/server/sample-tasks";

export type Task = TaskData & {
  id: number;
  dataCriacao: string;
};

export function createTaskStore(initialTasks: TaskData[] = []) {
  const tasks = new Map<number, Task>();
  let lastId = 0;

  function create(data: TaskData) {
    const task: Task = {
      ...data,
      id: ++lastId,
      dataCriacao: new Date().toISOString(),
    };
    tasks.set(task.id, task);
    return task;
  }

  initialTasks.forEach(create);

  return {
    create,
    list(limit: number, cursor?: number) {
      const candidates = [...tasks.values()]
        .reverse()
        .filter((task) => cursor === undefined || task.id < cursor);
      const items = candidates.slice(0, limit);
      return {
        items,
        nextCursor: candidates.length > limit ? items.at(-1)?.id : undefined,
      };
    },
    find(id: number) {
      return tasks.get(id);
    },
    update(id: number, data: TaskData) {
      const current = tasks.get(id);
      if (!current) return undefined;
      const updated: Task = {
        id: current.id,
        dataCriacao: current.dataCriacao,
        ...data,
      };
      tasks.set(id, updated);
      return updated;
    },
    remove(id: number) {
      return tasks.delete(id);
    },
  };
}

export type TaskStore = ReturnType<typeof createTaskStore>;

const globalScope = globalThis as typeof globalThis & {
  taskStore?: TaskStore;
};

export const taskStore = (globalScope.taskStore ??= createTaskStore(sampleTasks));
