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
import { ArrowLeft, Download, Send, Edit, Trash2, FileText, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { showError } from "@/lib/toast";

interface Orcamento {
  id: string;
  numero: string;
  clienteNome: string;
  clienteEmail: string | null;
  clienteTelefone: string | null;
  clienteCNPJ: string | null;
  validade: string;
  subtotal: number;
  desconto: number;
  descontoTipo: string;
  total: number;
  status: string;
  observacoes: string | null;
  createdAt: string;
  itens: ItemOrcamento[];
  user: {
    nome: string;
    email: string;
  };
}

interface ItemOrcamento {
  id: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  total: number;
  itemProduto: {
    nome: string;
    codigo: string | null;
    variacaoProduto: {
      nome: string;
      tipoProduto: {
        nome: string;
      };
    };
  };
}

const statusConfig: Record<string, { label: string; variant: any }> = {
  rascunho: { label: "Rascunho", variant: "default" },
  enviado: { label: "Enviado", variant: "warning" },
  aprovado: { label: "Aprovado", variant: "success" },
  rejeitado: { label: "Rejeitado", variant: "destructive" },
  expirado: { label: "Expirado", variant: "destructive" },
};

export default function OrcamentoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const loadOrcamento = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orcamentos/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrcamento(data);
      } else {
        router.push("/orcamentos");
      }
    } catch (error) {
      console.error("Erro ao carregar orçamento:", error);
      router.push("/orcamentos");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    loadOrcamento();
  }, [loadOrcamento]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const isExpired = (validade: string) => {
    return new Date(validade) < new Date();
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const response = await fetch(`/api/orcamentos/${params.id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orcamento-${orcamento?.numero}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        showError('Erro ao gerar PDF');
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      showError('Erro ao gerar PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const calcularDescontoValor = () => {
    if (!orcamento) return 0;
    if (orcamento.descontoTipo === "percentual") {
      return (Number(orcamento.subtotal) * Number(orcamento.desconto)) / 100;
    }
    return Number(orcamento.desconto);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Carregando orçamento...</p>
      </div>
    );
  }

  if (!orcamento) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Orçamento não encontrado</p>
        <Link href="/orcamentos" className="mt-4">
          <Button variant="outline">Voltar para Orçamentos</Button>
        </Link>
      </div>
    );
  }

  const descontoValor = calcularDescontoValor();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/orcamentos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-heading font-bold tracking-tight font-mono">
                #{orcamento.numero}
              </h2>
              <Badge variant={statusConfig[orcamento.status]?.variant || "default"}>
                {statusConfig[orcamento.status]?.label || orcamento.status}
              </Badge>
              {isExpired(orcamento.validade) && orcamento.status !== "aprovado" && (
                <Badge variant="destructive">Expirado</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Criado em {formatDateTime(orcamento.createdAt)} por {orcamento.user.nome}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={downloadingPDF}>
            {downloadingPDF ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </>
            )}
          </Button>
          {orcamento.status === "rascunho" && (
            <>
              <Link href={`/orcamentos/${orcamento.id}/editar`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </Link>
              <Button size="sm">
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{orcamento.clienteNome}</p>
            </div>
            {orcamento.clienteEmail && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{orcamento.clienteEmail}</p>
              </div>
            )}
            {orcamento.clienteTelefone && (
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{orcamento.clienteTelefone}</p>
              </div>
            )}
            {orcamento.clienteCNPJ && (
              <div>
                <p className="text-sm text-muted-foreground">CNPJ/CPF</p>
                <p className="font-medium font-mono">{orcamento.clienteCNPJ}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Validade</p>
              <p className="font-medium">{formatDate(orcamento.validade)}</p>
            </div>
          </div>
          {orcamento.observacoes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Observações</p>
              <p className="mt-1">{orcamento.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Itens do Orçamento */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Orçamento</CardTitle>
          <CardDescription>
            {orcamento.itens.length} item(ns) no orçamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Qtd.</TableHead>
                <TableHead className="text-right">Preço Unit.</TableHead>
                <TableHead className="text-right">Desconto</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orcamento.itens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.itemProduto.variacaoProduto.tipoProduto.nome} -{" "}
                        {item.itemProduto.variacaoProduto.nome} - {item.itemProduto.nome}
                      </p>
                      {item.itemProduto.codigo && (
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          Código: {item.itemProduto.codigo}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantidade}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(Number(item.precoUnitario))}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.desconto > 0 ? formatCurrency(Number(item.desconto)) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {formatCurrency(Number(item.total))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totais */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle>Totais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Subtotal:</span>
            <span className="text-xl font-mono font-bold">
              {formatCurrency(Number(orcamento.subtotal))}
            </span>
          </div>

          {Number(orcamento.desconto) > 0 && (
            <>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>
                  Desconto (
                  {orcamento.descontoTipo === "percentual"
                    ? `${orcamento.desconto}%`
                    : "R$"}
                  ):
                </span>
                <span className="font-mono">- {formatCurrency(descontoValor)}</span>
              </div>
              <div className="border-t border-blue-200 dark:border-blue-800 pt-3"></div>
            </>
          )}

          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-3xl font-mono font-bold text-success">
              {formatCurrency(Number(orcamento.total))}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
