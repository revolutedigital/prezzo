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
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
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

interface OrcamentoRentabilidade {
  id: string;
  numero: string;
  clienteNome: string;
  subtotal: number;
  desconto: number;
  total: number;
  createdAt: string;
  custoTotal: number;
  lucroTotal: number;
  margemMedia: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function RelatorioRentabilidade() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoRentabilidade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDados();
  }, []);

  const loadDados = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/relatorios/rentabilidade");
      if (response.ok) {
        const data = await response.json();
        setOrcamentos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar rentabilidade:", error);
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas
  const totalVendas = orcamentos.reduce((acc, orc) => acc + Number(orc.total), 0);
  const totalCustos = orcamentos.reduce((acc, orc) => acc + Number(orc.custoTotal), 0);
  const totalLucro = orcamentos.reduce((acc, orc) => acc + Number(orc.lucroTotal), 0);
  const margemGlobal = totalVendas > 0 ? ((totalLucro / totalCustos) * 100) : 0;

  // Dados para gráfico de pizza (top 5 clientes)
  const clientesAgrupados = orcamentos.reduce((acc, orc) => {
    if (!acc[orc.clienteNome]) {
      acc[orc.clienteNome] = {
        nome: orc.clienteNome,
        total: 0,
      };
    }
    acc[orc.clienteNome].total += Number(orc.total);
    return acc;
  }, {} as Record<string, { nome: string; total: number }>);

  const topClientes = Object.values(clientesAgrupados)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const pieData = topClientes.map((cliente, index) => ({
    name: cliente.nome,
    value: cliente.total,
    color: COLORS[index % COLORS.length],
  }));

  // Dados para gráfico de barras (lucro por orçamento)
  const chartData = orcamentos.slice(0, 10).map((orc) => ({
    numero: orc.numero,
    custo: Number(orc.custoTotal),
    venda: Number(orc.total),
    lucro: Number(orc.lucroTotal),
  }));

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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total em Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              {formatCurrency(totalVendas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {orcamentos.length} orçamento(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(totalCustos)}
            </div>
            <p className="text-xs text-muted-foreground">Soma dos custos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">
              {formatCurrency(totalLucro)}
            </div>
            <p className="text-xs text-muted-foreground">Lucro líquido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Margem Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{margemGlobal.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Margem média geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Barras - Lucro por Orçamento */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Custo vs. Venda vs. Lucro</CardTitle>
              <CardDescription>Últimos 10 orçamentos aprovados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="numero" />
                  <YAxis tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="custo" fill="#ef4444" name="Custo" />
                  <Bar dataKey="venda" fill="#3b82f6" name="Venda" />
                  <Bar dataKey="lucro" fill="#10b981" name="Lucro" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Pizza - Top Clientes */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Clientes</CardTitle>
              <CardDescription>Por valor total de orçamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) =>
                      `${entry.name}: ${formatCurrency(entry.value)}`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Orçamento</CardTitle>
          <CardDescription>Rentabilidade detalhada de orçamentos aprovados</CardDescription>
        </CardHeader>
        <CardContent>
          {orcamentos.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Nenhum orçamento aprovado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Orçamento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Venda</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orcamentos.map((orc) => (
                  <TableRow key={orc.id}>
                    <TableCell className="text-sm">
                      {format(new Date(orc.createdAt), "dd/MM/yy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-mono font-medium">#{orc.numero}</TableCell>
                    <TableCell>{orc.clienteNome}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(Number(orc.custoTotal))}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(Number(orc.total))}
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600 font-semibold">
                      {formatCurrency(Number(orc.lucroTotal))}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {Number(orc.margemMedia).toFixed(1)}%
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
