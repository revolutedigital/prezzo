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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface HistoricoCusto {
  id: string;
  materiaPrima: {
    id: string;
    nome: string;
    unidadeMedida: string;
  };
  custoAnterior: number;
  custoNovo: number;
  percentualMudanca: number;
  motivo: string;
  createdAt: string;
}

interface EvolucaoMaterial {
  materiaPrimaId: string;
  nome: string;
  historico: Array<{
    data: string;
    custo: number;
  }>;
}

export function RelatorioEvolucaoCustos() {
  const [historico, setHistorico] = useState<HistoricoCusto[]>([]);
  const [evolucao, setEvolucao] = useState<EvolucaoMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDados();
  }, []);

  const loadDados = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/relatorios/evolucao-custos");
      if (response.ok) {
        const data = await response.json();
        setHistorico(data.historico);
        setEvolucao(data.evolucao);
      }
    } catch (error) {
      console.error("Erro ao carregar evolução de custos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Estatísticas
  const aumentos = historico.filter((h) => Number(h.percentualMudanca) > 0).length;
  const reducoes = historico.filter((h) => Number(h.percentualMudanca) < 0).length;
  const variacaoMedia =
    historico.length > 0
      ? historico.reduce((acc, h) => acc + Math.abs(Number(h.percentualMudanca)), 0) /
        historico.length
      : 0;

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
            <CardTitle className="text-sm font-medium">Atualizações Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{historico.length}</div>
            <p className="text-xs text-muted-foreground">Mudanças de custo registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aumentos / Reduções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <div className="text-2xl font-bold text-red-600">{aumentos}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Aumentos
                </p>
              </div>
              <div className="border-l pl-4">
                <div className="text-2xl font-bold text-green-600">{reducoes}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  Reduções
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Variação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{variacaoMedia.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Média absoluta de mudança</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Evolução */}
      {evolucao.slice(0, 3).map((material) => (
        <Card key={material.materiaPrimaId}>
          <CardHeader>
            <CardTitle>{material.nome}</CardTitle>
            <CardDescription>Evolução do custo ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={material.historico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="data"
                  tickFormatter={(value) => format(new Date(value), "dd/MM", { locale: ptBR })}
                />
                <YAxis tickFormatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Tooltip
                  labelFormatter={(value) =>
                    format(new Date(value), "dd/MM/yyyy", { locale: ptBR })
                  }
                  formatter={(value: any) => [formatCurrency(value), "Custo"]}
                />
                <Line
                  type="monotone"
                  dataKey="custo"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mudanças</CardTitle>
          <CardDescription>Últimas 20 atualizações de custo</CardDescription>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Nenhuma mudança de custo registrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Matéria-Prima</TableHead>
                  <TableHead className="text-right">Custo Anterior</TableHead>
                  <TableHead className="text-right">Custo Novo</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historico.slice(0, 20).map((item) => {
                  const isPositive = Number(item.percentualMudanca) > 0;

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm">
                        {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{item.materiaPrima.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.materiaPrima.unidadeMedida}
                        </p>
                      </TableCell>
                      <TableCell className="text-right font-mono line-through text-muted-foreground">
                        {formatCurrency(Number(item.custoAnterior))}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(Number(item.custoNovo))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-green-600" />
                          )}
                          <span
                            className={`font-mono font-semibold ${
                              isPositive ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {isPositive ? "+" : ""}
                            {Number(item.percentualMudanca).toFixed(2)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.motivo}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
