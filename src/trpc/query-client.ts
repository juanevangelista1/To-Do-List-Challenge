import { QueryClient } from "@tanstack/react-query";

export function criarQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000 },
    },
  });
}
