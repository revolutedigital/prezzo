"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Plus,
  Search,
  Package,
  Layers,
  DollarSign,
  TrendingUp,
  Tag,
  Sparkles,
  Copy,
  Edit,
  Eye,
  Home,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileDown,
  FileText,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { ProdutosSkeleton } from "@/components/produtos/produtos-skeleton";
import { showInfo } from "@/lib/toast";
import { PDFPreviewDialog } from "@/components/ui/pdf-preview-dialog";

interface TipoProduto {
  id: string;
  nome: string;
  codigo: string | null;
  categoria: string | null;
  descricao: string | null;
  ativo: boolean;
  _count: {
    variacoes: number;
  };
  variacoes: any[];
}

export default function ProdutosPage() {
  const [tiposProduto, setTiposProduto] = useState<TipoProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ativo, setAtivo] = useState("true");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState("nome");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [exportando, setExportando] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const ITEMS_PER_PAGE = 20;

  const handleExportExcel = async () => {
    try {
      setExportando(true);
      const response = await fetch("/api/export/produtos");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `produtos-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showInfo("Produtos exportados com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
    } finally {
      setExportando(false);
    }
  };

  const handlePreviewPDF = async () => {
    try {
      setExportando(true);
      const response = await fetch("/api/export/relatorio-custos");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setPdfPreviewOpen(true);
      }
    } catch (error) {
      console.error("Erro ao gerar preview:", error);
    } finally {
      setExportando(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportando(true);
      const response = await fetch("/api/export/relatorio-custos");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `relatorio-custos-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showInfo("Relatório exportado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao exportar:", error);
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
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Debounce search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categoria, ativo, sortBy, order]);

  const loadTiposProduto = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());
      params.append("sortBy", sortBy);
      params.append("order", order);

      const response = await fetch(`/api/tipos-produto?${params}`);
      if (response.ok) {
        const result = await response.json();
        setTiposProduto(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.total);
      }
    } catch (error) {
      console.error("Erro ao carregar tipos de produto:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage, sortBy, order, ITEMS_PER_PAGE]);

  useEffect(() => {
    loadTiposProduto();
  }, [loadTiposProduto]);

  // Categorias únicas
  const categorias = useMemo(
    () => Array.from(new Set(tiposProduto.map(t => t.categoria).filter(Boolean))),
    [tiposProduto]
  );

  // Filtrar produtos exibidos
  const produtosExibidos = useMemo(() => {
    let filtered = tiposProduto;

    if (ativo) {
      filtered = filtered.filter(t => t.ativo === (ativo === "true"));
    }

    if (categoria) {
      filtered = filtered.filter(t => t.categoria === categoria);
    }

    return filtered;
  }, [tiposProduto, ativo, categoria]);

  // Stats calculadas
  const stats = useMemo(() => {
    const filteredByStatus = ativo
      ? tiposProduto.filter(t => t.ativo === (ativo === "true"))
      : tiposProduto;

    const filteredByCategory = categoria
      ? filteredByStatus.filter(t => t.categoria === categoria)
      : filteredByStatus;

    const totalVariacoes = tiposProduto.reduce((acc, t) => acc + t._count.variacoes, 0);
    const ativos = tiposProduto.filter(t => t.ativo);
    const inativos = tiposProduto.filter(t => t.ativo === false);
    const comVariacoes = tiposProduto.filter(t => t._count.variacoes > 0);

    return {
      total: totalItems,
      filtered: produtosExibidos.length,
      ativos: ativos.length,
      inativos: inativos.length,
      totalVariacoes,
      mediaVariacoes: produtosExibidos.length > 0
        ? (totalVariacoes / produtosExibidos.length).toFixed(1)
        : "0",
      comVariacoes: comVariacoes.length,
    };
  }, [tiposProduto, ativo, categoria, totalItems, produtosExibidos.length]);

  if (loading) {
    return <ProdutosSkeleton />;
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
            <BreadcrumbPage>Produtos</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Produtos
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie tipos de produtos e suas variações com eficiência
          </p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={exportando || tiposProduto.length === 0}
            className="transition-all duration-300 hover:shadow-md flex-1 sm:flex-none"
            size="sm"
          >
            <FileDown className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </Button>
          <Button
            variant="outline"
            onClick={handlePreviewPDF}
            disabled={exportando || tiposProduto.length === 0}
            className="transition-all duration-300 hover:shadow-md flex-1 sm:flex-none"
            size="sm"
          >
            <Eye className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Preview PDF</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={exportando || tiposProduto.length === 0}
            className="transition-all duration-300 hover:shadow-md flex-1 sm:flex-none"
            size="sm"
          >
            <FileText className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Baixar PDF</span>
          </Button>
          <Link href="/produtos/novo" className="flex-1 sm:flex-none">
            <Button className="transition-all duration-300 hover:shadow-lg w-full" size="sm">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Novo Tipo de Produto</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Tipos de Produto</CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {stats.ativos} ativos, {stats.inativos} inativos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total de Variações</CardTitle>
            <Layers className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.totalVariacoes}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Média de {stats.mediaVariacoes} por produto
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Com Variações</CardTitle>
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.comVariacoes}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {stats.total > 0
                ? `${Math.round((stats.comVariacoes / stats.total) * 100)}% do total`
                : "Nenhum produto"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Categorias</CardTitle>
            <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{categorias.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {categorias.length > 0 ? "categorias diferentes" : "Nenhuma categoria"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs text-muted-foreground animate-pulse">
                Buscando...
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <NativeSelect
            value={categoria || ""}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat || ""}>
                {cat}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect value={ativo} onChange={(e) => setAtivo(e.target.value)} className="w-full sm:w-32">
            <option value="">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </NativeSelect>
        </div>
        <div className="flex gap-2">
          <NativeSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 sm:w-40">
            <option value="nome">Nome</option>
            <option value="codigo">Código</option>
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
        </div>
      </div>

      {/* Empty State */}
      {produtosExibidos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              {debouncedSearch || categoria || ativo !== "true"
                ? "Tente ajustar os filtros para encontrar o que procura"
                : "Comece criando seu primeiro tipo de produto"}
            </p>
            <Link href="/produtos/novo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Produto
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Grid de Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {produtosExibidos.map((tipo) => (
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
                        <p className="text-xs text-muted-foreground font-mono">
                          {tipo.codigo}
                        </p>
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
                  {/* Info Grid */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Layers className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">
                        {tipo._count.variacoes}{" "}
                        {tipo._count.variacoes === 1 ? "variação" : "variações"}
                      </span>
                    </div>
                    {tipo.categoria && (
                      <Badge variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tipo.categoria}
                      </Badge>
                    )}
                  </div>

                  {/* Ações rápidas */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <Link href={`/produtos/${tipo.id}`} className="w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="transition-all duration-300 hover:bg-secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Implementar duplicação
                        showInfo("Funcionalidade em desenvolvimento");
                      }}
                    >
                      <Copy className="mr-2 h-3 w-3" />
                      Duplicar
                    </Button>
                  </div>

                  {/* Progress visual se não tem variações */}
                  {tipo._count.variacoes === 0 && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950 p-2 rounded-md">
                      <TrendingUp className="h-3 w-3" />
                      <span>Adicione variações para completar o produto</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {generatePageNumbers().map((page, idx) => (
                  <PaginationItem key={idx}>
                    {page === 'ellipsis' ? (
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
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {/* Footer Info */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems} tipo(s) de produto
              {(debouncedSearch || categoria || ativo) && " (com filtros)"}
            </span>
            <div className="flex gap-2">
              <Link href="/produtos/novo">
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={pdfPreviewOpen}
        onOpenChange={setPdfPreviewOpen}
        title="Relatório de Custos de Produtos"
        pdfUrl={pdfUrl}
        filename={`relatorio-custos-${new Date().toISOString().split("T")[0]}.pdf`}
      />
    </div>
  );
}
