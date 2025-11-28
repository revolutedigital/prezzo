"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProdutoMargem {
  id: string;
  nome: string;
  tipoProduto: string;
  custoCalculado: number;
  margemLucro: number;
  precoVenda: number;
  lucroUnitario: number;
  tabelaPreco: string;
}

export function RelatorioMargens() {
  const [produtos, setProdutos] = useState<ProdutoMargem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/relatorios/margens");
      if (response.ok) {
        const data = await response.json();
        setProdutos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar relatório de margens:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMargemVariant = (margem: number) => {
    if (margem < 20) return "destructive";
    if (margem < 35) return "warning";
    return "success";
  };

  const getMargemLabel = (margem: number) => {
    if (margem < 20) return "Baixa";
    if (margem < 35) return "Média";
    return "Alta";
  };

  // Preparar dados para o gráfico
  const chartData = produtos.slice(0, 10).map((p) => ({
    nome: p.nome.length > 20 ? p.nome.substring(0, 20) + "..." : p.nome,
    margem: Number(p.margemLucro),
    lucro: Number(p.lucroUnitario),
  }));

  // Estatísticas
  const margemMedia =
    produtos.length > 0
      ? produtos.reduce((acc, p) => acc + Number(p.margemLucro), 0) / produtos.length
      : 0;

  const produtosBaixaMargem = produtos.filter((p) => Number(p.margemLucro) < 20).length;
  const produtosAltaMargem = produtos.filter((p) => Number(p.margemLucro) >= 35).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96 pt-6">
          <p className="text-muted-foreground">Carregando relatório...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{margemMedia.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Média de {produtos.length} produtos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Produtos com Margem Baixa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{produtosBaixaMargem}</div>
            <p className="text-xs text-muted-foreground">Margem menor que 20%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Produtos com Alta Margem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{produtosAltaMargem}</div>
            <p className="text-xs text-muted-foreground">Margem acima de 35%</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Produtos por Margem</CardTitle>
            <CardDescription>Visualização das margens de lucro</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "margem") return [value.toFixed(1) + "%", "Margem"];
                    if (name === "lucro") return [formatCurrency(value), "Lucro Unitário"];
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="margem" fill="#3b82f6" name="Margem (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Margens por Produto</CardTitle>
          <CardDescription>Análise detalhada de custos e margens</CardDescription>
        </CardHeader>
        <CardContent>
          {produtos.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                  <TableHead className="text-right">Preço Venda</TableHead>
                  <TableHead className="text-right">Lucro Unit.</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((produto) => (
                  <TableRow key={produto.id}>
                    <TableCell>
                      <p className="font-medium">{produto.nome}</p>
                      <p className="text-xs text-muted-foreground">{produto.tabelaPreco}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {produto.tipoProduto}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(Number(produto.custoCalculado))}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">
                        {Number(produto.margemLucro).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(Number(produto.precoVenda))}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      {formatCurrency(Number(produto.lucroUnitario))}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getMargemVariant(Number(produto.margemLucro))}>
                        {getMargemLabel(Number(produto.margemLucro))}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
