import { z } from "zod";

export const tarefaSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be at most 120 characters"),
  descricao: z
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters")
    .transform((descricao) => descricao || undefined)
    .optional(),
});

export type DadosTarefa = z.output<typeof tarefaSchema>;
