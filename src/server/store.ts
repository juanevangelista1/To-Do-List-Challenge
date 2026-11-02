import type { DadosTarefa } from "@/lib/tarefa-schema";
import { tarefasIniciais } from "@/server/tarefas-iniciais";

export type Tarefa = DadosTarefa & {
  id: number;
  dataCriacao: string;
};

export function criarStore(iniciais: DadosTarefa[] = []) {
  const tarefas = new Map<number, Tarefa>();
  let ultimoId = 0;

  function create(dados: DadosTarefa) {
    const tarefa: Tarefa = {
      ...dados,
      id: ++ultimoId,
      dataCriacao: new Date().toISOString(),
    };
    tarefas.set(tarefa.id, tarefa);
    return tarefa;
  }

  iniciais.forEach(create);

  return {
    create,
    list(limit: number, cursor?: number) {
      const candidatas = [...tarefas.values()]
        .reverse()
        .filter((tarefa) => cursor === undefined || tarefa.id < cursor);
      const items = candidatas.slice(0, limit);
      return {
        items,
        nextCursor: candidatas.length > limit ? items.at(-1)?.id : undefined,
      };
    },
    find(id: number) {
      return tarefas.get(id);
    },
    update(id: number, dados: DadosTarefa) {
      const atual = tarefas.get(id);
      if (!atual) return undefined;
      const atualizada: Tarefa = {
        id: atual.id,
        dataCriacao: atual.dataCriacao,
        ...dados,
      };
      tarefas.set(id, atualizada);
      return atualizada;
    },
    remove(id: number) {
      return tarefas.delete(id);
    },
  };
}

export type TarefaStore = ReturnType<typeof criarStore>;

const escopoGlobal = globalThis as typeof globalThis & {
  tarefaStore?: TarefaStore;
};

export const tarefaStore = (escopoGlobal.tarefaStore ??= criarStore(tarefasIniciais));
