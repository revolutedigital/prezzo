import { z } from "zod";

export const tipoProdutoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
});

export type TipoProdutoFormData = z.infer<typeof tipoProdutoSchema>;
