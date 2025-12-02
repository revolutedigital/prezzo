"use client";

import { useState, useEffect, useMemo } from "react";
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
  ArrowUpRight,
  Sparkles,
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
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

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
    return <DashboardSkeleton />;
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-muted-foreground text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Erro ao carregar dados</p>
          <p className="text-sm">Tente recarregar a página</p>
        </div>
        <Button onClick={() => window.location.reload()}>Recarregar</Button>
      </div>
    );
  }

  // Dados para gráfico de pizza (memoizado)
  const pieData = useMemo(
    () =>
      [
        { name: "Rascunho", value: stats.resumo.orcamentosRascunho, color: COLORS[0] },
        { name: "Enviado", value: stats.resumo.orcamentosEnviados, color: COLORS[2] },
        { name: "Aprovado", value: stats.resumo.orcamentosAprovados, color: COLORS[1] },
      ].filter((item) => item.value > 0),
    [
      stats.resumo.orcamentosRascunho,
      stats.resumo.orcamentosEnviados,
      stats.resumo.orcamentosAprovados,
    ]
  );

  // Formatar dados de orçamentos por mês (memoizado)
  const chartData = useMemo(
    () =>
      stats.orcamentosPorMes.map((item) => {
        const [ano, mes] = item.mes.split("-");
        const data = new Date(parseInt(ano), parseInt(mes) - 1);
        return {
          mes: format(data, "MMM/yy", { locale: ptBR }),
          quantidade: item.count,
          valor: item.value,
        };
      }),
    [stats.orcamentosPorMes]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header com CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight flex items-center gap-2">
            Dashboard
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Visão geral do seu sistema de precificação
          </p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Link href="/materias-primas" className="flex-1 sm:flex-none">
            <Button variant="outline" size="sm" className="gap-2 w-full">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Matéria-Prima</span>
              <span className="sm:hidden">MP</span>
            </Button>
          </Link>
          <Link href="/produtos/novo" className="flex-1 sm:flex-none">
            <Button variant="outline" size="sm" className="gap-2 w-full">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Produto</span>
              <span className="sm:hidden">Prod</span>
            </Button>
          </Link>
          <Link href="/orcamentos/novo" className="flex-1 sm:flex-none">
            <Button size="sm" className="gap-2 shadow-lg shadow-primary/25 w-full">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Orçamento</span>
              <span className="sm:hidden">Orç</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - Linha 1 com hover effects */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <Link href="/materias-primas">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Matérias-Primas</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resumo.totalMateriasPrimas}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                cadastradas ativas
                <ArrowUpRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <Link href="/produtos">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resumo.totalTiposProduto}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stats.resumo.totalVariacoes} variações
                <ArrowUpRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <Link href="/orcamentos">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
              <FileText className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resumo.totalOrcamentos}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stats.resumo.orcamentosAprovados} aprovados
                <ArrowUpRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.resumo.taxaConversao.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">orçamentos enviados</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards - Linha 2 - Financeiro destacado */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-green-500/50 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Aprovado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-green-600">
              {formatCurrency(stats.resumo.valorTotalAprovado)}
            </div>
            <p className="text-xs text-muted-foreground">
              em {stats.resumo.orcamentosAprovados} orçamento(s)
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-blue-600">
              {formatCurrency(stats.resumo.valorMedio)}
            </div>
            <p className="text-xs text-muted-foreground">por orçamento aprovado</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Linha */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Orçamentos por Mês</CardTitle>
            <CardDescription>Quantidade e valor dos últimos meses</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="mes" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
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
                    strokeWidth={3}
                    name="Quantidade"
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="valor"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Valor (R$)"
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] space-y-3">
                <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                <div className="text-center">
                  <p className="text-muted-foreground text-sm font-medium">
                    Nenhum orçamento nos últimos 6 meses
                  </p>
                  <Link href="/orcamentos/novo">
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Orçamento
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Pizza */}
        <Card className="hover:shadow-md transition-shadow">
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] space-y-3">
                <FileText className="h-16 w-16 text-muted-foreground/50" />
                <div className="text-center">
                  <p className="text-muted-foreground text-sm font-medium">
                    Nenhum orçamento criado
                  </p>
                  <Link href="/orcamentos/novo">
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Orçamento
                    </Button>
                  </Link>
                </div>
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
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Top Produtos Vendidos</CardTitle>
            <CardDescription>Produtos mais vendidos em orçamentos aprovados</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topProdutos.length > 0 ? (
              <div className="space-y-4">
                {stats.topProdutos.map((produto, index) => (
                  <div
                    key={produto.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${
                          index === 0
                            ? "bg-amber-500 text-white"
                            : index === 1
                              ? "bg-slate-400 text-white"
                              : index === 2
                                ? "bg-amber-700 text-white"
                                : "bg-primary/10 text-primary"
                        }`}
                      >
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
                      <p className="font-mono font-semibold text-green-600">
                        {formatCurrency(produto.valor)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 space-y-3">
                <Package className="h-12 w-12 text-muted-foreground/50" />
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Nenhum produto vendido ainda</p>
                  <Link href="/produtos/novo">
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Produto
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orçamentos Recentes */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Orçamentos Recentes</CardTitle>
            <CardDescription>Últimos orçamentos criados</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.orcamentosRecentes.length > 0 ? (
              <div className="space-y-2">
                {stats.orcamentosRecentes.map((orcamento) => (
                  <Link
                    key={orcamento.id}
                    href={`/orcamentos/${orcamento.id}`}
                    className="flex items-center justify-between hover:bg-accent p-3 rounded-lg transition-all duration-200 hover:shadow-sm"
                  >
                    <div>
                      <p className="font-medium font-mono text-sm">#{orcamento.numero}</p>
                      <p className="text-xs text-muted-foreground">{orcamento.clienteNome}</p>
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
              <div className="flex flex-col items-center justify-center h-32 space-y-3">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Nenhum orçamento criado</p>
                  <Link href="/orcamentos/novo">
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Orçamento
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
