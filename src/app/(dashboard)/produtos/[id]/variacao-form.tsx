"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface VariacaoFormProps {
  tipoProdutoId: string;
  variacao?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ComposicaoItem {
  materiaPrimaId: string;
  quantidade: number;
  unidade: string;
  materiaPrima?: {
    id: string;
    nome: string;
    unidadeMedida: string;
    custoUnitario: number;
  };
}

export function VariacaoForm({
  tipoProdutoId,
  variacao,
  onSuccess,
  onCancel,
}: VariacaoFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [materiasPrimas, setMateriasPrimas] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    sku: "",
    descricao: "",
    margemPadrao: 40,
    ativo: true,
  });

  const [composicao, setComposicao] = useState<ComposicaoItem[]>([]);

  // Carregar matérias-primas
  useEffect(() => {
    const loadMateriasPrimas = async () => {
      try {
        const response = await fetch("/api/materias-primas");
        if (response.ok) {
          const data = await response.json();
          setMateriasPrimas(data.filter((m: any) => m.ativo));
        }
      } catch (error) {
        console.error("Erro ao carregar matérias-primas:", error);
      }
    };

    loadMateriasPrimas();
  }, []);

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (variacao) {
      setFormData({
        nome: variacao.nome || "",
        codigo: variacao.codigo || "",
        sku: variacao.sku || "",
        descricao: variacao.descricao || "",
        margemPadrao: Number(variacao.margemPadrao) || 40,
        ativo: variacao.ativo ?? true,
      });

      if (variacao.composicao && variacao.composicao.length > 0) {
        setComposicao(
          variacao.composicao.map((comp: any) => ({
            materiaPrimaId: comp.materiaPrimaId,
            quantidade: Number(comp.quantidade),
            unidade: comp.unidade,
            materiaPrima: comp.materiaPrima,
          }))
        );
      }
    }
  }, [variacao]);

  // Adicionar item à composição
  const adicionarItem = () => {
    setComposicao([
      ...composicao,
      {
        materiaPrimaId: "",
        quantidade: 1,
        unidade: "unidade",
      },
    ]);
  };

  // Remover item da composição
  const removerItem = (index: number) => {
    setComposicao(composicao.filter((_, i) => i !== index));
  };

  // Atualizar item da composição
  const atualizarItem = (index: number, field: string, value: any) => {
    const novosItens = [...composicao];

    if (field === "materiaPrimaId") {
      const material = materiasPrimas.find((m) => m.id === value);
      novosItens[index] = {
        ...novosItens[index],
        materiaPrimaId: value,
        unidade: material?.unidadeMedida || novosItens[index].unidade,
        materiaPrima: material,
      };
    } else {
      novosItens[index] = {
        ...novosItens[index],
        [field]: value,
      };
    }

    setComposicao(novosItens);
  };

  // Mover item para cima
  const moverParaCima = (index: number) => {
    if (index === 0) return;
    const novosItens = [...composicao];
    [novosItens[index - 1], novosItens[index]] = [novosItens[index], novosItens[index - 1]];
    setComposicao(novosItens);
  };

  // Mover item para baixo
  const moverParaBaixo = (index: number) => {
    if (index === composicao.length - 1) return;
    const novosItens = [...composicao];
    [novosItens[index], novosItens[index + 1]] = [novosItens[index + 1], novosItens[index]];
    setComposicao(novosItens);
  };

  // Calcular custo total
  const calcularCustoTotal = () => {
    return composicao.reduce((acc, item) => {
      if (item.materiaPrima) {
        return acc + item.quantidade * Number(item.materiaPrima.custoUnitario);
      }
      return acc;
    }, 0);
  };

  // Calcular preço sugerido
  const calcularPrecoSugerido = () => {
    const custo = calcularCustoTotal();
    return custo * (1 + formData.margemPadrao / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = variacao
        ? `/api/variacoes-produto/${variacao.id}`
        : "/api/variacoes-produto";

      const method = variacao ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoProdutoId,
          ...formData,
          codigo: formData.codigo || undefined,
          sku: formData.sku || undefined,
          descricao: formData.descricao || undefined,
          composicao: composicao.map((item) => ({
            materiaPrimaId: item.materiaPrimaId,
            quantidade: item.quantidade,
            unidade: item.unidade,
          })),
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || "Erro ao salvar variação");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setError("Erro ao salvar variação");
    } finally {
      setLoading(false);
    }
  };

  const custoTotal = calcularCustoTotal();
  const precoSugerido = calcularPrecoSugerido();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* Informações Básicas */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="nome">Nome da Variação *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Grade de Ferro, Grade de Cobre"
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
              placeholder="Ex: VAR-001"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Ex: SKU-001"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="margemPadrao">Margem de Lucro (%) *</Label>
            <Input
              id="margemPadrao"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.margemPadrao}
              onChange={(e) =>
                setFormData({ ...formData, margemPadrao: parseFloat(e.target.value) || 0 })
              }
              required
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
      </div>

      {/* Composição */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Composição</CardTitle>
              <CardDescription>
                Selecione as matérias-primas e defina as quantidades
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={adicionarItem}
              disabled={loading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {composicao.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhuma matéria-prima adicionada. Clique em &ldquo;Adicionar&rdquo; para começar.
            </p>
          ) : (
            composicao.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label>Matéria-Prima</Label>
                  <NativeSelect
                    value={item.materiaPrimaId}
                    onChange={(e) => atualizarItem(index, "materiaPrimaId", e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Selecione...</option>
                    {materiasPrimas.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.nome} - {formatCurrency(Number(mat.custoUnitario))}/{mat.unidadeMedida}
                      </option>
                    ))}
                  </NativeSelect>
                </div>

                <div className="w-32">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.quantidade}
                    onChange={(e) =>
                      atualizarItem(index, "quantidade", parseFloat(e.target.value) || 0)
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <div className="w-32">
                  <Label>Unidade</Label>
                  <Input
                    value={item.unidade}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="w-32">
                  <Label>Subtotal</Label>
                  <Input
                    value={
                      item.materiaPrima
                        ? formatCurrency(item.quantidade * Number(item.materiaPrima.custoUnitario))
                        : "-"
                    }
                    disabled
                    className="font-mono bg-muted"
                  />
                </div>

                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moverParaCima(index)}
                    disabled={index === 0 || loading}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moverParaBaixo(index)}
                    disabled={index === composicao.length - 1 || loading}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removerItem(index)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Preview de Cálculo */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg">Cálculo Automático</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Custo Total:</span>
            <span className="text-xl font-mono font-bold">{formatCurrency(custoTotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Margem de Lucro:</span>
            <Badge variant="outline">{formData.margemPadrao}%</Badge>
          </div>
          <div className="border-t border-blue-200 dark:border-blue-800 pt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Preço de Venda Sugerido:</span>
              <span className="text-2xl font-mono font-bold text-success">
                {formatCurrency(precoSugerido)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || composicao.length === 0}>
          {loading ? "Salvando..." : variacao ? "Atualizar" : "Criar Variação"}
        </Button>
      </div>
    </form>
  );
}
