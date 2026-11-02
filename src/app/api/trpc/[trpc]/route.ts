import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/router";
import { tarefaStore } from "@/server/store";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({ store: tarefaStore }),
  });
}

export { handler as GET, handler as POST };
