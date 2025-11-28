"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  DollarSign,
  BarChart3,
  Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AlertasCustosWidget } from "@/components/dashboard/alertas-custos-widget";

interface DashboardStats {
  resumo: {
    totalMateriasPrimas: number;
    totalTiposProduto: number;
    totalVariacoes: number;
    totalOrcamentos: number;
    orcamentosAprovados: number;
    orcamentosEnviados: number;
    orcamentosRascunho: number;
    valorTotalAprovado: number;
    valorMedio: number;
    taxaConversao: number;
  };
  orcamentosPorMes: Array<{
    mes: string;
    count: number;
    value: number;
  }>;
  topProdutos: Array<{
    id: string;
    nome: string;
    quantidade: number;
    valor: number;
  }>;
  orcamentosRecentes: Array<{
    id: string;
    numero: string;
    clienteNome: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const statusConfig: Record<string, { label: string; variant: any }> = {
  rascunho: { label: "Rascunho", variant: "default" },
  enviado: { label: "Enviado", variant: "warning" },
  aprovado: { label: "Aprovado", variant: "success" },
  rejeitado: { label: "Rejeitado", variant: "destructive" },
  expirado: { label: "Expirado", variant: "destructive" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Erro ao carregar dados</p>
      </div>
    );
  }

  // Dados para gráfico de pizza (distribuição de orçamentos)
  const pieData = [
    { name: "Rascunho", value: stats.resumo.orcamentosRascunho, color: COLORS[0] },
    { name: "Enviado", value: stats.resumo.orcamentosEnviados, color: COLORS[2] },
    { name: "Aprovado", value: stats.resumo.orcamentosAprovados, color: COLORS[1] },
  ].filter((item) => item.value > 0);

  // Formatar dados de orçamentos por mês
  const chartData = stats.orcamentosPorMes.map((item) => {
    const [ano, mes] = item.mes.split("-");
    const data = new Date(parseInt(ano), parseInt(mes) - 1);
    return {
      mes: format(data, "MMM/yy", { locale: ptBR }),
      quantidade: item.count,
      valor: item.value,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do seu sistema de precificação
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/materias-primas">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Matéria-Prima
            </Button>
          </Link>
          <Link href="/produtos/novo">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Produto
            </Button>
          </Link>
          <Link href="/orcamentos/novo">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Orçamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Linha 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matérias-Primas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resumo.totalMateriasPrimas}</div>
            <p className="text-xs text-muted-foreground">cadastradas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.resumo.totalTiposProduto}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.resumo.totalVariacoes} variações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resumo.totalOrcamentos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.resumo.orcamentosAprovados} aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.resumo.taxaConversao.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">orçamentos enviados</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Linha 2 - Financeiro */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Aprovado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-success">
              {formatCurrency(stats.resumo.valorTotalAprovado)}
            </div>
            <p className="text-xs text-muted-foreground">
              em {stats.resumo.orcamentosAprovados} orçamento(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {formatCurrency(stats.resumo.valorMedio)}
            </div>
            <p className="text-xs text-muted-foreground">por orçamento aprovado</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Linha - Orçamentos por Mês */}
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos por Mês</CardTitle>
            <CardDescription>Quantidade e valor dos últimos meses</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === "valor") {
                        return [formatCurrency(value), "Valor"];
                      }
                      return [value, "Quantidade"];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="quantidade"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Quantidade"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="valor"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Valor (R$)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground text-sm">
                  Nenhum orçamento nos últimos 6 meses
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição de Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Orçamentos</CardTitle>
            <CardDescription>Por status atual</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground text-sm">Nenhum orçamento criado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Widget de Alertas de Custo */}
      <AlertasCustosWidget />

      {/* Top Produtos e Orçamentos Recentes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produtos Vendidos</CardTitle>
            <CardDescription>Produtos mais vendidos em orçamentos aprovados</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topProdutos.length > 0 ? (
              <div className="space-y-4">
                {stats.topProdutos.map((produto, index) => (
                  <div key={produto.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{produto.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {produto.quantidade} unidades
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold">
                        {formatCurrency(produto.valor)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground text-sm">
                  Nenhum produto vendido ainda
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orçamentos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos Recentes</CardTitle>
            <CardDescription>Últimos orçamentos criados</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.orcamentosRecentes.length > 0 ? (
              <div className="space-y-4">
                {stats.orcamentosRecentes.map((orcamento) => (
                  <Link
                    key={orcamento.id}
                    href={`/orcamentos/${orcamento.id}`}
                    className="flex items-center justify-between hover:bg-accent p-2 rounded-md transition-colors"
                  >
                    <div>
                      <p className="font-medium font-mono text-sm">#{orcamento.numero}</p>
                      <p className="text-xs text-muted-foreground">
                        {orcamento.clienteNome}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-mono font-semibold text-sm">
                          {formatCurrency(Number(orcamento.total))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(orcamento.createdAt), "dd/MM/yy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <Badge variant={statusConfig[orcamento.status]?.variant || "default"}>
                        {statusConfig[orcamento.status]?.label || orcamento.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground text-sm">Nenhum orçamento criado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
