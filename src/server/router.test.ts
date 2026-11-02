import { beforeEach, describe, expect, it } from "vitest";
import { createCaller } from "@/server/router";
import { criarStore } from "@/server/store";

let api: ReturnType<typeof createCaller>;

beforeEach(() => {
  api = createCaller({ store: criarStore() });
});

async function criarVarias(quantidade: number) {
  for (let i = 1; i <= quantidade; i++) {
    await api.create({ titulo: `Task ${i}` });
  }
}

describe("create", () => {
  it("generates id and dataCriacao and trims the title", async () => {
    const tarefa = await api.create({ titulo: "  Study tRPC  " });

    expect(tarefa.id).toBe(1);
    expect(tarefa.titulo).toBe("Study tRPC");
    expect(new Date(tarefa.dataCriacao).toISOString()).toBe(tarefa.dataCriacao);
  });

  it.each(["", "   "])("rejects the title %j", async (titulo) => {
    await expect(api.create({ titulo })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("update", () => {
  it("changes the data, clears the description and preserves id and dataCriacao", async () => {
    const original = await api.create({ titulo: "Old", descricao: "Text" });

    const atualizada = await api.update({ id: original.id, titulo: "New", descricao: "" });

    expect(atualizada).toEqual({
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
    await criarVarias(5);

    const primeira = await api.list({ limit: 2 });
    const ultima = await api.list({ limit: 3, cursor: primeira.nextCursor });

    expect(primeira.items.map((t) => t.id)).toEqual([5, 4]);
    expect(ultima.items.map((t) => t.id)).toEqual([3, 2, 1]);
    expect(ultima.nextCursor).toBeUndefined();
  });

  it("does not skip or repeat tasks when the cursor task is deleted", async () => {
    await criarVarias(5);
    const primeira = await api.list({ limit: 2 });

    await api.delete({ id: primeira.nextCursor! });
    const segunda = await api.list({ limit: 2, cursor: primeira.nextCursor });

    expect(segunda.items.map((t) => t.id)).toEqual([3, 2]);
  });
});
