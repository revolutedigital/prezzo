import { z } from 'zod';

export const materiaPrimaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  codigo: z.string().optional(),
  unidadeMedida: z.string().min(1, 'Unidade de medida é obrigatória'),
  custoUnitario: z.string()
    .min(1, 'Custo unitário é obrigatório')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Custo deve ser maior que zero'),
  fornecedor: z.string().optional(),
  categoria: z.string().optional(),
  ativo: z.boolean(),
});

export type MateriaPrimaFormData = z.infer<typeof materiaPrimaSchema>;
