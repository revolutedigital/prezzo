"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NovoProdutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    codigo: "",
    categoria: "",
    descricao: "",
    ativo: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tipos-produto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          codigo: formData.codigo || undefined,
          categoria: formData.categoria || undefined,
          descricao: formData.descricao || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/produtos/${data.id}`);
      } else {
        const data = await response.json();
        setError(data.error || "Erro ao criar tipo de produto");
      }
    } catch (error) {
      console.error("Erro ao criar:", error);
      setError("Erro ao criar tipo de produto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/produtos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Novo Tipo de Produto</h2>
          <p className="text-muted-foreground">
            Crie um novo tipo de produto e depois adicione suas variações
          </p>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>Preencha os dados do tipo de produto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Filtro de Alumínio"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ex: PROD-001"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ex: Filtros, Peças"
                  disabled={loading}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do produto"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="ativo">Status</Label>
                <NativeSelect
                  id="ativo"
                  value={formData.ativo ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.value === "true" })}
                  disabled={loading}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </NativeSelect>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Link href="/produtos">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Produto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Próximo passo:</strong> Após criar o tipo de produto, você poderá adicionar
            variações (como diferentes grades, tamanhos, cores) e definir a composição de
            matérias-primas para cada variação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
