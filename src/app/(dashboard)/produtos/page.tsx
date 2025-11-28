"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { ProdutosSkeleton } from "@/components/produtos/produtos-skeleton";

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

  // Debounce search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadTiposProduto = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);

      const response = await fetch(`/api/tipos-produto?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTiposProduto(data);
      }
    } catch (error) {
      console.error("Erro ao carregar tipos de produto:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadTiposProduto();
  }, [loadTiposProduto]);

  // Stats calculadas
  const stats = useMemo(() => {
    const filteredByStatus = ativo
      ? tiposProduto.filter(t => t.ativo === (ativo === "true"))
      : tiposProduto;

    const filteredByCategory = categoria
      ? filteredByStatus.filter(t => t.categoria === categoria)
      : filteredByStatus;

    const totalVariacoes = filteredByCategory.reduce((acc, t) => acc + t._count.variacoes, 0);
    const ativos = tiposProduto.filter(t => t.ativo);
    const inativos = tiposProduto.filter(t => t.ativo === false);
    const comVariacoes = tiposProduto.filter(t => t._count.variacoes > 0);

    return {
      total: tiposProduto.length,
      filtered: filteredByCategory.length,
      ativos: ativos.length,
      inativos: inativos.length,
      totalVariacoes,
      mediaVariacoes: filteredByCategory.length > 0
        ? (totalVariacoes / filteredByCategory.length).toFixed(1)
        : "0",
      comVariacoes: comVariacoes.length,
    };
  }, [tiposProduto, ativo, categoria]);

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

  if (loading) {
    return <ProdutosSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Produtos
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie tipos de produtos e suas variações com eficiência
          </p>
        </div>
        <Link href="/produtos/novo">
          <Button className="transition-all duration-300 hover:shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Novo Tipo de Produto
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Produto</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ativos} ativos, {stats.inativos} inativos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Variações</CardTitle>
            <Layers className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalVariacoes}</div>
            <p className="text-xs text-muted-foreground">
              Média de {stats.mediaVariacoes} por produto
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Variações</CardTitle>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.comVariacoes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? `${Math.round((stats.comVariacoes / stats.total) * 100)}% do total`
                : "Nenhum produto"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Tag className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorias.length}</div>
            <p className="text-xs text-muted-foreground">
              {categorias.length > 0 ? "categorias diferentes" : "Nenhuma categoria"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
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
                        alert("Funcionalidade em desenvolvimento");
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

          {/* Footer Info */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Mostrando {produtosExibidos.length} de {stats.total} tipo(s) de produto
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
    </div>
  );
}
