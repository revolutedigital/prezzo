"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
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
import { SearchInput } from "@/components/ui/search-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import {
  Plus,
  Pencil,
  Trash2,
  Wrench,
  DollarSign,
  Users,
  Cog,
  TrendingUp,
  LayoutGrid,
  List,
  CheckCircle2,
  Home,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import { MaoDeObraDialog } from "@/components/mao-de-obra/mao-de-obra-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { showSuccess, showError } from "@/lib/toast";
import { formatCurrency, cn } from "@/lib/utils";
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

interface TipoMaoDeObra {
  id: string;
  nome: string;
  codigo?: string | null;
  custoHora: number;
  incluiMaquina: boolean;
  custoMaquinaHora?: number | null;
  descricao?: string | null;
  ativo: boolean;
  custoTotalHora: number;
  produtosVinculados: number;
}

type ViewMode = "table" | "cards";

export default function MaoDeObraPage() {
  const [tipos, setTipos] = useState<TipoMaoDeObra[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tipoEditando, setTipoEditando] = useState<TipoMaoDeObra | null>(null);
  const [tipoParaDeletar, setTipoParaDeletar] = useState<TipoMaoDeObra | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filtroMaquina, setFiltroMaquina] = useState("");
  const [ativo, setAtivo] = useState("true");
  const [sortBy, setSortBy] = useState("nome");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 50;

  // Debounce search
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
  }, [debouncedSearch, filtroMaquina, ativo, sortBy, order]);

  const carregarTipos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());
      params.append("sortBy", sortBy);
      params.append("order", order);

      const response = await fetch(`/api/mao-de-obra?${params}`);
      if (!response.ok) throw new Error("Erro ao carregar tipos");
      const result = await response.json();
      setTipos(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
    } catch (error) {
      console.error(error);
      showError("Erro ao carregar tipos de mão de obra");
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, order]);

  useEffect(() => {
    carregarTipos();
  }, [carregarTipos]);

  // Stats calculadas
  const stats = useMemo(() => {
    const ativos = tipos.filter((t) => t.ativo);
    const comMaquina = tipos.filter((t) => t.incluiMaquina);
    const totalCusto = tipos.reduce((acc, t) => acc + t.custoTotalHora, 0);
    const medioCusto = tipos.length > 0 ? totalCusto / tipos.length : 0;
    const vinculados = tipos.filter((t) => t.produtosVinculados > 0);

    return {
      total: totalItems,
      ativos: ativos.length,
      inativos: tipos.length - ativos.length,
      comMaquina: comMaquina.length,
      medioCusto,
      totalCusto,
      vinculados: vinculados.length,
    };
  }, [tipos, totalItems]);

  const handleNovo = () => {
    setTipoEditando(null);
    setDialogOpen(true);
  };

  const handleEditar = (tipo: TipoMaoDeObra) => {
    setTipoEditando(tipo);
    setDialogOpen(true);
  };

  const handleOpenDeleteDialog = (tipo: TipoMaoDeObra) => {
    setTipoParaDeletar(tipo);
    setDeleteDialogOpen(true);
  };

  const handleExcluir = async () => {
    if (!tipoParaDeletar) return;

    try {
      const response = await fetch(`/api/mao-de-obra/${tipoParaDeletar.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir");
      }

      showSuccess("Tipo de mão de obra excluído com sucesso");
      setDeleteDialogOpen(false);
      setTipoParaDeletar(null);
      carregarTipos();
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Erro ao excluir tipo de mão de obra");
    }
  };

  const handleSalvarSucesso = () => {
    setDialogOpen(false);
    setTipoEditando(null);
    carregarTipos();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="xl" text="Carregando mão de obra..." />
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
            <BreadcrumbPage>Mão de Obra</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight flex items-center gap-2">
            <Wrench className="h-8 w-8 text-primary" />
            Mão de Obra
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os tipos de mão de obra e custos por hora de forma eficiente
          </p>
        </div>
        <Button onClick={handleNovo} className="transition-all duration-300 hover:shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          Novo Tipo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos Cadastrados</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
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
            <CardTitle className="text-sm font-medium">Custo Médio/Hora</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-green-600">
              {formatCurrency(stats.medioCusto)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(stats.totalCusto)}/hora
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Máquina</CardTitle>
            <Cog className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.comMaquina}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${Math.round((stats.comMaquina / stats.total) * 100)}% do total`
                : "Nenhum tipo"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vinculados}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${Math.round((stats.vinculados / stats.total) * 100)}% vinculados`
                : "Nenhum vinculado"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e View Toggle */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            className="transition-all duration-300"
          />
        </div>
        <NativeSelect
          value={filtroMaquina}
          onChange={(e) => setFiltroMaquina(e.target.value)}
          className="w-48"
        >
          <option value="">Todos</option>
          <option value="true">Com Máquina</option>
          <option value="false">Sem Máquina</option>
        </NativeSelect>
        <NativeSelect value={ativo} onChange={(e) => setAtivo(e.target.value)} className="w-32">
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </NativeSelect>
        <NativeSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-40">
          <option value="nome">Nome</option>
          <option value="codigo">Código</option>
          <option value="custoHora">Custo/Hora</option>
          <option value="custoMaquinaHora">Custo Máquina</option>
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

      {/* Empty State */}
      {tipos.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Nenhum tipo encontrado"
          description={
            debouncedSearch || filtroMaquina || ativo !== "true"
              ? "Tente ajustar os filtros para encontrar o que procura"
              : "Comece adicionando seu primeiro tipo de mão de obra"
          }
          action={{
            label: "Criar Primeiro Tipo",
            onClick: handleNovo,
            icon: Plus,
          }}
        />
      ) : viewMode === "cards" ? (
        /* Cards View */
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tipos.map((tipo) => (
              <Card
                key={tipo.id}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden"
              >
                {/* Gradient decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl" />

                <CardHeader className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {tipo.nome}
                      </CardTitle>
                      {tipo.codigo && (
                        <p className="text-xs text-muted-foreground font-mono">{tipo.codigo}</p>
                      )}
                    </div>
                    <Badge variant={tipo.ativo ? "default" : "secondary"} className="shrink-0">
                      {tipo.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  {tipo.descricao && (
                    <CardDescription className="line-clamp-2 mt-2">
                      {tipo.descricao}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="relative space-y-4">
                  {/* Custos Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                      <p className="text-xs text-muted-foreground mb-1">Mão de Obra</p>
                      <p className="text-lg font-bold font-mono text-green-600">
                        {formatCurrency(tipo.custoHora)}
                      </p>
                      <p className="text-xs text-muted-foreground">/hora</p>
                    </div>
                    <div
                      className={cn(
                        "p-3 rounded-lg border",
                        tipo.incluiMaquina
                          ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-xs text-muted-foreground mb-1">Máquina</p>
                      {tipo.incluiMaquina && tipo.custoMaquinaHora ? (
                        <>
                          <p className="text-lg font-bold font-mono text-blue-600">
                            {formatCurrency(tipo.custoMaquinaHora)}
                          </p>
                          <p className="text-xs text-muted-foreground">/hora</p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Não inclui</p>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total/Hora</span>
                      <span className="text-xl font-bold font-mono text-primary">
                        {formatCurrency(tipo.custoTotalHora)}
                      </span>
                    </div>
                  </div>

                  {/* Info adicional */}
                  {tipo.produtosVinculados > 0 && (
                    <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 dark:bg-purple-950 p-2 rounded-md">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Usado em {tipo.produtosVinculados} produto(s)</span>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleEditar(tipo)}
                    >
                      <Pencil className="mr-2 h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDeleteDialog(tipo)}
                      disabled={tipo.produtosVinculados > 0}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Paginação */}
          {!loading && tipos.length > 0 && totalPages > 1 && (
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

          {/* Footer Info */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems} tipo(s)
            </span>
            <Button variant="outline" size="sm" onClick={handleNovo}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Tipo
            </Button>
          </div>
        </>
      ) : (
        /* Table View */
        <>
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Mão de Obra</CardTitle>
              <CardDescription>Lista de todos os tipos de mão de obra cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead className="text-right">Custo/Hora</TableHead>
                      <TableHead className="text-center">Máquina</TableHead>
                      <TableHead className="text-right">Custo Máquina/Hora</TableHead>
                      <TableHead className="text-right">Total/Hora</TableHead>
                      <TableHead className="text-center">Produtos</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tipos.map((tipo) => (
                      <TableRow key={tipo.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{tipo.nome}</TableCell>
                        <TableCell>
                          {tipo.codigo || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          {formatCurrency(tipo.custoHora)}
                        </TableCell>
                        <TableCell className="text-center">
                          {tipo.incluiMaquina ? (
                            <Badge variant="default">Sim</Badge>
                          ) : (
                            <Badge variant="outline">Não</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-blue-600">
                          {tipo.incluiMaquina && tipo.custoMaquinaHora ? (
                            formatCurrency(tipo.custoMaquinaHora)
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold font-mono text-primary">
                          {formatCurrency(tipo.custoTotalHora)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{tipo.produtosVinculados}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {tipo.ativo ? (
                            <Badge variant="default">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditar(tipo)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDeleteDialog(tipo)}
                              disabled={tipo.produtosVinculados > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Paginação */}
          {!loading && tipos.length > 0 && totalPages > 1 && (
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

          {/* Footer Info */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems} tipo(s)
            </span>
          </div>
        </>
      )}

      {/* Dialog de Criação/Edição */}
      <MaoDeObraDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipo={tipoEditando}
        onSuccess={handleSalvarSucesso}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleExcluir}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o tipo de mão de obra "${tipoParaDeletar?.nome}"?${
          tipoParaDeletar && tipoParaDeletar.produtosVinculados > 0
            ? `\n\n⚠️ Este tipo está vinculado a ${tipoParaDeletar.produtosVinculados} produto(s)!`
            : ""
        }\n\nEsta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
