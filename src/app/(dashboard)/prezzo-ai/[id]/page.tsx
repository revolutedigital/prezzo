"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AtualizacaoCusto {
  id: string;
  materiaPrimaId: string;
  custoAnterior: number;
  custoNovo: number;
  percentualMudanca: number;
  confirmado: boolean;
  materiaPrima: {
    id: string;
    nome: string;
    codigo: string | null;
    unidadeMedida: string;
    custoUnitario: number;
  };
}

interface NotaFiscal {
  id: string;
  nomeArquivo: string;
  fornecedor: string | null;
  numeroNF: string | null;
  dataEmissao: string | null;
  valorTotal: number | null;
  status: string;
  dadosExtraidos: any;
  itensProcessados: number;
  itensAtualizados: number;
  createdAt: string;
  atualizacoes: AtualizacaoCusto[];
  user: {
    nome: string;
    email: string;
  };
}

export default function PrezzoAIDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const [notaFiscal, setNotaFiscal] = useState<NotaFiscal | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);

  const loadNotaFiscal = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notas-fiscais/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotaFiscal(data);

        // Pré-selecionar atualizações não confirmadas
        const naoConfirmadas = data.atualizacoes
          .filter((a: AtualizacaoCusto) => !a.confirmado)
          .map((a: AtualizacaoCusto) => a.id);
        setSelectedIds(new Set(naoConfirmadas));
      } else {
        router.push("/prezzo-ai");
      }
    } catch (error) {
      console.error("Erro ao carregar nota fiscal:", error);
      router.push("/prezzo-ai");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotaFiscal();
  }, [params.id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (!notaFiscal) return;

    const naoConfirmadas = notaFiscal.atualizacoes
      .filter((a) => !a.confirmado)
      .map((a) => a.id);

    if (selectedIds.size === naoConfirmadas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(naoConfirmadas));
    }
  };

  const handleConfirmar = async () => {
    if (selectedIds.size === 0) {
      alert("Selecione pelo menos uma atualização para confirmar");
      return;
    }

    if (!confirm(`Confirmar ${selectedIds.size} atualização(ões) de custo?`)) {
      return;
    }

    try {
      setConfirming(true);

      const response = await fetch(`/api/notas-fiscais/${params.id}/confirmar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          atualizacaoIds: Array.from(selectedIds),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);

        // Recarregar dados
        loadNotaFiscal();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao confirmar atualizações:", error);
      alert("Erro ao confirmar atualizações");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando nota fiscal...</p>
      </div>
    );
  }

  if (!notaFiscal) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground">Nota fiscal não encontrada</p>
        <Link href="/prezzo-ai" className="mt-4">
          <Button variant="outline">Voltar para Prezzo AI</Button>
        </Link>
      </div>
    );
  }

  const atualizacoesNaoConfirmadas = notaFiscal.atualizacoes.filter((a) => !a.confirmado);
  const atualizacoesConfirmadas = notaFiscal.atualizacoes.filter((a) => a.confirmado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/prezzo-ai">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-heading font-bold tracking-tight">
              Revisar Atualizações
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {notaFiscal.nomeArquivo} • Processado em {formatDateTime(notaFiscal.createdAt)}
            </p>
          </div>
        </div>
        {atualizacoesNaoConfirmadas.length > 0 && (
          <Button
            onClick={handleConfirmar}
            disabled={selectedIds.size === 0 || confirming}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {confirming
              ? "Confirmando..."
              : `Confirmar ${selectedIds.size} Selecionada(s)`}
          </Button>
        )}
      </div>

      {/* Informações da NF */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Nota Fiscal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Fornecedor</p>
              <p className="font-medium">{notaFiscal.fornecedor || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Número NF</p>
              <p className="font-medium font-mono">{notaFiscal.numeroNF || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data Emissão</p>
              <p className="font-medium">{formatDate(notaFiscal.dataEmissao)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="font-medium font-mono">
                {notaFiscal.valorTotal ? formatCurrency(Number(notaFiscal.valorTotal)) : "-"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Itens Processados</p>
              <p className="font-medium">{notaFiscal.itensProcessados}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atualizações Detectadas</p>
              <p className="font-medium">{notaFiscal.itensAtualizados}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Processado por</p>
              <p className="font-medium">{notaFiscal.user.nome}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Atualizações Pendentes */}
      {atualizacoesNaoConfirmadas.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Atualizações Pendentes
                </CardTitle>
                <CardDescription>
                  {atualizacoesNaoConfirmadas.length} atualização(ões) aguardando confirmação
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {selectedIds.size === atualizacoesNaoConfirmadas.length
                  ? "Desmarcar Todas"
                  : "Selecionar Todas"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Matéria-Prima</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Custo Atual</TableHead>
                  <TableHead className="text-right">Custo Novo</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                  <TableHead className="text-center">Impacto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atualizacoesNaoConfirmadas.map((atualizacao) => {
                  const isPositive = Number(atualizacao.percentualMudanca) > 0;
                  const isSelected = selectedIds.has(atualizacao.id);

                  return (
                    <TableRow
                      key={atualizacao.id}
                      className={isSelected ? "bg-blue-50 dark:bg-blue-950" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(atualizacao.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{atualizacao.materiaPrima.nome}</p>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {atualizacao.materiaPrima.codigo || "-"}
                        </span>
                      </TableCell>
                      <TableCell>{atualizacao.materiaPrima.unidadeMedida}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(Number(atualizacao.custoAnterior))}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(Number(atualizacao.custoNovo))}
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
                            {Number(atualizacao.percentualMudanca).toFixed(2)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {Math.abs(Number(atualizacao.percentualMudanca)) > 20 ? (
                          <Badge variant="destructive">Alto</Badge>
                        ) : Math.abs(Number(atualizacao.percentualMudanca)) > 10 ? (
                          <Badge variant="warning">Médio</Badge>
                        ) : (
                          <Badge variant="default">Baixo</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Atualizações Confirmadas */}
      {atualizacoesConfirmadas.length > 0 && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Atualizações Confirmadas
            </CardTitle>
            <CardDescription>
              {atualizacoesConfirmadas.length} atualização(ões) já aplicada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matéria-Prima</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead className="text-right">Custo Anterior</TableHead>
                  <TableHead className="text-right">Custo Novo</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atualizacoesConfirmadas.map((atualizacao) => {
                  const isPositive = Number(atualizacao.percentualMudanca) > 0;

                  return (
                    <TableRow key={atualizacao.id}>
                      <TableCell>
                        <p className="font-medium">{atualizacao.materiaPrima.nome}</p>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {atualizacao.materiaPrima.codigo || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(Number(atualizacao.custoAnterior))}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(Number(atualizacao.custoNovo))}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-mono ${
                            isPositive ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {Number(atualizacao.percentualMudanca).toFixed(2)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Sem atualizações */}
      {notaFiscal.atualizacoes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 pt-6">
            <p className="text-muted-foreground">
              Nenhuma atualização de custo detectada nesta nota fiscal
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Os itens da NF não foram associados a matérias-primas cadastradas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
