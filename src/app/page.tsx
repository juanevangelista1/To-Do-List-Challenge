import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { TaskList } from "@/components/task-list";
import { getQueryClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery(
    trpc.list.infiniteQueryOptions({}, { getNextPageParam: (page) => page.nextCursor }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TaskList />
    </HydrationBoundary>
  );
}
