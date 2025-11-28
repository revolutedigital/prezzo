"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileDown, BarChart3, TrendingUp, DollarSign, Package } from "lucide-react";
import { RelatorioMargens } from "@/components/relatorios/relatorio-margens";
import { RelatorioEvolucaoCustos } from "@/components/relatorios/relatorio-evolucao-custos";
import { RelatorioRentabilidade } from "@/components/relatorios/relatorio-rentabilidade";

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState("margens");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">
            Análises e insights sobre seu negócio
          </p>
        </div>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Dados
        </Button>
      </div>

      {/* Tabs de Relatórios */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="margens" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Margens por Produto
          </TabsTrigger>
          <TabsTrigger value="custos" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Evolução de Custos
          </TabsTrigger>
          <TabsTrigger value="rentabilidade" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Rentabilidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="margens" className="space-y-4">
          <RelatorioMargens />
        </TabsContent>

        <TabsContent value="custos" className="space-y-4">
          <RelatorioEvolucaoCustos />
        </TabsContent>

        <TabsContent value="rentabilidade" className="space-y-4">
          <RelatorioRentabilidade />
        </TabsContent>
      </Tabs>
    </div>
  );
}
