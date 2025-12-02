"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Upload, FileText, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface NotaFiscal {
  id: string;
  nomeArquivo: string;
  fornecedor: string | null;
  numeroNF: string | null;
  dataEmissao: string | null;
  valorTotal: number | null;
  status: string;
  itensProcessados: number;
  itensAtualizados: number;
  erroMensagem: string | null;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; icon: any; variant: any }> = {
  processando: { label: "Processando", icon: Clock, variant: "default" },
  processado: { label: "Processado", icon: CheckCircle2, variant: "success" },
  erro: { label: "Erro", icon: XCircle, variant: "destructive" },
};

export default function PrezzoAIPage() {
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadNotasFiscais = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notas-fiscais");
      if (response.ok) {
        const data = await response.json();
        setNotasFiscais(data);
      }
    } catch (error) {
      console.error("Erro ao carregar notas fiscais:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotasFiscais();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Apenas arquivos PDF são suportados");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/notas-fiscais", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Nota fiscal ${file.name} enviada para processamento!`);

        // Recarregar lista
        loadNotasFiscais();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload do arquivo");
    } finally {
      setUploading(false);
      // Limpar input
      event.target.value = "";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  // Estatísticas
  const stats = {
    total: notasFiscais.length,
    processadas: notasFiscais.filter((nf) => nf.status === "processado").length,
    processando: notasFiscais.filter((nf) => nf.status === "processando").length,
    erros: notasFiscais.filter((nf) => nf.status === "erro").length,
    itensAtualizados: notasFiscais.reduce((acc, nf) => acc + nf.itensAtualizados, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Prezzo AI</h2>
          <p className="text-muted-foreground">
            Atualize custos automaticamente com inteligência artificial
          </p>
        </div>
        <div>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="application/pdf"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button asChild disabled={uploading}>
              <span className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Enviando..." : "Upload Nota Fiscal"}
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de NFs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.processadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processando</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processando}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.erros}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Atualizados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.itensAtualizados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Notas Fiscais */}
      <Card>
        <CardHeader>
          <CardTitle>Notas Fiscais Processadas</CardTitle>
          <CardDescription>Histórico de processamento de notas fiscais</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : notasFiscais.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma nota fiscal processada</p>
              <p className="text-sm text-muted-foreground">
                Faça upload de uma nota fiscal para começar
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Número NF</TableHead>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-center">Itens</TableHead>
                  <TableHead className="text-center">Atualizações</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Upload</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notasFiscais.map((nf) => {
                  const StatusIcon = statusConfig[nf.status]?.icon || FileText;
                  return (
                    <TableRow key={nf.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{nf.nomeArquivo}</span>
                        </div>
                      </TableCell>
                      <TableCell>{nf.fornecedor || "-"}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{nf.numeroNF || "-"}</span>
                      </TableCell>
                      <TableCell>{formatDate(nf.dataEmissao)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {nf.valorTotal ? formatCurrency(Number(nf.valorTotal)) : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {nf.itensProcessados > 0 ? (
                          <Badge variant="outline">{nf.itensProcessados}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {nf.itensAtualizados > 0 ? (
                          <Badge variant="destructive">{nf.itensAtualizados}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[nf.status]?.variant || "default"}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig[nf.status]?.label || nf.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(nf.createdAt)}
                      </TableCell>
                      <TableCell>
                        {nf.status === "processado" && nf.itensAtualizados > 0 && (
                          <Link href={`/prezzo-ai/${nf.id}`}>
                            <Button variant="outline" size="sm">
                              Revisar
                            </Button>
                          </Link>
                        )}
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
