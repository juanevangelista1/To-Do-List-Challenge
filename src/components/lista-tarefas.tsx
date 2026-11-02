"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link, { useLinkStatus } from "next/link";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { obterMensagemErro } from "@/lib/mensagem-erro";
import { useTRPC } from "@/trpc/client";

const formatoData = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

function IconeLapis() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ConteudoLinkEditar() {
  const { pending } = useLinkStatus();

  return (
    <>
      <IconeLapis />
      {pending ? "Loading..." : "Edit"}
    </>
  );
}

export function ListaTarefas() {
  const trpc = useTRPC();
  const consulta = useInfiniteQuery(
    trpc.listar.infiniteQueryOptions({}, { getNextPageParam: (pagina) => pagina.proximoCursor }),
  );

  const queryClient = useQueryClient();
  const exclusao = useMutation(
    trpc.deletar.mutationOptions({
      onSuccess: () => toast.success("Task deleted"),
      onError: (erro) => toast.error(obterMensagemErro(erro)),
      onSettled: () => queryClient.invalidateQueries(trpc.listar.pathFilter()),
    }),
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = consulta;
  const botaoCarregarMais = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const botao = botaoCarregarMais.current;
    if (!botao || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;

    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) fetchNextPage({ cancelRefetch: false });
    });
    observador.observe(botao);
    return () => observador.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError]);

  const tarefas = consulta.data?.pages.flatMap((pagina) => pagina.itens) ?? [];

  function excluir(id: number, titulo: string) {
    if (window.confirm(`Delete task "${titulo}"?`)) exclusao.mutate({ id });
  }

  return (
    <>
      <h1>Today&apos;s tasks</h1>

      {consulta.isPending && <p role="status">Loading tasks...</p>}

      {consulta.isError && !consulta.data && (
        <div role="alert">
          <p>Could not load tasks: {obterMensagemErro(consulta.error)}</p>
          <button type="button" onClick={() => consulta.refetch()}>
            Try again
          </button>
        </div>
      )}

      {consulta.isSuccess && tarefas.length === 0 && <p>No tasks yet.</p>}

      <ul className="lista">
        {tarefas.map((tarefa) => (
          <li key={tarefa.id} className="cartao">
            <h2>{tarefa.titulo}</h2>
            {tarefa.descricao && (
              <p className="descricao" title={tarefa.descricao}>
                {tarefa.descricao}
              </p>
            )}
            <time dateTime={tarefa.dataCriacao}>
              {formatoData.format(new Date(tarefa.dataCriacao))}
            </time>
            <div className="acoes">
              <Link
                href={`/tarefas/${tarefa.id}/editar`}
                className="botao primario"
                aria-label={`Edit task: ${tarefa.titulo}`}
              >
                <ConteudoLinkEditar />
              </Link>
              <button
                type="button"
                className="perigo"
                aria-label={`Delete task: ${tarefa.titulo}`}
                disabled={exclusao.isPending}
                onClick={() => excluir(tarefa.id, tarefa.titulo)}
              >
                {exclusao.isPending && exclusao.variables?.id === tarefa.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {isFetchNextPageError && !isFetchingNextPage && (
        <p role="alert" className="erro">
          Could not load more tasks.
        </p>
      )}

      {hasNextPage && (
        <button
          ref={botaoCarregarMais}
          type="button"
          className="carregar-mais"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage({ cancelRefetch: false })}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}
    </>
  );
}
