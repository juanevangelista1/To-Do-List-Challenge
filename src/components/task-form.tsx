"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TRPCClientErrorLike } from "@trpc/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { getErrorMessage } from "@/lib/error-message";
import { taskSchema } from "@/lib/task-schema";
import type { AppRouter } from "@/server/router";
import type { Task } from "@/server/store";
import { useTRPC } from "@/trpc/client";

type FieldErrors = { titulo?: string[]; descricao?: string[] };

export function TaskForm({ task }: { task?: Task }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [title, setTitle] = useState(task?.titulo ?? "");
  const [description, setDescription] = useState(task?.descricao ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  function finish(message: string) {
    toast.success(message);
    queryClient.invalidateQueries(trpc.list.pathFilter());
    router.push("/");
  }

  function handleError(error: TRPCClientErrorLike<AppRouter>) {
    setGeneralError(getErrorMessage(error));
  }

  const createMutation = useMutation(
    trpc.create.mutationOptions({
      onSuccess: () => finish("Task created"),
      onError: handleError,
    }),
  );
  const updateMutation = useMutation(
    trpc.update.mutationOptions({
      onSuccess: () => finish("Task updated"),
      onError: handleError,
    }),
  );
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setGeneralError(null);

    const result = taskSchema.safeParse({ titulo: title, descricao: description });
    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setFieldErrors({});
    if (task) {
      updateMutation.mutate({ id: task.id, ...result.data });
    } else {
      createMutation.mutate(result.data);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="task-form">
      <h1>{task ? "Edit task" : "New task"}</h1>

      {generalError && (
        <p role="alert" className="error-message">
          {generalError}
        </p>
      )}

      <label htmlFor="title">Title</label>
      <input
        id="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        aria-invalid={Boolean(fieldErrors.titulo)}
        aria-describedby={fieldErrors.titulo ? "title-error" : undefined}
        required
      />
      {fieldErrors.titulo && (
        <p id="title-error" className="error-message">
          {fieldErrors.titulo[0]}
        </p>
      )}

      <label htmlFor="description">Description (optional)</label>
      <textarea
        id="description"
        rows={4}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        aria-invalid={Boolean(fieldErrors.descricao)}
        aria-describedby={fieldErrors.descricao ? "description-error" : undefined}
      />
      {fieldErrors.descricao && (
        <p id="description-error" className="error-message">
          {fieldErrors.descricao[0]}
        </p>
      )}

      <div className="actions">
        <button type="submit" className="primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </button>
        <Link href="/" className="button">
          Cancel
        </Link>
      </div>
    </form>
  );
}
