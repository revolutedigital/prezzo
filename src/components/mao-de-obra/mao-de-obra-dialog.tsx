"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { showSuccess, showError } from "@/lib/toast";
import { maoDeObraSchema, type MaoDeObraFormData } from "@/schemas/mao-de-obra.schema";

type FormData = MaoDeObraFormData;

interface MaoDeObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo?: any;
  onSuccess: () => void;
}

export function MaoDeObraDialog({
  open,
  onOpenChange,
  tipo,
  onSuccess,
}: MaoDeObraDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!tipo;

  const form = useForm<FormData>({
    resolver: zodResolver(maoDeObraSchema),
    defaultValues: {
      nome: "",
      codigo: "",
      custoHora: 0,
      incluiMaquina: false,
      custoMaquinaHora: null,
      descricao: "",
      ativo: true,
    },
  });

  const incluiMaquina = form.watch("incluiMaquina");
  const custoHora = form.watch("custoHora") || 0;
  const custoMaquinaHora = form.watch("custoMaquinaHora") || 0;
  const custoTotalHora = incluiMaquina ? custoHora + custoMaquinaHora : custoHora;

  // Atualizar form quando tipo mudar
  useEffect(() => {
    if (tipo) {
      form.reset({
        nome: tipo.nome,
        codigo: tipo.codigo || "",
        custoHora: Number(tipo.custoHora),
        incluiMaquina: tipo.incluiMaquina,
        custoMaquinaHora: tipo.custoMaquinaHora ? Number(tipo.custoMaquinaHora) : null,
        descricao: tipo.descricao || "",
        ativo: tipo.ativo,
      });
    } else {
      form.reset({
        nome: "",
        codigo: "",
        custoHora: 0,
        incluiMaquina: false,
        custoMaquinaHora: null,
        descricao: "",
        ativo: true,
      });
    }
  }, [tipo, form]);

  const onSubmit = async (data: FormData) => {
    // Validação: se incluiMaquina é true, custoMaquinaHora deve ser fornecido
    if (data.incluiMaquina && !data.custoMaquinaHora) {
      form.setError("custoMaquinaHora", {
        message: "Custo de máquina é obrigatório quando inclui máquina",
      });
      return;
    }

    setLoading(true);

    try {
      const url = isEditing ? `/api/mao-de-obra/${tipo.id}` : "/api/mao-de-obra";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao salvar");
      }

      showSuccess(
        isEditing
          ? "Tipo atualizado com sucesso"
          : "Tipo criado com sucesso"
      );

      onSuccess();
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Erro ao salvar tipo de mão de obra");
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Tipo de Mão de Obra" : "Novo Tipo de Mão de Obra"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do tipo de mão de obra
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Soldador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: SOL001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="custoHora"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custo por Hora (R$) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="incluiMaquina"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Inclui Máquina/Equipamento</FormLabel>
                    <FormDescription>
                      Marque se este tipo de mão de obra utiliza máquinas ou equipamentos
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {incluiMaquina && (
              <FormField
                control={form.control}
                name="custoMaquinaHora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Máquina por Hora (R$) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Custo adicional da máquina/equipamento por hora
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes sobre o tipo de mão de obra..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Ativo</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Resumo de custo */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="text-sm font-medium mb-2">Resumo de Custos</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Custo Mão de Obra/Hora:</span>
                  <span>{formatarMoeda(custoHora)}</span>
                </div>
                {incluiMaquina && (
                  <div className="flex justify-between">
                    <span>Custo Máquina/Hora:</span>
                    <span>{formatarMoeda(custoMaquinaHora)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 font-semibold">
                  <span>Custo Total/Hora:</span>
                  <span>{formatarMoeda(custoTotalHora)}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  isEditing ? "Atualizar" : "Criar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
