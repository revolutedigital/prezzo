"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Eye, Edit, Trash2, FileText, Download, Send } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  _count: {
    itens: number;
  };
}

const statusConfig = {
  rascunho: { label: "Rascunho", variant: "default" as const },
  enviado: { label: "Enviado", variant: "warning" as const },
  aprovado: { label: "Aprovado", variant: "success" as const },
  rejeitado: { label: "destructive", variant: "destructive" as const },
  expirado: { label: "Expirado", variant: "destructive" as const },
};

export default function OrcamentosPage() {
  const router = useRouter();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);

  const loadOrcamentos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/orcamentos?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setOrcamentos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrcamentos();
  }, [searchTerm, statusFilter]);

  const handleDelete = async () => {
    if (!selectedOrcamento) return;

    try {
      const response = await fetch(`/api/orcamentos/${selectedOrcamento.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadOrcamentos();
        setIsDeleteOpen(false);
        setSelectedOrcamento(null);
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao excluir orçamento");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir orçamento");
    }
  };

  const handleStatusChange = async (orcamentoId: string, novoStatus: string) => {
    try {
      const response = await fetch(`/api/orcamentos/${orcamentoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (response.ok) {
        await loadOrcamentos();
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao atualizar status");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status");
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const isExpired = (validade: string) => {
    return new Date(validade) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Orçamentos</h2>
          <p className="text-muted-foreground">
            Gerencie seus orçamentos e propostas comerciais
          </p>
        </div>
        <Link href="/orcamentos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orcamentos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {orcamentos.filter(o => o.status === "rascunho").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {orcamentos.filter(o => o.status === "enviado").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">
              {orcamentos.filter(o => o.status === "aprovado").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
              {formatCurrency(
                orcamentos
                  .filter(o => o.status === "aprovado")
                  .reduce((acc, o) => acc + Number(o.total), 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Número, cliente, email ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <NativeSelect
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="rascunho">Rascunho</option>
                <option value="enviado">Enviado</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="expirado">Expirado</option>
              </NativeSelect>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando orçamentos...</p>
            </div>
          ) : orcamentos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum orçamento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro orçamento
              </p>
              <Link href="/orcamentos/novo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Orçamento
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orcamentos.map((orcamento) => (
                  <TableRow key={orcamento.id}>
                    <TableCell className="font-mono font-medium">
                      {orcamento.numero}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{orcamento.clienteNome}</p>
                        {orcamento.clienteCNPJ && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {orcamento.clienteCNPJ}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {orcamento.clienteEmail && (
                          <p className="text-muted-foreground">{orcamento.clienteEmail}</p>
                        )}
                        {orcamento.clienteTelefone && (
                          <p className="text-muted-foreground">{orcamento.clienteTelefone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{orcamento._count.itens} item(ns)</TableCell>
                    <TableCell>
                      <div>
                        <p>{formatDate(orcamento.validade)}</p>
                        {isExpired(orcamento.validade) && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            Expirado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {formatCurrency(Number(orcamento.total))}
                    </TableCell>
                    <TableCell>
                      <NativeSelect
                        value={orcamento.status}
                        onChange={(e) => handleStatusChange(orcamento.id, e.target.value)}
                        className="w-32"
                        disabled={orcamento.status === "aprovado"}
                      >
                        <option value="rascunho">Rascunho</option>
                        <option value="enviado">Enviado</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="rejeitado">Rejeitado</option>
                      </NativeSelect>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/orcamentos/${orcamento.id}`}>
                          <Button variant="ghost" size="icon" title="Visualizar">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {orcamento.status === "rascunho" && (
                          <Link href={`/orcamentos/${orcamento.id}/editar`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        {["rascunho", "rejeitado"].includes(orcamento.status) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrcamento(orcamento);
                              setIsDeleteOpen(true);
                            }}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent onClose={() => setIsDeleteOpen(false)}>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o orçamento{" "}
              <strong>{selectedOrcamento?.numero}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedOrcamento(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
