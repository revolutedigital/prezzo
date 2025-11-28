"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Package, Layers } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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

  const loadTiposProduto = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);

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
  };

  useEffect(() => {
    loadTiposProduto();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">
            Produtos
          </h2>
          <p className="text-muted-foreground">
            Gerencie tipos de produtos e suas variações
          </p>
        </div>
        <Link href="/produtos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Tipo de Produto
          </Button>
        </Link>
      </div>

      {/* Busca */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Grid de Cards */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : tiposProduto.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum produto cadastrado</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando seu primeiro tipo de produto
          </p>
          <Link href="/produtos/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tiposProduto.map((tipo) => (
              <Link key={tipo.id} href={`/produtos/${tipo.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{tipo.nome}</CardTitle>
                        {tipo.codigo && (
                          <p className="text-sm text-muted-foreground font-mono">
                            {tipo.codigo}
                          </p>
                        )}
                      </div>
                      <Badge variant={tipo.ativo ? "success" : "destructive"}>
                        {tipo.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    {tipo.descricao && (
                      <CardDescription className="line-clamp-2">
                        {tipo.descricao}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {tipo._count.variacoes} variação(ões)
                        </span>
                      </div>
                      {tipo.categoria && (
                        <Badge variant="outline">{tipo.categoria}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            Total: {tiposProduto.length} tipo(s) de produto
          </div>
        </>
      )}
    </div>
  );
}
