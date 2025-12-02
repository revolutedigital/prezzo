"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  Home,
  ArrowUp,
  ArrowDown,
  FileDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { showSuccess, showError } from "@/lib/toast";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [exportando, setExportando] = useState(false);
  const ITEMS_PER_PAGE = 20;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleExportExcel = async () => {
    try {
      setExportando(true);
      const response = await fetch("/api/export/orcamentos");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orcamentos-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showSuccess("Orçamentos exportados com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
      showError("Erro ao exportar orçamentos");
    } finally {
      setExportando(false);
    }
  };

  // Helper to generate page numbers with ellipsis
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, sortBy, order]);

  const loadOrcamentos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());
      params.append("sortBy", sortBy);
      params.append("order", order);

      const response = await fetch(`/api/orcamentos?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setOrcamentos(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.total);
      }
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statusFilter, currentPage, sortBy, order]);

  useEffect(() => {
    loadOrcamentos();
  }, [loadOrcamentos]);

  const handleDelete = async () => {
    if (!selectedOrcamento) return;

    try {
      const response = await fetch(`/api/orcamentos/${selectedOrcamento.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSuccess("Orçamento excluído com sucesso!");
        await loadOrcamentos();
        setIsDeleteOpen(false);
        setSelectedOrcamento(null);
      } else {
        const error = await response.json();
        showError(error.error || "Erro ao excluir orçamento");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      showError("Erro ao excluir orçamento");
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
        showSuccess("Status atualizado com sucesso!");
        await loadOrcamentos();
      } else {
        const error = await response.json();
        showError(error.error || "Erro ao atualizar status");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      showError("Erro ao atualizar status");
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
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Orçamentos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Orçamentos
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie seus orçamentos e propostas comerciais
          </p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <LoadingButton
            variant="outline"
            onClick={handleExportExcel}
            loading={exportando}
            disabled={orcamentos.length === 0}
            className="transition-all duration-300 hover:shadow-md flex-1 sm:flex-none"
            size="sm"
          >
            <FileDown className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </LoadingButton>
          <Link href="/orcamentos/novo" className="flex-1 sm:flex-none">
            <Button className="transition-all duration-300 hover:shadow-lg w-full" size="sm">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Novo Orçamento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold">{orcamentos.length}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Rascunhos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold">
              {orcamentos.filter((o) => o.status === "rascunho").length}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold">
              {orcamentos.filter((o) => o.status === "enviado").length}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-bold text-success">
              {orcamentos.filter((o) => o.status === "aprovado").length}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-all duration-300 col-span-2 sm:col-span-1">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg sm:text-2xl font-bold font-mono">
              {formatCurrency(
                orcamentos
                  .filter((o) => o.status === "aprovado")
                  .reduce((acc, o) => acc + Number(o.total), 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-xs sm:text-sm">
                Buscar
              </Label>
              <div className="mt-1.5">
                <SearchInput
                  id="search"
                  placeholder="Número, cliente, email ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                  className="transition-all duration-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="status" className="text-xs sm:text-sm">
                  Status
                </Label>
                <NativeSelect
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1.5"
                >
                  <option value="">Todos</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="enviado">Enviado</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                  <option value="expirado">Expirado</option>
                </NativeSelect>
              </div>
              <div>
                <Label htmlFor="sortBy" className="text-xs sm:text-sm">
                  Ordernar por
                </Label>
                <NativeSelect
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mt-1.5"
                >
                  <option value="numero">Número</option>
                  <option value="clienteNome">Cliente</option>
                  <option value="status">Status</option>
                  <option value="valorTotal">Valor</option>
                  <option value="validade">Validade</option>
                  <option value="createdAt">Data</option>
                </NativeSelect>
              </div>
              <div className="flex flex-col col-span-2 sm:col-span-1">
                <Label htmlFor="order" className="text-xs sm:text-sm">
                  Ordem
                </Label>
                <Button
                  id="order"
                  variant="outline"
                  onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                  className="h-10 mt-1.5"
                  size="sm"
                >
                  {order === "asc" ? (
                    <>
                      <ArrowUp className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Crescente</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Decrescente</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Spinner size="xl" text="Carregando orçamentos..." />
            </div>
          ) : orcamentos.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhum orçamento encontrado"
              description={
                debouncedSearchTerm || statusFilter
                  ? "Tente ajustar os filtros para encontrar o que procura"
                  : "Comece criando seu primeiro orçamento"
              }
              action={{
                label: "Criar Primeiro Orçamento",
                onClick: () => (window.location.href = "/orcamentos/novo"),
                icon: Plus,
              }}
            />
          ) : (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
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
                      <TableCell className="font-mono font-medium">{orcamento.numero}</TableCell>
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
            </div>
          )}

          {/* Paginação */}
          {!loading && orcamentos.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {generatePageNumbers().map((page, idx) => (
                    <PaginationItem key={idx}>
                      {page === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => setCurrentPage(page as number)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Rodapé com informações */}
          {!loading && orcamentos.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems} orçamento(s)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o orçamento "${selectedOrcamento?.numero}"?\n\nEsta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
