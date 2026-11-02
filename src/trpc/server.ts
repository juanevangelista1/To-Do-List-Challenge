import "server-only";

import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { appRouter, createCaller } from "@/server/router";
import { taskStore } from "@/server/store";
import { createQueryClient } from "@/trpc/query-client";

const context = { store: taskStore };

export const getQueryClient = cache(createQueryClient);

export const trpc = createTRPCOptionsProxy({
  router: appRouter,
  ctx: context,
  queryClient: getQueryClient,
});

export const api = createCaller(context);
