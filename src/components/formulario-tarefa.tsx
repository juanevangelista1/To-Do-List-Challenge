"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TRPCClientErrorLike } from "@trpc/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { obterMensagemErro } from "@/lib/mensagem-erro";
import { tarefaSchema } from "@/lib/tarefa-schema";
import type { AppRouter } from "@/server/router";
import type { Tarefa } from "@/server/store";
import { useTRPC } from "@/trpc/client";

type ErrosCampos = { titulo?: string[]; descricao?: string[] };

export function FormularioTarefa({ tarefa }: { tarefa?: Tarefa }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? "");
  const [errosCampos, setErrosCampos] = useState<ErrosCampos>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  function concluir(mensagem: string) {
    toast.success(mensagem);
    queryClient.invalidateQueries(trpc.listar.pathFilter());
    router.push("/");
  }

  function tratarErro(erro: TRPCClientErrorLike<AppRouter>) {
    setErroGeral(obterMensagemErro(erro));
  }

  const criacao = useMutation(
    trpc.criar.mutationOptions({
      onSuccess: () => concluir("Task created"),
      onError: tratarErro,
    }),
  );
  const atualizacao = useMutation(
    trpc.atualizar.mutationOptions({
      onSuccess: () => concluir("Task updated"),
      onError: tratarErro,
    }),
  );
  const salvando = criacao.isPending || atualizacao.isPending;

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErroGeral(null);

    const resultado = tarefaSchema.safeParse({ titulo, descricao });
    if (!resultado.success) {
      setErrosCampos(z.flattenError(resultado.error).fieldErrors);
      return;
    }

    setErrosCampos({});
    if (tarefa) {
      atualizacao.mutate({ id: tarefa.id, ...resultado.data });
    } else {
      criacao.mutate(resultado.data);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="task-form">
      <h1>{tarefa ? "Edit task" : "New task"}</h1>

      {erroGeral && (
        <p role="alert" className="error-message">
          {erroGeral}
        </p>
      )}

      <label htmlFor="titulo">Title</label>
      <input
        id="titulo"
        value={titulo}
        onChange={(evento) => setTitulo(evento.target.value)}
        aria-invalid={Boolean(errosCampos.titulo)}
        aria-describedby={errosCampos.titulo ? "erro-titulo" : undefined}
        required
      />
      {errosCampos.titulo && (
        <p id="erro-titulo" className="error-message">
          {errosCampos.titulo[0]}
        </p>
      )}

      <label htmlFor="descricao">Description (optional)</label>
      <textarea
        id="descricao"
        rows={4}
        value={descricao}
        onChange={(evento) => setDescricao(evento.target.value)}
        aria-invalid={Boolean(errosCampos.descricao)}
        aria-describedby={errosCampos.descricao ? "erro-descricao" : undefined}
      />
      {errosCampos.descricao && (
        <p id="erro-descricao" className="error-message">
          {errosCampos.descricao[0]}
        </p>
      )}

      <div className="actions">
        <button type="submit" className="primary" disabled={salvando}>
          {salvando ? "Saving..." : "Save"}
        </button>
        <Link href="/" className="button">
          Cancel
        </Link>
      </div>
    </form>
  );
}
