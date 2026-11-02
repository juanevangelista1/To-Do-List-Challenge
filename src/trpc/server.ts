import "server-only";

import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { appRouter, createCaller } from "@/server/router";
import { tarefaStore } from "@/server/store";
import { criarQueryClient } from "@/trpc/query-client";

const contexto = { store: tarefaStore };

export const getQueryClient = cache(criarQueryClient);

export const trpc = createTRPCOptionsProxy({
  router: appRouter,
  ctx: contexto,
  queryClient: getQueryClient,
});

export const api = createCaller(contexto);
