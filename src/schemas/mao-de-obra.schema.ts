import { z } from 'zod';

export const maoDeObraSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  codigo: z.string().optional(),
  custoHora: z.coerce.number().positive('Custo por hora deve ser positivo'),
  incluiMaquina: z.boolean().default(false),
  custoMaquinaHora: z.coerce.number().positive().optional().nullable(),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

export type MaoDeObraFormData = z.infer<typeof maoDeObraSchema>;
