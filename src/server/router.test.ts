import { beforeEach, describe, expect, it } from "vitest";
import { createCaller } from "@/server/router";
import { createTaskStore } from "@/server/store";

let api: ReturnType<typeof createCaller>;

beforeEach(() => {
  api = createCaller({ store: createTaskStore() });
});

async function createMany(count: number) {
  for (let i = 1; i <= count; i++) {
    await api.create({ titulo: `Task ${i}` });
  }
}

describe("create", () => {
  it("generates id and dataCriacao and trims the title", async () => {
    const task = await api.create({ titulo: "  Study tRPC  " });

    expect(task.id).toBe(1);
    expect(task.titulo).toBe("Study tRPC");
    expect(new Date(task.dataCriacao).toISOString()).toBe(task.dataCriacao);
  });

  it.each(["", "   "])("rejects the title %j", async (titulo) => {
    await expect(api.create({ titulo })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("update", () => {
  it("changes the data, clears the description and preserves id and dataCriacao", async () => {
    const original = await api.create({ titulo: "Old", descricao: "Text" });

    const updated = await api.update({ id: original.id, titulo: "New", descricao: "" });

    expect(updated).toEqual({
      id: original.id,
      titulo: "New",
      descricao: undefined,
      dataCriacao: original.dataCriacao,
    });
  });

  it("returns NOT_FOUND for a missing task", async () => {
    await expect(api.update({ id: 99, titulo: "New" })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Task not found",
    });
  });
});

describe("delete", () => {
  it("removes the task", async () => {
    const { id } = await api.create({ titulo: "Remove me" });

    await api.delete({ id });

    await expect(api.getById({ id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns NOT_FOUND for a missing task", async () => {
    await expect(api.delete({ id: 99 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("list", () => {
  it("paginates from newest to oldest", async () => {
    await createMany(5);

    const firstPage = await api.list({ limit: 2 });
    const lastPage = await api.list({ limit: 3, cursor: firstPage.nextCursor });

    expect(firstPage.items.map((t) => t.id)).toEqual([5, 4]);
    expect(lastPage.items.map((t) => t.id)).toEqual([3, 2, 1]);
    expect(lastPage.nextCursor).toBeUndefined();
  });

  it("does not skip or repeat tasks when the cursor task is deleted", async () => {
    await createMany(5);
    const firstPage = await api.list({ limit: 2 });

    await api.delete({ id: firstPage.nextCursor! });
    const secondPage = await api.list({ limit: 2, cursor: firstPage.nextCursor });

    expect(secondPage.items.map((t) => t.id)).toEqual([3, 2]);
  });
});
