"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import type { AppRouter } from "@/server/router";
import { criarQueryClient } from "@/trpc/query-client";

const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

export { useTRPC };

let queryClientDoNavegador: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return criarQueryClient();
  return (queryClientDoNavegador ??= criarQueryClient());
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: "/api/trpc" })],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
        <Toaster richColors position="top-center" />
      </TRPCProvider>
    </QueryClientProvider>
  );
}
