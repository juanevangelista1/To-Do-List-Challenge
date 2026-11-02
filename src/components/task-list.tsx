"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link, { useLinkStatus } from "next/link";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-message";
import { useTRPC } from "@/trpc/client";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

function PencilIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function EditLinkContent() {
  const { pending } = useLinkStatus();

  return (
    <>
      <PencilIcon />
      {pending ? "Loading..." : "Edit"}
    </>
  );
}

export function TaskList() {
  const trpc = useTRPC();
  const tasksQuery = useInfiniteQuery(
    trpc.list.infiniteQueryOptions({}, { getNextPageParam: (page) => page.nextCursor }),
  );

  const queryClient = useQueryClient();
  const deleteMutation = useMutation(
    trpc.delete.mutationOptions({
      onSuccess: () => toast.success("Task deleted"),
      onError: (error) => toast.error(getErrorMessage(error)),
      onSettled: () => queryClient.invalidateQueries(trpc.list.pathFilter()),
    }),
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = tasksQuery;
  const loadMoreButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = loadMoreButton.current;
    if (!button || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) fetchNextPage({ cancelRefetch: false });
    });
    observer.observe(button);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError]);

  const tasks = tasksQuery.data?.pages.flatMap((page) => page.items) ?? [];

  function confirmDelete(id: number, title: string) {
    if (window.confirm(`Delete task "${title}"?`)) deleteMutation.mutate({ id });
  }

  return (
    <>
      <h1>My tasks</h1>

      {tasksQuery.isPending && <p role="status">Loading tasks...</p>}

      {tasksQuery.isError && !tasksQuery.data && (
        <div role="alert">
          <p>Could not load tasks: {getErrorMessage(tasksQuery.error)}</p>
          <button type="button" onClick={() => tasksQuery.refetch()}>
            Try again
          </button>
        </div>
      )}

      {tasksQuery.isSuccess && tasks.length === 0 && <p>No tasks yet.</p>}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-card">
            <h2>{task.titulo}</h2>
            {task.descricao && (
              <p className="task-description" title={task.descricao}>
                {task.descricao}
              </p>
            )}
            <time dateTime={task.dataCriacao}>
              {dateFormat.format(new Date(task.dataCriacao))}
            </time>
            <div className="actions">
              <Link
                href={`/tasks/${task.id}/edit`}
                className="button primary"
                aria-label={`Edit task: ${task.titulo}`}
              >
                <EditLinkContent />
              </Link>
              <button
                type="button"
                className="danger"
                aria-label={`Delete task: ${task.titulo}`}
                disabled={deleteMutation.isPending}
                onClick={() => confirmDelete(task.id, task.titulo)}
              >
                {deleteMutation.isPending && deleteMutation.variables?.id === task.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {isFetchNextPageError && !isFetchingNextPage && (
        <p role="alert" className="error-message">
          Could not load more tasks.
        </p>
      )}

      {hasNextPage && (
        <button
          ref={loadMoreButton}
          type="button"
          className="load-more"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage({ cancelRefetch: false })}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </button>
      )}
    </>
  );
}
