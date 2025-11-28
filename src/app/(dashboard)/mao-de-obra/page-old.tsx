"use client";

import { useEffect, useState } from "react";
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
import { Plus, Pencil, Trash2, Wrench } from "lucide-react";
import { MaoDeObraDialog } from "@/components/mao-de-obra/mao-de-obra-dialog";
import { toast } from "sonner";

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

export default function MaoDeObraPage() {
  const [tipos, setTipos] = useState<TipoMaoDeObra[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipoEditando, setTipoEditando] = useState<TipoMaoDeObra | null>(null);

  const carregarTipos = async () => {
    try {
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
  };

  useEffect(() => {
    carregarTipos();
  }, []);

  const handleNovo = () => {
    setTipoEditando(null);
    setDialogOpen(true);
  };

  const handleEditar = (tipo: TipoMaoDeObra) => {
    setTipoEditando(tipo);
    setDialogOpen(true);
  };

  const handleExcluir = async (tipo: TipoMaoDeObra) => {
    if (tipo.produtosVinculados > 0) {
      toast.error(
        `Não é possível excluir. Este tipo está vinculado a ${tipo.produtosVinculados} produto(s)`
      );
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir "${tipo.nome}"?`)) return;

    try {
      const response = await fetch(`/api/mao-de-obra/${tipo.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir");
      }

      toast.success("Tipo de mão de obra excluído com sucesso");
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

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Mão de Obra</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os tipos de mão de obra e custos por hora
          </p>
        </div>
        <Button onClick={handleNovo}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Tipo
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Tipos</CardDescription>
            <CardTitle className="text-3xl">{tipos.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Com Máquina</CardDescription>
            <CardTitle className="text-3xl">
              {tipos.filter((t) => t.incluiMaquina).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Custo Médio/Hora</CardDescription>
            <CardTitle className="text-3xl">
              {tipos.length > 0
                ? formatarMoeda(
                    tipos.reduce((acc, t) => acc + t.custoTotalHora, 0) /
                      tipos.length
                  )
                : "R$ 0,00"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Mão de Obra</CardTitle>
          <CardDescription>
            Lista de todos os tipos de mão de obra cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tipos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum tipo cadastrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece adicionando seu primeiro tipo de mão de obra
              </p>
              <Button onClick={handleNovo}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Tipo
              </Button>
            </div>
          ) : (
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
                  <TableRow key={tipo.id}>
                    <TableCell className="font-medium">{tipo.nome}</TableCell>
                    <TableCell>
                      {tipo.codigo || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatarMoeda(tipo.custoHora)}
                    </TableCell>
                    <TableCell className="text-center">
                      {tipo.incluiMaquina ? (
                        <Badge variant="default">Sim</Badge>
                      ) : (
                        <Badge variant="outline">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {tipo.incluiMaquina && tipo.custoMaquinaHora
                        ? formatarMoeda(tipo.custoMaquinaHora)
                        : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatarMoeda(tipo.custoTotalHora)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{tipo.produtosVinculados}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {tipo.ativo ? (
                        <Badge variant="success">Ativo</Badge>
                      ) : (
                        <Badge variant="destructive">Inativo</Badge>
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
                          onClick={() => handleExcluir(tipo)}
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
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <MaoDeObraDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipo={tipoEditando}
        onSuccess={handleSalvarSucesso}
      />
    </div>
  );
}
