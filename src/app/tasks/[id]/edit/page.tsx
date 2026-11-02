import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { FormularioTarefa } from "@/components/formulario-tarefa";
import { api } from "@/trpc/server";

async function buscarTarefa(id: number) {
  try {
    return await api.getById({ id });
  } catch (erro) {
    if (erro instanceof TRPCError && ["NOT_FOUND", "BAD_REQUEST"].includes(erro.code)) {
      notFound();
    }
    throw erro;
  }
}

export default async function EditarTarefaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tarefa = await buscarTarefa(Number(id));

  return <FormularioTarefa tarefa={tarefa} />;
}
