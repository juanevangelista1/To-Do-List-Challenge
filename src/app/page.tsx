import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ListaTarefas } from "@/components/lista-tarefas";
import { obterProximoCursor } from "@/lib/paginacao";
import { getQueryClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery(
    trpc.listar.infiniteQueryOptions({}, { getNextPageParam: obterProximoCursor }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListaTarefas />
    </HydrationBoundary>
  );
}
