import { initTRPC, TRPCError } from "@trpc/server";
import { z, ZodError } from "zod";
import { tarefaSchema } from "@/lib/tarefa-schema";
import type { TarefaStore } from "@/server/store";

export type Contexto = { store: TarefaStore };

const t = initTRPC.context<Contexto>().create({
  errorFormatter({ shape, error }) {
    const erroValidacao = error.cause instanceof ZodError ? error.cause : null;
    return {
      ...shape,
      message: erroValidacao ? "Invalid data" : shape.message,
      data: {
        ...shape.data,
        errosCampos: erroValidacao && z.flattenError(erroValidacao).fieldErrors,
      },
    };
  },
});

const idSchema = z.number().int().positive();

function tarefaNaoEncontrada() {
  return new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
}

export const appRouter = t.router({
  listar: t.procedure
    .input(
      z.object({
        limite: z.number().int().min(1).max(50).default(10),
        cursor: idSchema.optional(),
      }),
    )
    .query(({ ctx, input }) => ctx.store.listar(input.limite, input.cursor)),

  buscarPorId: t.procedure.input(z.object({ id: idSchema })).query(({ ctx, input }) => {
    const tarefa = ctx.store.buscar(input.id);
    if (!tarefa) throw tarefaNaoEncontrada();
    return tarefa;
  }),

  criar: t.procedure
    .input(tarefaSchema)
    .mutation(({ ctx, input }) => ctx.store.criar(input)),

  atualizar: t.procedure
    .input(tarefaSchema.extend({ id: idSchema }))
    .mutation(({ ctx, input: { id, ...dados } }) => {
      const tarefa = ctx.store.atualizar(id, dados);
      if (!tarefa) throw tarefaNaoEncontrada();
      return tarefa;
    }),

  deletar: t.procedure.input(z.object({ id: idSchema })).mutation(({ ctx, input }) => {
    if (!ctx.store.remover(input.id)) throw tarefaNaoEncontrada();
    return { id: input.id };
  }),
});

export type AppRouter = typeof appRouter;

export const createCaller = t.createCallerFactory(appRouter);
