"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Building2, Mail, Lock } from "lucide-react";

export default function ConfiguracoesPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências e informações da conta
        </p>
      </div>

      <div className="grid gap-6">
        {/* Perfil do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil do Usuário
            </CardTitle>
            <CardDescription>
              Informações básicas da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  defaultValue={session?.user?.name || ""}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={session?.user?.email || ""}
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                defaultValue={session?.user?.empresa || ""}
                disabled
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Role: {session?.user?.role || "user"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Altere sua senha de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senha-atual">Senha Atual</Label>
                <Input
                  id="senha-atual"
                  type="password"
                  placeholder="Digite sua senha atual"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nova-senha">Nova Senha</Label>
                <Input
                  id="nova-senha"
                  type="password"
                  placeholder="Digite a nova senha"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  placeholder="Confirme a nova senha"
                  disabled
                />
              </div>
            </div>
            <Button disabled className="w-full md:w-auto">
              Alterar Senha
            </Button>
            <p className="text-xs text-muted-foreground">
              * Funcionalidade de alteração de senha em desenvolvimento
            </p>
          </CardContent>
        </Card>

        {/* Preferências da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Preferências da Empresa
            </CardTitle>
            <CardDescription>
              Configurações gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="margem-padrao">Margem de Lucro Padrão (%)</Label>
                <Input
                  id="margem-padrao"
                  type="number"
                  placeholder="Ex: 30"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validade-padrao">Validade Padrão de Orçamentos (dias)</Label>
                <Input
                  id="validade-padrao"
                  type="number"
                  placeholder="Ex: 15"
                  disabled
                />
              </div>
            </div>
            <Button disabled className="w-full md:w-auto">
              Salvar Preferências
            </Button>
            <p className="text-xs text-muted-foreground">
              * Funcionalidade de preferências em desenvolvimento
            </p>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre o Sistema</CardTitle>
            <CardDescription>
              Informações da versão e ambiente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Versão:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ambiente:</span>
                <span className="font-medium">
                  {process.env.NODE_ENV === "production" ? "Produção" : "Desenvolvimento"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Framework:</span>
                <span className="font-medium">Next.js 15</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database:</span>
                <span className="font-medium">PostgreSQL</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
