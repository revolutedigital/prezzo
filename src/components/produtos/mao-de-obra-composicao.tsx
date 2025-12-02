"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

interface MaoDeObraComposicaoProps {
  variacaoProdutoId: string;
  onCustoChange?: (custoMaoDeObra: number) => void;
}

interface TipoMaoDeObra {
  id: string;
  nome: string;
  custoHora: number;
  incluiMaquina: boolean;
  custoMaquinaHora?: number | null;
  custoTotalHora: number;
  ativo: boolean;
}

interface ComposicaoMaoDeObra {
  id: string;
  tipoMaoDeObraId: string;
  horasNecessarias: number;
  descricao?: string | null;
  tipoMaoDeObra: TipoMaoDeObra;
  custoTotal: number;
  custoTotalHora: number;
}

export function MaoDeObraComposicao({
  variacaoProdutoId,
  onCustoChange,
}: MaoDeObraComposicaoProps) {
  const [composicao, setComposicao] = useState<ComposicaoMaoDeObra[]>([]);
  const [tiposMaoDeObra, setTiposMaoDeObra] = useState<TipoMaoDeObra[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [horas, setHoras] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);

      // Carregar tipos de mão de obra
      const tiposResponse = await fetch("/api/mao-de-obra");
      if (tiposResponse.ok) {
        const tiposData = await tiposResponse.json();
        setTiposMaoDeObra(tiposData.filter((t: TipoMaoDeObra) => t.ativo));
      }

      // Carregar composição atual
      const compResponse = await fetch(`/api/produtos/${variacaoProdutoId}/mao-de-obra`);
      if (compResponse.ok) {
        const compData = await compResponse.json();
        setComposicao(compData.composicao || []);

        // Notificar custo total
        if (onCustoChange) {
          onCustoChange(compData.custoTotalMaoDeObra || 0);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados de mão de obra");
    } finally {
      setLoading(false);
    }
  }, [variacaoProdutoId, onCustoChange]);

  useEffect(() => {
    if (variacaoProdutoId) {
      carregarDados();
    }
  }, [variacaoProdutoId, carregarDados]);

  const handleAdicionar = () => {
    setTipoSelecionado("");
    setHoras("");
    setDescricao("");
    setDialogOpen(true);
  };

  const handleSalvar = async () => {
    if (!tipoSelecionado || !horas || Number(horas) <= 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSalvando(true);

    try {
      const response = await fetch(`/api/produtos/${variacaoProdutoId}/mao-de-obra`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoMaoDeObraId: tipoSelecionado,
          horasNecessarias: Number(horas),
          descricao: descricao || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao adicionar mão de obra");
      }

      toast.success("Mão de obra adicionada com sucesso");
      setDialogOpen(false);
      carregarDados();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao adicionar mão de obra");
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (composicaoId: string) => {
    if (!confirm("Tem certeza que deseja remover esta mão de obra?")) return;

    try {
      const response = await fetch(
        `/api/produtos/${variacaoProdutoId}/mao-de-obra/${composicaoId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao remover");
      }

      toast.success("Mão de obra removida com sucesso");
      carregarDados();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao remover mão de obra");
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const custoTotal = composicao.reduce((acc, item) => acc + item.custoTotal, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mão de Obra</CardTitle>
              <CardDescription>
                Tipos de mão de obra necessários para produzir este produto
              </CardDescription>
            </div>
            <Button onClick={handleAdicionar}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {composicao.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma mão de obra adicionada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione os tipos de mão de obra necessários para este produto
              </p>
              <Button onClick={handleAdicionar}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Mão de Obra
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Horas</TableHead>
                    <TableHead className="text-right">Custo/Hora</TableHead>
                    <TableHead className="text-right">Custo Total</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {composicao.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.tipoMaoDeObra.nome}
                        {item.tipoMaoDeObra.incluiMaquina && (
                          <span className="ml-2 text-xs text-muted-foreground">(com máquina)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.horasNecessarias}h</TableCell>
                      <TableCell className="text-right">
                        {formatarMoeda(item.custoTotalHora)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatarMoeda(item.custoTotal)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {item.descricao || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemover(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex justify-end">
                <div className="rounded-lg border bg-muted/50 p-4 min-w-[200px]">
                  <div className="text-sm text-muted-foreground mb-1">
                    Custo Total de Mão de Obra
                  </div>
                  <div className="text-2xl font-bold">{formatarMoeda(custoTotal)}</div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog para adicionar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Mão de Obra</DialogTitle>
            <DialogDescription>
              Selecione o tipo de mão de obra e informe as horas necessárias
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Mão de Obra *</Label>
              <Select value={tipoSelecionado} onValueChange={setTipoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposMaoDeObra.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      {tipo.nome} - {formatarMoeda(tipo.custoTotalHora)}/h
                      {tipo.incluiMaquina && " (com máquina)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas">Horas Necessárias *</Label>
              <Input
                id="horas"
                type="number"
                step="0.5"
                placeholder="Ex: 2.5"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                placeholder="Ex: Soldagem da estrutura base"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            {/* Preview do custo */}
            {tipoSelecionado && horas && Number(horas) > 0 && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-sm font-medium mb-1">Custo Estimado</div>
                <div className="text-lg font-bold">
                  {formatarMoeda(
                    Number(horas) *
                      (tiposMaoDeObra.find((t) => t.id === tipoSelecionado)?.custoTotalHora || 0)
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={salvando}>
              {salvando ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
