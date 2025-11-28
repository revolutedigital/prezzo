"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MateriaPrimaForm } from "./materia-prima-form";

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

export default function MateriasPrimasPage() {
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ativo, setAtivo] = useState("");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MateriaPrima | null>(null);

  // Carregar matérias-primas
  const loadMateriasPrimas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoria) params.append("categoria", categoria);
      if (ativo) params.append("ativo", ativo);

      const response = await fetch(`/api/materias-primas?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMateriasPrimas(data);
      }
    } catch (error) {
      console.error("Erro ao carregar matérias-primas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateriasPrimas();
  }, [search, categoria, ativo]);

  // Deletar matéria-prima
  const handleDelete = async () => {
    if (!selectedMaterial) return;

    try {
      const response = await fetch(`/api/materias-primas/${selectedMaterial.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadMateriasPrimas();
        setIsDeleteOpen(false);
        setSelectedMaterial(null);
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao excluir matéria-prima");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir matéria-prima");
    }
  };

  // Categorias únicas
  const categorias = Array.from(
    new Set(materiasPrimas.map(m => m.categoria).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">
            Matérias-Primas
          </h2>
          <p className="text-muted-foreground">
            Gerencie seus materiais e insumos
          </p>
        </div>
        <Button onClick={() => { setSelectedMaterial(null); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Matéria-Prima
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código ou fornecedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <NativeSelect value={categoria || ""} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat || ""}>{cat}</option>
          ))}
        </NativeSelect>
        <NativeSelect value={ativo} onChange={(e) => setAtivo(e.target.value)}>
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </NativeSelect>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : materiasPrimas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhuma matéria-prima encontrada
                </TableCell>
              </TableRow>
            ) : (
              materiasPrimas.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.nome}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {material.codigo || "-"}
                  </TableCell>
                  <TableCell>{material.unidadeMedida}</TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(Number(material.custoUnitario))}
                  </TableCell>
                  <TableCell>{material.fornecedor || "-"}</TableCell>
                  <TableCell>{material.categoria || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={material.ativo ? "success" : "destructive"}>
                      {material.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {material._count.composicoes > 0 ? (
                      <span className="text-sm">
                        {material._count.composicoes} produto(s)
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedMaterial(material);
                          setIsFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedMaterial(material);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Totais */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Total: {materiasPrimas.length} matéria(s)-prima(s)</span>
      </div>

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
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent onClose={() => setIsDeleteOpen(false)}>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a matéria-prima{" "}
              <strong>{selectedMaterial?.nome}</strong>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setSelectedMaterial(null);
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
