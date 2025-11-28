"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown, FileText, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AtualizacaoCusto {
  id: string;
  materiaPrimaId: string;
  custoAnterior: number;
  custoNovo: number;
  percentualMudanca: number;
  materiaPrima: {
    id: string;
    nome: string;
    codigo: string | null;
    unidadeMedida: string;
  };
  notaFiscal: {
    id: string;
    nomeArquivo: string;
    fornecedor: string | null;
    numeroNF: string | null;
  } | null;
}

interface AlertasData {
  resumo: {
    totalAtualizacoes: number;
    altoImpacto: number;
    medioImpacto: number;
    baixoImpacto: number;
    notasFiscaisPendentes: number;
  };
  atualizacoes: AtualizacaoCusto[];
  notasFiscais: any[];
}

export function AlertasCustosWidget() {
  const [alertas, setAlertas] = useState<AlertasData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlertas();
  }, []);

  const loadAlertas = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/alertas/custos");
      if (response.ok) {
        const data = await response.json();
        setAlertas(data);
      }
    } catch (error) {
      console.error("Erro ao carregar alertas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertas de Custo
          </CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!alertas || alertas.resumo.totalAtualizacoes === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            Alertas de Custo
          </CardTitle>
          <CardDescription>Nenhuma atualização pendente</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Não há atualizações de custo aguardando confirmação.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 dark:border-orange-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Alertas de Custo
            </CardTitle>
            <CardDescription>
              {alertas.resumo.totalAtualizacoes} atualização(ões) aguardando confirmação
            </CardDescription>
          </div>
          <Link href="/prezzo-ai">
            <Button variant="outline" size="sm">
              Ver Todas <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo por impacto */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-3">
            <p className="text-xs text-muted-foreground">Alto Impacto</p>
            <p className="text-2xl font-bold text-red-600">{alertas.resumo.altoImpacto}</p>
            <p className="text-xs text-muted-foreground">&gt;20%</p>
          </div>
          <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 p-3">
            <p className="text-xs text-muted-foreground">Médio Impacto</p>
            <p className="text-2xl font-bold text-orange-600">{alertas.resumo.medioImpacto}</p>
            <p className="text-xs text-muted-foreground">10-20%</p>
          </div>
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-3">
            <p className="text-xs text-muted-foreground">Baixo Impacto</p>
            <p className="text-2xl font-bold text-blue-600">{alertas.resumo.baixoImpacto}</p>
            <p className="text-xs text-muted-foreground">&lt;10%</p>
          </div>
        </div>

        {/* Top 5 atualizações */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Principais Atualizações</p>
          <div className="space-y-2">
            {alertas.atualizacoes.slice(0, 5).map((atualizacao) => {
              const isPositive = Number(atualizacao.percentualMudanca) > 0;
              const percentual = Math.abs(Number(atualizacao.percentualMudanca));

              return (
                <div
                  key={atualizacao.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {atualizacao.materiaPrima.nome}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {atualizacao.notaFiscal && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">
                            {atualizacao.notaFiscal.fornecedor || atualizacao.notaFiscal.nomeArquivo}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground line-through">
                        {formatCurrency(Number(atualizacao.custoAnterior))}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(Number(atualizacao.custoNovo))}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          isPositive ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {percentual.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notas Fiscais Pendentes */}
        {alertas.resumo.notasFiscaisPendentes > 0 && (
          <div className="rounded-lg bg-orange-50 dark:bg-orange-950 p-3 border border-orange-200 dark:border-orange-800">
            <p className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              {alertas.resumo.notasFiscaisPendentes} Nota(s) Fiscal(is) Aguardando Revisão
            </p>
            <Link href="/prezzo-ai">
              <Button variant="link" size="sm" className="h-auto p-0 text-orange-600">
                Revisar agora →
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
