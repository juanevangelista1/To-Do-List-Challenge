import { initTRPC, TRPCError } from "@trpc/server";
import { z, ZodError } from "zod";
import { tarefaSchema } from "@/lib/tarefa-schema";
import type { TarefaStore } from "@/server/store";

export type Contexto = { store: TarefaStore };

const t = initTRPC.context<Contexto>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      message: error.cause instanceof ZodError ? error.cause.issues[0].message : shape.message,
    };
  },
});

const idSchema = z.number().int().positive();

function tarefaNaoEncontrada() {
  return new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
}

export const appRouter = t.router({
  list: t.procedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
        cursor: idSchema.optional(),
      }),
    )
    .query(({ ctx, input }) => ctx.store.list(input.limit, input.cursor)),

  getById: t.procedure.input(z.object({ id: idSchema })).query(({ ctx, input }) => {
    const tarefa = ctx.store.find(input.id);
    if (!tarefa) throw tarefaNaoEncontrada();
    return tarefa;
  }),

  create: t.procedure
    .input(tarefaSchema)
    .mutation(({ ctx, input }) => ctx.store.create(input)),

  update: t.procedure
    .input(tarefaSchema.extend({ id: idSchema }))
    .mutation(({ ctx, input: { id, ...dados } }) => {
      const tarefa = ctx.store.update(id, dados);
      if (!tarefa) throw tarefaNaoEncontrada();
      return tarefa;
    }),

  delete: t.procedure.input(z.object({ id: idSchema })).mutation(({ ctx, input }) => {
    if (!ctx.store.remove(input.id)) throw tarefaNaoEncontrada();
    return { id: input.id };
  }),
});

export type AppRouter = typeof appRouter;

export const createCaller = t.createCallerFactory(appRouter);
