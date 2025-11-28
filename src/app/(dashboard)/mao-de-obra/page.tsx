"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Plus,
  Pencil,
  Trash2,
  Wrench,
  DollarSign,
  Users,
  Cog,
  TrendingUp,
  Search,
  LayoutGrid,
  List,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MaoDeObraDialog } from "@/components/mao-de-obra/mao-de-obra-dialog";
import { MaoDeObraSkeleton } from "@/components/mao-de-obra/mao-de-obra-skeleton";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";

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
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const carregarTipos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/mao-de-obra");
      if (!response.ok) throw new Error("Erro ao carregar tipos");
      const data = await response.json();
      setTipos(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar tipos de mão de obra");
    } finally {
      setLoading(false);
    }
  }, []);

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
      total: tipos.length,
      ativos: ativos.length,
      inativos: tipos.length - ativos.length,
      comMaquina: comMaquina.length,
      medioCusto,
      totalCusto,
      vinculados: vinculados.length,
    };
  }, [tipos]);

  // Filtrar tipos
  const tiposFiltrados = useMemo(() => {
    let filtered = tipos;

    // Filtro de busca
    if (debouncedSearch) {
      filtered = filtered.filter(
        (t) =>
          t.nome.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          t.codigo?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Filtro de máquina
    if (filtroMaquina) {
      filtered = filtered.filter((t) =>
        filtroMaquina === "true" ? t.incluiMaquina : !t.incluiMaquina
      );
    }

    // Filtro de ativo
    if (ativo) {
      filtered = filtered.filter((t) => t.ativo === (ativo === "true"));
    }

    return filtered;
  }, [tipos, debouncedSearch, filtroMaquina, ativo]);

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

      toast.success("Tipo de mão de obra excluído com sucesso");
      setDeleteDialogOpen(false);
      setTipoParaDeletar(null);
      carregarTipos();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao excluir tipo de mão de obra");
    }
  };

  const handleSalvarSucesso = () => {
    setDialogOpen(false);
    setTipoEditando(null);
    carregarTipos();
  };

  if (loading) {
    return <MaoDeObraSkeleton viewMode={viewMode} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs text-muted-foreground animate-pulse">Buscando...</span>
            </div>
          )}
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
      {tiposFiltrados.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wrench className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum tipo encontrado</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              {debouncedSearch || filtroMaquina || ativo !== "true"
                ? "Tente ajustar os filtros para encontrar o que procura"
                : "Comece adicionando seu primeiro tipo de mão de obra"}
            </p>
            <Button onClick={handleNovo}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Tipo
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "cards" ? (
        /* Cards View */
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tiposFiltrados.map((tipo) => (
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

          {/* Footer Info */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Mostrando {tiposFiltrados.length} de {stats.total} tipo(s)
              {(debouncedSearch || filtroMaquina || ativo) && " (com filtros)"}
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
              <CardDescription>
                Lista de todos os tipos de mão de obra cadastrados
              </CardDescription>
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
                    {tiposFiltrados.map((tipo) => (
                      <TableRow
                        key={tipo.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
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
                          {tipo.incluiMaquina && tipo.custoMaquinaHora
                            ? formatCurrency(tipo.custoMaquinaHora)
                            : <span className="text-muted-foreground">-</span>}
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditar(tipo)}
                            >
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

          {/* Footer Info */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Mostrando {tiposFiltrados.length} de {stats.total} tipo(s)
              {(debouncedSearch || filtroMaquina || ativo) && " (com filtros)"}
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o tipo de mão de obra{" "}
              <strong>{tipoParaDeletar?.nome}</strong>?
              {tipoParaDeletar && tipoParaDeletar.produtosVinculados > 0 && (
                <span className="block mt-2 text-amber-600 font-medium">
                  ⚠️ Este tipo está vinculado a {tipoParaDeletar.produtosVinculados} produto(s)!
                </span>
              )}
              <span className="block mt-2">Esta ação não pode ser desfeita.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTipoParaDeletar(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleExcluir}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
