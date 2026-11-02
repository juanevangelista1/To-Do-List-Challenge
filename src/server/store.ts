import type { DadosTarefa } from "@/lib/tarefa-schema";
import { tarefasIniciais } from "@/server/tarefas-iniciais";

export type Tarefa = DadosTarefa & {
  id: number;
  dataCriacao: string;
};

export function criarStore(iniciais: DadosTarefa[] = []) {
  const tarefas = new Map<number, Tarefa>();
  let ultimoId = 0;

  function criar(dados: DadosTarefa) {
    const tarefa: Tarefa = {
      ...dados,
      id: ++ultimoId,
      dataCriacao: new Date().toISOString(),
    };
    tarefas.set(tarefa.id, tarefa);
    return tarefa;
  }

  iniciais.forEach(criar);

  return {
    criar,
    listar(limite: number, cursor?: number) {
      const candidatas = [...tarefas.values()]
        .reverse()
        .filter((tarefa) => cursor === undefined || tarefa.id < cursor);
      const itens = candidatas.slice(0, limite);
      return {
        itens,
        proximoCursor: candidatas.length > limite ? itens.at(-1)?.id : undefined,
      };
    },
    buscar(id: number) {
      return tarefas.get(id);
    },
    atualizar(id: number, dados: DadosTarefa) {
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
    remover(id: number) {
      return tarefas.delete(id);
    },
  };
}

export type TarefaStore = ReturnType<typeof criarStore>;

const escopoGlobal = globalThis as typeof globalThis & {
  tarefaStore?: TarefaStore;
};

export const tarefaStore = (escopoGlobal.tarefaStore ??= criarStore(tarefasIniciais));
