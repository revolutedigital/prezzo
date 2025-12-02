"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Boxes,
  LayoutGrid,
  List,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  Sparkles,
  Home,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { MateriaPrimaForm } from "./materia-prima-form";
import { showSuccess, showError } from "@/lib/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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

interface MateriaPrima {
  id: string;
  nome: string;
  codigo: string | null;
  unidadeMedida: string;
  custoUnitario: number;
  fornecedor: string | null;
  categoria: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    composicoes: number;
  };
}

type ViewMode = "table" | "cards";

export default function MateriasPrimasPage() {
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ativo, setAtivo] = useState("true");
  const [sortBy, setSortBy] = useState("nome");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 50;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MateriaPrima | null>(null);

  // Debounce search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
  }, [debouncedSearch, categoria, ativo, sortBy, order]);

  // Carregar matérias-primas
  const loadMateriasPrimas = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (categoria) params.append("categoria", categoria);
      if (ativo) params.append("ativo", ativo);
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());
      params.append("sortBy", sortBy);
      params.append("order", order);

      const response = await fetch(`/api/materias-primas?${params}`);
      if (response.ok) {
        const result = await response.json();
        setMateriasPrimas(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.total);
      }
    } catch (error) {
      console.error("Erro ao carregar matérias-primas:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categoria, ativo, currentPage, sortBy, order]);

  useEffect(() => {
    loadMateriasPrimas();
  }, [loadMateriasPrimas]);

  // Stats calculadas
  const stats = useMemo(() => {
    const ativos = materiasPrimas.filter((m) => m.ativo);
    const inativos = materiasPrimas.filter((m) => !m.ativo);
    const totalCusto = materiasPrimas.reduce((acc, m) => acc + Number(m.custoUnitario), 0);
    const emUso = materiasPrimas.filter((m) => m._count.composicoes > 0);

    return {
      total: materiasPrimas.length,
      ativos: ativos.length,
      inativos: inativos.length,
      totalCusto,
      emUso: emUso.length,
      medioCusto: materiasPrimas.length > 0 ? totalCusto / materiasPrimas.length : 0,
    };
  }, [materiasPrimas]);

  // Categorias únicas
  const categorias = useMemo(
    () => Array.from(new Set(materiasPrimas.map((m) => m.categoria).filter(Boolean))),
    [materiasPrimas]
  );

  // Bulk actions
  const handleBulkStatusChange = async (newStatus: boolean) => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/materias-primas/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ativo: newStatus }),
          })
        )
      );
      setSelectedIds([]);
      showSuccess(`Status atualizado para ${selectedIds.length} matéria(s)-prima(s)!`);
      await loadMateriasPrimas();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      showError("Erro ao atualizar status dos materiais");
    }
  };

  // Deletar matéria-prima
  const handleDelete = async () => {
    if (!selectedMaterial) return;

    try {
      const response = await fetch(`/api/materias-primas/${selectedMaterial.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSuccess("Matéria-prima excluída com sucesso!");
        await loadMateriasPrimas();
        setIsDeleteOpen(false);
        setSelectedMaterial(null);
      } else {
        const error = await response.json();
        showError(error.message || error.error || "Erro ao excluir matéria-prima");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      showError("Erro ao excluir matéria-prima");
    }
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === materiasPrimas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(materiasPrimas.map((m) => m.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="xl" text="Carregando matérias-primas..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
            <BreadcrumbPage>Matérias-Primas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Matérias-Primas
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie seus materiais e insumos de forma eficiente
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedMaterial(null);
            setIsFormOpen(true);
          }}
          className="transition-all duration-300 hover:shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Matéria-Prima
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Materiais</CardTitle>
            <Boxes className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ativos} ativos, {stats.inativos} inativos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-green-500/50 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-green-600">
              {formatCurrency(stats.totalCusto)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média: {formatCurrency(stats.medioCusto)}/unidade
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emUso}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${Math.round((stats.emUso / stats.total) * 100)}% do total`
                : "Nenhum material"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Filter className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorias.length}</div>
            <p className="text-xs text-muted-foreground">
              {categorias.length > 0 ? "categorias diferentes" : "Nenhuma categoria"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e View Toggle */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar por nome, código ou fornecedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            className="transition-all duration-300"
          />
        </div>
        <NativeSelect
          value={categoria || ""}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-48"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat || ""}>
              {cat}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect value={ativo} onChange={(e) => setAtivo(e.target.value)} className="w-32">
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </NativeSelect>
        <NativeSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-40">
          <option value="nome">Nome</option>
          <option value="codigo">Código</option>
          <option value="custoUnitario">Custo</option>
          <option value="fornecedor">Fornecedor</option>
          <option value="categoria">Categoria</option>
          <option value="createdAt">Data</option>
        </NativeSelect>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
          className="shrink-0"
        >
          {order === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </Button>
        <div className="flex gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-8 px-3"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
            className="h-8 px-3"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="border-primary/50 bg-primary/5 animate-in slide-in-from-top duration-300">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedIds.length}{" "}
                {selectedIds.length === 1 ? "item selecionado" : "itens selecionados"}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange(true)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Ativar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange(false)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Desativar
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {materiasPrimas.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhuma matéria-prima encontrada"
          description={
            debouncedSearch || categoria || ativo !== "true"
              ? "Tente ajustar os filtros para encontrar o que procura"
              : "Comece cadastrando sua primeira matéria-prima para montar produtos"
          }
          action={{
            label: "Cadastrar Primeira Matéria-Prima",
            onClick: () => {
              setSelectedMaterial(null);
              setIsFormOpen(true);
            },
            icon: Plus,
          }}
        />
      ) : viewMode === "cards" ? (
        /* Cards View */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materiasPrimas.map((material) => (
            <Card
              key={material.id}
              className={cn(
                "hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group",
                selectedIds.includes(material.id) && "ring-2 ring-primary"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedIds.includes(material.id)}
                      onCheckedChange={() => toggleSelection(material.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base font-semibold leading-tight">
                        {material.nome}
                      </CardTitle>
                      {material.codigo && (
                        <p className="text-xs text-muted-foreground font-mono">{material.codigo}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={material.ativo ? "default" : "secondary"} className="shrink-0">
                    {material.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Unidade</p>
                      <p className="font-medium">{material.unidadeMedida}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Custo</p>
                      <p className="font-mono font-semibold text-green-600">
                        {formatCurrency(Number(material.custoUnitario))}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Fornecedor</p>
                      <p className="font-medium truncate" title={material.fornecedor || "-"}>
                        {material.fornecedor || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Categoria</p>
                      <p className="font-medium truncate" title={material.categoria || "-"}>
                        {material.categoria || "-"}
                      </p>
                    </div>
                  </div>

                  {material._count.composicoes > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <Sparkles className="h-3 w-3" />
                      Usado em {material._count.composicoes} produto(s)
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedMaterial(material);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedMaterial(material);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === materiasPrimas.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Custo Unitário</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materiasPrimas.map((material) => (
                  <TableRow
                    key={material.id}
                    className={cn(
                      "hover:bg-muted/50 transition-colors",
                      selectedIds.includes(material.id) && "bg-primary/5"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(material.id)}
                        onCheckedChange={() => toggleSelection(material.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{material.nome}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {material.codigo || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>{material.unidadeMedida}</TableCell>
                    <TableCell className="font-mono font-semibold text-green-600">
                      {formatCurrency(Number(material.custoUnitario))}
                    </TableCell>
                    <TableCell>
                      {material.fornecedor || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {material.categoria || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={material.ativo ? "default" : "secondary"}>
                        {material.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {material._count.composicoes > 0 ? (
                        <span className="text-sm flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          {material._count.composicoes} produto(s)
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMaterial(material);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedMaterial(material);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Paginação */}
      {!loading && materiasPrimas.length > 0 && totalPages > 1 && (
        <div className="flex justify-center">
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
                    currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Footer Info */}
      {materiasPrimas.length > 0 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
            {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems} matéria(s)-prima(s)
            {(debouncedSearch || categoria || ativo) && " com filtros aplicados"}
          </span>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      )}

      {/* Modal de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent onClose={() => setIsFormOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {selectedMaterial ? "Editar Matéria-Prima" : "Nova Matéria-Prima"}
            </DialogTitle>
            <DialogDescription>
              {selectedMaterial
                ? "Atualize as informações da matéria-prima"
                : "Cadastre uma nova matéria-prima no sistema"}
            </DialogDescription>
          </DialogHeader>
          <MateriaPrimaForm
            materiaPrima={selectedMaterial}
            onSuccess={() => {
              setIsFormOpen(false);
              setSelectedMaterial(null);
              loadMateriasPrimas();
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedMaterial(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir a matéria-prima "${selectedMaterial?.nome}"?${
          selectedMaterial && selectedMaterial._count.composicoes > 0
            ? `\n\n⚠️ Esta matéria-prima está sendo usada em ${selectedMaterial._count.composicoes} produto(s)!`
            : ""
        }\n\nEsta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
