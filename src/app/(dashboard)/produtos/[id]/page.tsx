"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ArrowLeft, Plus, Edit, Trash2, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { VariacaoForm } from "./variacao-form";
import { showSuccess, showError } from "@/lib/toast";

interface TipoProduto {
  id: string;
  nome: string;
  codigo: string | null;
  categoria: string | null;
  descricao: string | null;
  ativo: boolean;
  variacoes: Variacao[];
}

interface Variacao {
  id: string;
  nome: string;
  codigo: string | null;
  sku: string | null;
  margemPadrao: number;
  ativo: boolean;
  composicao: any[];
  custoCalculado?: number;
  precoSugerido?: number;
}

export default function ProdutoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const [tipoProduto, setTipoProduto] = useState<TipoProduto | null>(null);
  const [variacoes, setVariacoes] = useState<Variacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isVariacaoFormOpen, setIsVariacaoFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVariacao, setSelectedVariacao] = useState<Variacao | null>(null);

  const loadTipoProduto = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tipos-produto/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setTipoProduto(data);

        // Carregar variações com cálculos
        const varResponse = await fetch(`/api/variacoes-produto?tipoProdutoId=${params.id}`);
        if (varResponse.ok) {
          const varData = await varResponse.json();
          setVariacoes(varData);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadTipoProduto();
  }, [loadTipoProduto]);

  const handleDeleteVariacao = async () => {
    if (!selectedVariacao) return;

    try {
      const response = await fetch(`/api/variacoes-produto/${selectedVariacao.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSuccess("Variação excluída com sucesso!");
        await loadTipoProduto();
        setIsDeleteOpen(false);
        setSelectedVariacao(null);
      } else {
        const error = await response.json();
        showError(error.message || error.error || "Erro ao excluir variação");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      showError("Erro ao excluir variação");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!tipoProduto) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Produto não encontrado</p>
        <Link href="/produtos" className="mt-4">
          <Button variant="outline">Voltar para Produtos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/produtos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-heading font-bold tracking-tight">{tipoProduto.nome}</h2>
              <Badge variant={tipoProduto.ativo ? "success" : "destructive"}>
                {tipoProduto.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            {tipoProduto.codigo && (
              <p className="text-sm text-muted-foreground font-mono mt-1">{tipoProduto.codigo}</p>
            )}
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedVariacao(null);
            setIsVariacaoFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Variação
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tipoProduto.categoria || "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Variações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{variacoes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {tipoProduto.descricao || "Sem descrição"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Variações */}
      <Card>
        <CardHeader>
          <CardTitle>Variações do Produto</CardTitle>
          <CardDescription>
            Diferentes versões deste produto com composições específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {variacoes.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma variação cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando a primeira variação deste produto
              </p>
              <Button
                onClick={() => {
                  setSelectedVariacao(null);
                  setIsVariacaoFormOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Variação
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código/SKU</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Preço Sugerido</TableHead>
                  <TableHead>Matérias-Primas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variacoes.map((variacao) => (
                  <TableRow key={variacao.id}>
                    <TableCell className="font-medium">{variacao.nome}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {variacao.codigo || variacao.sku || "-"}
                    </TableCell>
                    <TableCell>{variacao.margemPadrao}%</TableCell>
                    <TableCell className="font-mono">
                      {variacao.custoCalculado !== undefined
                        ? formatCurrency(variacao.custoCalculado)
                        : "-"}
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-success">
                      {variacao.precoSugerido !== undefined
                        ? formatCurrency(variacao.precoSugerido)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {variacao.composicao.length > 0 ? (
                        <span className="text-sm">{variacao.composicao.length} item(ns)</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sem composição</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={variacao.ativo ? "success" : "destructive"}>
                        {variacao.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedVariacao(variacao);
                            setIsVariacaoFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedVariacao(variacao);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <Dialog open={isVariacaoFormOpen} onOpenChange={setIsVariacaoFormOpen}>
        <DialogContent
          onClose={() => setIsVariacaoFormOpen(false)}
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>{selectedVariacao ? "Editar Variação" : "Nova Variação"}</DialogTitle>
            <DialogDescription>
              {selectedVariacao
                ? "Atualize as informações da variação"
                : "Cadastre uma nova variação do produto"}
            </DialogDescription>
          </DialogHeader>
          <VariacaoForm
            tipoProdutoId={tipoProduto.id}
            variacao={selectedVariacao}
            onSuccess={() => {
              setIsVariacaoFormOpen(false);
              setSelectedVariacao(null);
              loadTipoProduto();
            }}
            onCancel={() => {
              setIsVariacaoFormOpen(false);
              setSelectedVariacao(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteVariacao}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir a variação "${selectedVariacao?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
