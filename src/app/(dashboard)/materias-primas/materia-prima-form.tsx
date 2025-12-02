"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Loader2 } from "lucide-react";
import { materiaPrimaSchema, type MateriaPrimaFormData } from "@/schemas/materia-prima.schema";

interface MateriaPrimaFormProps {
  materiaPrima?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MateriaPrimaForm({
  materiaPrima,
  onSuccess,
  onCancel,
}: MateriaPrimaFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MateriaPrimaFormData>({
    resolver: zodResolver(materiaPrimaSchema),
    defaultValues: {
      nome: materiaPrima?.nome || "",
      codigo: materiaPrima?.codigo || "",
      unidadeMedida: materiaPrima?.unidadeMedida || "unidade",
      custoUnitario: String(materiaPrima?.custoUnitario || ""),
      fornecedor: materiaPrima?.fornecedor || "",
      categoria: materiaPrima?.categoria || "",
      ativo: materiaPrima?.ativo ?? true,
    },
  });

  // Atualizar formulário se estiver editando
  useEffect(() => {
    if (materiaPrima) {
      reset({
        nome: materiaPrima.nome || "",
        codigo: materiaPrima.codigo || "",
        unidadeMedida: materiaPrima.unidadeMedida || "unidade",
        custoUnitario: String(materiaPrima.custoUnitario || ""),
        fornecedor: materiaPrima.fornecedor || "",
        categoria: materiaPrima.categoria || "",
        ativo: materiaPrima.ativo ?? true,
      });
    }
  }, [materiaPrima, reset]);

  const onSubmit = async (data: MateriaPrimaFormData) => {
    setLoading(true);
    setError("");

    try {
      const url = materiaPrima
        ? `/api/materias-primas/${materiaPrima.id}`
        : "/api/materias-primas";

      const method = materiaPrima ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          custoUnitario: parseFloat(data.custoUnitario),
          codigo: data.codigo || undefined,
          fornecedor: data.fornecedor || undefined,
          categoria: data.categoria || undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const responseData = await response.json();
        setError(responseData.error || "Erro ao salvar matéria-prima");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setError("Erro ao salvar matéria-prima");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            {...register("nome")}
            placeholder="Ex: Filtro de Alumínio"
            disabled={loading}
          />
          {errors.nome && (
            <p className="text-sm text-red-500 mt-1">{errors.nome.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="codigo">Código</Label>
          <Input
            id="codigo"
            {...register("codigo")}
            placeholder="Ex: FLT-001"
            disabled={loading}
          />
          {errors.codigo && (
            <p className="text-sm text-red-500 mt-1">{errors.codigo.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="unidadeMedida">Unidade de Medida *</Label>
          <NativeSelect
            id="unidadeMedida"
            {...register("unidadeMedida")}
            disabled={loading}
          >
            <option value="unidade">Unidade</option>
            <option value="metro">Metro (m)</option>
            <option value="kg">Quilograma (kg)</option>
            <option value="litro">Litro (L)</option>
            <option value="metro2">Metro Quadrado (m²)</option>
            <option value="metro3">Metro Cúbico (m³)</option>
            <option value="caixa">Caixa</option>
            <option value="pacote">Pacote</option>
          </NativeSelect>
          {errors.unidadeMedida && (
            <p className="text-sm text-red-500 mt-1">{errors.unidadeMedida.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="custoUnitario">Custo Unitário (R$) *</Label>
          <Input
            id="custoUnitario"
            type="number"
            step="0.01"
            min="0"
            {...register("custoUnitario")}
            placeholder="0.00"
            disabled={loading}
          />
          {errors.custoUnitario && (
            <p className="text-sm text-red-500 mt-1">{errors.custoUnitario.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="fornecedor">Fornecedor</Label>
          <Input
            id="fornecedor"
            {...register("fornecedor")}
            placeholder="Nome do fornecedor"
            disabled={loading}
          />
          {errors.fornecedor && (
            <p className="text-sm text-red-500 mt-1">{errors.fornecedor.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Input
            id="categoria"
            {...register("categoria")}
            placeholder="Ex: Metais, Plásticos"
            disabled={loading}
          />
          {errors.categoria && (
            <p className="text-sm text-red-500 mt-1">{errors.categoria.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="ativo">Status</Label>
          <NativeSelect
            id="ativo"
            {...register("ativo", {
              setValueAs: (v) => v === "true",
            })}
            disabled={loading}
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </NativeSelect>
          {errors.ativo && (
            <p className="text-sm text-red-500 mt-1">{errors.ativo.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
            materiaPrima ? "Atualizar" : "Cadastrar"
          )}
        </Button>
      </div>
    </form>
  );
}
