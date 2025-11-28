"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

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

  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    unidadeMedida: "unidade",
    custoUnitario: "",
    fornecedor: "",
    categoria: "",
    ativo: true,
  });

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (materiaPrima) {
      setFormData({
        nome: materiaPrima.nome || "",
        codigo: materiaPrima.codigo || "",
        unidadeMedida: materiaPrima.unidadeMedida || "unidade",
        custoUnitario: String(materiaPrima.custoUnitario || ""),
        fornecedor: materiaPrima.fornecedor || "",
        categoria: materiaPrima.categoria || "",
        ativo: materiaPrima.ativo ?? true,
      });
    }
  }, [materiaPrima]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          ...formData,
          custoUnitario: parseFloat(formData.custoUnitario),
          codigo: formData.codigo || undefined,
          fornecedor: formData.fornecedor || undefined,
          categoria: formData.categoria || undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || "Erro ao salvar matéria-prima");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setError("Erro ao salvar matéria-prima");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Ex: Filtro de Alumínio"
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="codigo">Código</Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            placeholder="Ex: FLT-001"
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="unidadeMedida">Unidade de Medida *</Label>
          <NativeSelect
            id="unidadeMedida"
            value={formData.unidadeMedida}
            onChange={(e) =>
              setFormData({ ...formData, unidadeMedida: e.target.value })
            }
            required
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
        </div>

        <div>
          <Label htmlFor="custoUnitario">Custo Unitário (R$) *</Label>
          <Input
            id="custoUnitario"
            type="number"
            step="0.01"
            min="0"
            value={formData.custoUnitario}
            onChange={(e) =>
              setFormData({ ...formData, custoUnitario: e.target.value })
            }
            placeholder="0.00"
            required
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="fornecedor">Fornecedor</Label>
          <Input
            id="fornecedor"
            value={formData.fornecedor}
            onChange={(e) =>
              setFormData({ ...formData, fornecedor: e.target.value })
            }
            placeholder="Nome do fornecedor"
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Input
            id="categoria"
            value={formData.categoria}
            onChange={(e) =>
              setFormData({ ...formData, categoria: e.target.value })
            }
            placeholder="Ex: Metais, Plásticos"
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="ativo">Status</Label>
          <NativeSelect
            id="ativo"
            value={formData.ativo ? "true" : "false"}
            onChange={(e) =>
              setFormData({ ...formData, ativo: e.target.value === "true" })
            }
            disabled={loading}
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </NativeSelect>
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
          {loading ? "Salvando..." : materiaPrima ? "Atualizar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
