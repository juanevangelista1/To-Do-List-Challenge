import { beforeEach, describe, expect, it } from "vitest";
import { createCaller } from "@/server/router";
import { criarStore } from "@/server/store";

let api: ReturnType<typeof createCaller>;

beforeEach(() => {
  api = createCaller({ store: criarStore() });
});

async function criarVarias(quantidade: number) {
  for (let i = 1; i <= quantidade; i++) {
    await api.criar({ titulo: `Task ${i}` });
  }
}

describe("criar", () => {
  it("generates id and dataCriacao and trims the title", async () => {
    const tarefa = await api.criar({ titulo: "  Study tRPC  " });

    expect(tarefa.id).toBe(1);
    expect(tarefa.titulo).toBe("Study tRPC");
    expect(new Date(tarefa.dataCriacao).toISOString()).toBe(tarefa.dataCriacao);
  });

  it.each(["", "   "])("rejects the title %j", async (titulo) => {
    await expect(api.criar({ titulo })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("atualizar", () => {
  it("changes the data, clears the description and preserves id and dataCriacao", async () => {
    const original = await api.criar({ titulo: "Old", descricao: "Text" });

    const atualizada = await api.atualizar({ id: original.id, titulo: "New", descricao: "" });

    expect(atualizada).toEqual({
      id: original.id,
      titulo: "New",
      descricao: undefined,
      dataCriacao: original.dataCriacao,
    });
  });

  it("returns NOT_FOUND for a missing task", async () => {
    await expect(api.atualizar({ id: 99, titulo: "New" })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Task not found",
    });
  });
});

describe("deletar", () => {
  it("removes the task", async () => {
    const { id } = await api.criar({ titulo: "Remove me" });

    await api.deletar({ id });

    await expect(api.buscarPorId({ id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns NOT_FOUND for a missing task", async () => {
    await expect(api.deletar({ id: 99 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("listar", () => {
  it("paginates from newest to oldest", async () => {
    await criarVarias(5);

    const primeira = await api.listar({ limite: 2 });
    const ultima = await api.listar({ limite: 3, cursor: primeira.proximoCursor });

    expect(primeira.itens.map((t) => t.id)).toEqual([5, 4]);
    expect(ultima.itens.map((t) => t.id)).toEqual([3, 2, 1]);
    expect(ultima.proximoCursor).toBeUndefined();
  });

  it("does not skip or repeat tasks when the cursor task is deleted", async () => {
    await criarVarias(5);
    const primeira = await api.listar({ limite: 2 });

    await api.deletar({ id: primeira.proximoCursor! });
    const segunda = await api.listar({ limite: 2, cursor: primeira.proximoCursor });

    expect(segunda.itens.map((t) => t.id)).toEqual([3, 2]);
  });
});
