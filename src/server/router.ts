import { initTRPC, TRPCError } from "@trpc/server";
import { z, ZodError } from "zod";
import { taskSchema } from "@/lib/task-schema";
import type { TaskStore } from "@/server/store";

export type Context = { store: TaskStore };

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      message: error.cause instanceof ZodError ? error.cause.issues[0].message : shape.message,
    };
  },
});

const idSchema = z.number().int().positive();

function taskNotFoundError() {
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
    const task = ctx.store.find(input.id);
    if (!task) throw taskNotFoundError();
    return task;
  }),

  create: t.procedure
    .input(taskSchema)
    .mutation(({ ctx, input }) => ctx.store.create(input)),

  update: t.procedure
    .input(taskSchema.extend({ id: idSchema }))
    .mutation(({ ctx, input: { id, ...data } }) => {
      const task = ctx.store.update(id, data);
      if (!task) throw taskNotFoundError();
      return task;
    }),

  delete: t.procedure.input(z.object({ id: idSchema })).mutation(({ ctx, input }) => {
    if (!ctx.store.remove(input.id)) throw taskNotFoundError();
    return { id: input.id };
  }),
});

export type AppRouter = typeof appRouter;

export const createCaller = t.createCallerFactory(appRouter);
