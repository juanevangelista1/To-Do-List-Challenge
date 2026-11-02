import { beforeEach, describe, expect, it } from "vitest";
import { createCaller } from "@/server/router";
import { criarStore } from "@/server/store";

let api: ReturnType<typeof createCaller>;

beforeEach(() => {
  api = createCaller({ store: criarStore() });
});

async function criarVarias(quantidade: number) {
  for (let i = 1; i <= quantidade; i++) {
    await api.criar({ titulo: `Tarefa ${i}` });
  }
}

describe("criar", () => {
  it("gera id e dataCriacao e remove espaços do título", async () => {
    const tarefa = await api.criar({ titulo: "  Estudar tRPC  " });

    expect(tarefa.id).toBe(1);
    expect(tarefa.titulo).toBe("Estudar tRPC");
    expect(new Date(tarefa.dataCriacao).toISOString()).toBe(tarefa.dataCriacao);
  });

  it.each(["", "   "])("rejeita o título %j", async (titulo) => {
    await expect(api.criar({ titulo })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("atualizar", () => {
  it("altera os dados, limpa a descrição e preserva id e dataCriacao", async () => {
    const original = await api.criar({ titulo: "Antigo", descricao: "Texto" });

    const atualizada = await api.atualizar({ id: original.id, titulo: "Novo", descricao: "" });

    expect(atualizada).toEqual({
      id: original.id,
      titulo: "Novo",
      descricao: undefined,
      dataCriacao: original.dataCriacao,
    });
  });

  it("retorna NOT_FOUND para tarefa inexistente", async () => {
    await expect(api.atualizar({ id: 99, titulo: "Novo" })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Tarefa não encontrada",
    });
  });
});

describe("deletar", () => {
  it("remove a tarefa", async () => {
    const { id } = await api.criar({ titulo: "Remover" });

    await api.deletar({ id });

    await expect(api.buscarPorId({ id })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("retorna NOT_FOUND para tarefa inexistente", async () => {
    await expect(api.deletar({ id: 99 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("listar", () => {
  it("pagina da tarefa mais recente para a mais antiga", async () => {
    await criarVarias(5);

    const primeira = await api.listar({ limite: 2 });
    const ultima = await api.listar({ limite: 3, cursor: primeira.proximoCursor });

    expect(primeira.itens.map((t) => t.id)).toEqual([5, 4]);
    expect(ultima.itens.map((t) => t.id)).toEqual([3, 2, 1]);
    expect(ultima.proximoCursor).toBeUndefined();
  });

  it("não pula nem repete tarefas quando a tarefa do cursor é excluída", async () => {
    await criarVarias(5);
    const primeira = await api.listar({ limite: 2 });

    await api.deletar({ id: primeira.proximoCursor! });
    const segunda = await api.listar({ limite: 2, cursor: primeira.proximoCursor });

    expect(segunda.itens.map((t) => t.id)).toEqual([3, 2]);
  });
});
