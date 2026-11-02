"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { obterProximoCursor } from "@/lib/paginacao";
import { useTRPC } from "@/trpc/client";

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function ListaTarefas() {
  const trpc = useTRPC();
  const consulta = useInfiniteQuery(
    trpc.listar.infiniteQueryOptions({}, { getNextPageParam: obterProximoCursor }),
  );

  const tarefas = consulta.data?.pages.flatMap((pagina) => pagina.itens) ?? [];

  return (
    <>
      <h1>Tarefas</h1>

      {consulta.isPending && <p role="status">Carregando tarefas...</p>}

      {consulta.isError && !consulta.data && (
        <div role="alert">
          <p>Não foi possível carregar as tarefas: {consulta.error.message}</p>
          <button type="button" onClick={() => consulta.refetch()}>
            Tentar novamente
          </button>
        </div>
      )}

      {consulta.isSuccess && tarefas.length === 0 && <p>Nenhuma tarefa cadastrada.</p>}

      <ul className="lista">
        {tarefas.map((tarefa) => (
          <li key={tarefa.id} className="cartao">
            <h2>{tarefa.titulo}</h2>
            {tarefa.descricao && <p>{tarefa.descricao}</p>}
            <time dateTime={tarefa.dataCriacao}>
              {formatoData.format(new Date(tarefa.dataCriacao))}
            </time>
          </li>
        ))}
      </ul>
    </>
  );
}
