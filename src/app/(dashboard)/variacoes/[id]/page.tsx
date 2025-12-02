"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, Wrench } from "lucide-react";
import { toast } from "sonner";
import { MaoDeObraComposicao } from "@/components/produtos/mao-de-obra-composicao";

export default function VariacaoEditPage() {
  const params = useParams();
  const router = useRouter();
  const [variacao, setVariacao] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [custoMateriais, setCustoMateriais] = useState(0);
  const [custoMaoDeObra, setCustoMaoDeObra] = useState(0);

  const carregarVariacao = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/variacoes-produto/${params.id}`);
      if (!response.ok) {
        throw new Error("Variação não encontrada");
      }
      const data = await response.json();
      setVariacao(data);

      // Calcular custo de materiais
      const custoMat =
        data.composicao?.reduce((acc: number, comp: any) => {
          return acc + Number(comp.quantidade) * Number(comp.materiaPrima.custoUnitario);
        }, 0) || 0;
      setCustoMateriais(custoMat);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao carregar variação");
      router.push("/produtos");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (params.id) {
      carregarVariacao();
    }
  }, [params.id, carregarVariacao]);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const custoTotal = custoMateriais + custoMaoDeObra;
  const margemLucro = variacao ? Number(variacao.margemPadrao) : 0;
  const precoSugerido = custoTotal * (1 + margemLucro / 100);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!variacao) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/produtos/${variacao.tipoProdutoId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            {variacao.tipoProduto?.nome} - {variacao.nome}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a composição de materiais e mão de obra
          </p>
        </div>
      </div>

      {/* Resumo de custos */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Materiais</div>
            <div className="text-2xl font-bold">{formatarMoeda(custoMateriais)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Mão de Obra</div>
            <div className="text-2xl font-bold">{formatarMoeda(custoMaoDeObra)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Custo Total</div>
            <div className="text-2xl font-bold text-primary">{formatarMoeda(custoTotal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Preço Venda ({margemLucro}%)</div>
            <div className="text-2xl font-bold text-success">{formatarMoeda(precoSugerido)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de composição */}
      <Tabs defaultValue="materiais" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="materiais" className="gap-2">
            <Package className="h-4 w-4" />
            Matérias-Primas
          </TabsTrigger>
          <TabsTrigger value="mao-de-obra" className="gap-2">
            <Wrench className="h-4 w-4" />
            Mão de Obra
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materiais" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  A composição de matérias-primas é gerenciada na página do produto.
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/produtos/${variacao.tipoProdutoId}`)}
                >
                  Ir para Produto
                </Button>

                {/* Lista de materiais atual */}
                {variacao.composicao && variacao.composicao.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Materiais Atuais:</h3>
                    <div className="space-y-2">
                      {variacao.composicao.map((comp: any) => (
                        <div
                          key={comp.id}
                          className="flex justify-between items-center border-b pb-2"
                        >
                          <span>{comp.materiaPrima.nome}</span>
                          <span className="text-sm text-muted-foreground">
                            {comp.quantidade} {comp.unidade} ×{" "}
                            {formatarMoeda(Number(comp.materiaPrima.custoUnitario))} ={" "}
                            <span className="font-semibold">
                              {formatarMoeda(
                                Number(comp.quantidade) * Number(comp.materiaPrima.custoUnitario)
                              )}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mao-de-obra" className="mt-6">
          <MaoDeObraComposicao
            variacaoProdutoId={params.id as string}
            onCustoChange={setCustoMaoDeObra}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
