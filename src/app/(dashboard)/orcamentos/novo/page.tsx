"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Search, Trash2, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { showWarning, showSuccess, showError } from "@/lib/toast";

interface ItemProduto {
  id: string;
  nome: string;
  codigo: string | null;
  variacaoProduto: {
    id: string;
    nome: string;
    margemPadrao: number;
    custoCalculado?: number;
    precoSugerido?: number;
    tipoProduto: {
      nome: string;
    };
  };
}

interface ItemOrcamento {
  itemProdutoId: string;
  itemProduto?: ItemProduto;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  total: number;
}

export default function NovoOrcamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dados do cliente
  const [formData, setFormData] = useState({
    clienteNome: "",
    clienteEmail: "",
    clienteTelefone: "",
    clienteCNPJ: "",
    validade: "",
    observacoes: "",
    desconto: 0,
    descontoTipo: "percentual" as "percentual" | "valor",
  });

  // Itens do orçamento
  const [itens, setItens] = useState<ItemOrcamento[]>([]);

  // Modal de seleção de produtos
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [produtos, setProdutos] = useState<ItemProduto[]>([]);
  const [produtosSearch, setProdutosSearch] = useState("");
  const [loadingProdutos, setLoadingProdutos] = useState(false);

  // Carregar produtos
  const loadProdutos = async () => {
    try {
      setLoadingProdutos(true);
      const response = await fetch("/api/itens-produto");
      if (response.ok) {
        const data = await response.json();
        setProdutos(data.filter((p: any) => p.ativo));
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoadingProdutos(false);
    }
  };

  useEffect(() => {
    loadProdutos();

    // Definir validade padrão (30 dias)
    const hoje = new Date();
    const validade = new Date(hoje.setDate(hoje.getDate() + 30));
    setFormData((prev) => ({
      ...prev,
      validade: validade.toISOString().split("T")[0],
    }));
  }, []);

  // Filtrar produtos
  const produtosFiltrados = produtos.filter((p) => {
    const searchLower = produtosSearch.toLowerCase();
    return (
      p.nome.toLowerCase().includes(searchLower) ||
      p.variacaoProduto.nome.toLowerCase().includes(searchLower) ||
      p.variacaoProduto.tipoProduto.nome.toLowerCase().includes(searchLower) ||
      (p.codigo && p.codigo.toLowerCase().includes(searchLower))
    );
  });

  // Adicionar produto ao orçamento
  const adicionarProduto = (produto: ItemProduto) => {
    // Verificar se já existe
    const jaExiste = itens.find((item) => item.itemProdutoId === produto.id);
    if (jaExiste) {
      showWarning("Este produto já foi adicionado ao orçamento");
      return;
    }

    const novoItem: ItemOrcamento = {
      itemProdutoId: produto.id,
      itemProduto: produto,
      descricao: `${produto.variacaoProduto.tipoProduto.nome} - ${produto.variacaoProduto.nome} - ${produto.nome}`,
      quantidade: 1,
      precoUnitario: produto.variacaoProduto.precoSugerido || 0,
      desconto: 0,
      total: produto.variacaoProduto.precoSugerido || 0,
    };

    setItens([...itens, novoItem]);
    setIsProductModalOpen(false);
    setProdutosSearch("");
  };

  // Atualizar item
  const atualizarItem = (index: number, field: keyof ItemOrcamento, value: any) => {
    const novosItens = [...itens];
    novosItens[index] = {
      ...novosItens[index],
      [field]: value,
    };

    // Recalcular total do item
    const item = novosItens[index];
    item.total = item.quantidade * item.precoUnitario - item.desconto;

    setItens(novosItens);
  };

  // Remover item
  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  // Calcular subtotal
  const calcularSubtotal = () => {
    return itens.reduce((acc, item) => acc + item.total, 0);
  };

  // Calcular desconto em valor
  const calcularDescontoValor = () => {
    const subtotal = calcularSubtotal();
    if (formData.descontoTipo === "percentual") {
      return (subtotal * formData.desconto) / 100;
    }
    return formData.desconto;
  };

  // Calcular total
  const calcularTotal = () => {
    return calcularSubtotal() - calcularDescontoValor();
  };

  // Submeter orçamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (itens.length === 0) {
      setError("Adicione pelo menos um item ao orçamento");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clienteEmail: formData.clienteEmail || undefined,
          clienteTelefone: formData.clienteTelefone || undefined,
          clienteCNPJ: formData.clienteCNPJ || undefined,
          observacoes: formData.observacoes || undefined,
          itens: itens.map((item) => ({
            itemProdutoId: item.itemProdutoId,
            descricao: item.descricao,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            desconto: item.desconto,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/orcamentos/${data.id}`);
      } else {
        const data = await response.json();
        setError(data.error || "Erro ao criar orçamento");
      }
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      setError("Erro ao criar orçamento");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calcularSubtotal();
  const descontoValor = calcularDescontoValor();
  const total = calcularTotal();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/orcamentos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Novo Orçamento</h2>
          <p className="text-muted-foreground">Crie um novo orçamento para seu cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Dados do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
            <CardDescription>Informações do cliente para o orçamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="clienteNome">Nome do Cliente *</Label>
                <Input
                  id="clienteNome"
                  value={formData.clienteNome}
                  onChange={(e) => setFormData({ ...formData, clienteNome: e.target.value })}
                  placeholder="Nome completo ou razão social"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="clienteEmail">Email</Label>
                <Input
                  id="clienteEmail"
                  type="email"
                  value={formData.clienteEmail}
                  onChange={(e) => setFormData({ ...formData, clienteEmail: e.target.value })}
                  placeholder="cliente@email.com"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="clienteTelefone">Telefone</Label>
                <Input
                  id="clienteTelefone"
                  value={formData.clienteTelefone}
                  onChange={(e) => setFormData({ ...formData, clienteTelefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="clienteCNPJ">CNPJ/CPF</Label>
                <Input
                  id="clienteCNPJ"
                  value={formData.clienteCNPJ}
                  onChange={(e) => setFormData({ ...formData, clienteCNPJ: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="validade">Validade *</Label>
                <Input
                  id="validade"
                  type="date"
                  value={formData.validade}
                  onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre o orçamento"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Itens do Orçamento */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Itens do Orçamento</CardTitle>
                <CardDescription>Adicione os produtos que farão parte do orçamento</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProductModalOpen(true)}
                disabled={loading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {itens.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum item adicionado</h3>
                <p className="text-muted-foreground mb-4">
                  Clique em &ldquo;Adicionar Produto&rdquo; para começar
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="w-24">Qtd.</TableHead>
                    <TableHead className="w-32">Preço Unit.</TableHead>
                    <TableHead className="w-32">Desconto</TableHead>
                    <TableHead className="w-32">Total</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.descricao}</p>
                          {item.itemProduto?.codigo && (
                            <p className="text-xs text-muted-foreground font-mono">
                              {item.itemProduto.codigo}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) =>
                            atualizarItem(index, "quantidade", parseInt(e.target.value) || 1)
                          }
                          disabled={loading}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.precoUnitario}
                          onChange={(e) =>
                            atualizarItem(index, "precoUnitario", parseFloat(e.target.value) || 0)
                          }
                          disabled={loading}
                          className="font-mono"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.desconto}
                          onChange={(e) =>
                            atualizarItem(index, "desconto", parseFloat(e.target.value) || 0)
                          }
                          disabled={loading}
                          className="font-mono"
                        />
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {formatCurrency(item.total)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removerItem(index)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Totais */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>Totais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal:</span>
              <span className="text-xl font-mono font-bold">{formatCurrency(subtotal)}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 items-end">
              <div className="col-span-2">
                <Label htmlFor="desconto">Desconto</Label>
                <Input
                  id="desconto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.desconto}
                  onChange={(e) =>
                    setFormData({ ...formData, desconto: parseFloat(e.target.value) || 0 })
                  }
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="descontoTipo">Tipo</Label>
                <NativeSelect
                  id="descontoTipo"
                  value={formData.descontoTipo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descontoTipo: e.target.value as "percentual" | "valor",
                    })
                  }
                  disabled={loading}
                >
                  <option value="percentual">%</option>
                  <option value="valor">R$</option>
                </NativeSelect>
              </div>
            </div>

            {descontoValor > 0 && (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Desconto aplicado:</span>
                <span className="font-mono">- {formatCurrency(descontoValor)}</span>
              </div>
            )}

            <div className="border-t border-blue-200 dark:border-blue-800 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-3xl font-mono font-bold text-success">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Link href="/orcamentos">
            <Button type="button" variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading || itens.length === 0}>
            {loading ? "Criando..." : "Criar Orçamento"}
          </Button>
        </div>
      </form>

      {/* Modal de Seleção de Produtos */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent
          onClose={() => setIsProductModalOpen(false)}
          className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
        >
          <DialogHeader>
            <DialogTitle>Selecionar Produto</DialogTitle>
            <DialogDescription>Escolha um produto para adicionar ao orçamento</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, tipo ou código..."
                value={produtosSearch}
                onChange={(e) => setProdutosSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex-1 overflow-y-auto border rounded-md">
              {loadingProdutos ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Carregando produtos...</p>
                </div>
              ) : produtosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum produto encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Variação</TableHead>
                      <TableHead>Preço Sugerido</TableHead>
                      <TableHead className="w-24"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtosFiltrados.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{produto.nome}</p>
                            {produto.codigo && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {produto.codigo}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{produto.variacaoProduto.tipoProduto.nome}</TableCell>
                        <TableCell>{produto.variacaoProduto.nome}</TableCell>
                        <TableCell className="font-mono font-semibold">
                          {produto.variacaoProduto.precoSugerido
                            ? formatCurrency(produto.variacaoProduto.precoSugerido)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button type="button" size="sm" onClick={() => adicionarProduto(produto)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
