import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { TaskForm } from "@/components/task-form";
import { api } from "@/trpc/server";

async function getTask(id: number) {
  try {
    return await api.getById({ id });
  } catch (error) {
    if (error instanceof TRPCError && ["NOT_FOUND", "BAD_REQUEST"].includes(error.code)) {
      notFound();
    }
    throw error;
  }
}

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTask(Number(id));

  return <TaskForm task={task} />;
}
