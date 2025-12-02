import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Tipos de permissão no sistema
 */
export enum Permission {
  // Produtos
  PRODUTO_VIEW = "produto:view",
  PRODUTO_CREATE = "produto:create",
  PRODUTO_EDIT = "produto:edit",
  PRODUTO_DELETE = "produto:delete",

  // Matérias-primas
  MATERIA_PRIMA_VIEW = "materia_prima:view",
  MATERIA_PRIMA_CREATE = "materia_prima:create",
  MATERIA_PRIMA_EDIT = "materia_prima:edit",
  MATERIA_PRIMA_DELETE = "materia_prima:delete",

  // Mão de obra
  MAO_DE_OBRA_VIEW = "mao_de_obra:view",
  MAO_DE_OBRA_CREATE = "mao_de_obra:create",
  MAO_DE_OBRA_EDIT = "mao_de_obra:edit",
  MAO_DE_OBRA_DELETE = "mao_de_obra:delete",

  // Orçamentos
  ORCAMENTO_VIEW = "orcamento:view",
  ORCAMENTO_CREATE = "orcamento:create",
  ORCAMENTO_EDIT = "orcamento:edit",
  ORCAMENTO_DELETE = "orcamento:delete",
  ORCAMENTO_SEND = "orcamento:send",
  ORCAMENTO_APPROVE = "orcamento:approve",

  // Relatórios
  RELATORIO_VIEW = "relatorio:view",
  RELATORIO_EXPORT = "relatorio:export",

  // Configurações
  CONFIG_VIEW = "config:view",
  CONFIG_EDIT = "config:edit",

  // Administração
  ADMIN_USERS = "admin:users",
  ADMIN_SETTINGS = "admin:settings",
}

/**
 * Roles e suas permissões
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(Permission), // Admin tem todas as permissões
  user: [
    // Produtos
    Permission.PRODUTO_VIEW,
    Permission.PRODUTO_CREATE,
    Permission.PRODUTO_EDIT,
    Permission.PRODUTO_DELETE,
    // Matérias-primas
    Permission.MATERIA_PRIMA_VIEW,
    Permission.MATERIA_PRIMA_CREATE,
    Permission.MATERIA_PRIMA_EDIT,
    Permission.MATERIA_PRIMA_DELETE,
    // Mão de obra
    Permission.MAO_DE_OBRA_VIEW,
    Permission.MAO_DE_OBRA_CREATE,
    Permission.MAO_DE_OBRA_EDIT,
    Permission.MAO_DE_OBRA_DELETE,
    // Orçamentos
    Permission.ORCAMENTO_VIEW,
    Permission.ORCAMENTO_CREATE,
    Permission.ORCAMENTO_EDIT,
    Permission.ORCAMENTO_DELETE,
    Permission.ORCAMENTO_SEND,
    // Relatórios
    Permission.RELATORIO_VIEW,
    Permission.RELATORIO_EXPORT,
    // Configurações
    Permission.CONFIG_VIEW,
    Permission.CONFIG_EDIT,
  ],
  viewer: [
    // Apenas visualização
    Permission.PRODUTO_VIEW,
    Permission.MATERIA_PRIMA_VIEW,
    Permission.MAO_DE_OBRA_VIEW,
    Permission.ORCAMENTO_VIEW,
    Permission.RELATORIO_VIEW,
    Permission.CONFIG_VIEW,
  ],
};

/**
 * Verifica se o usuário tem uma permissão específica
 */
export function hasPermission(userRole: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Verifica se o usuário tem todas as permissões especificadas
 */
export function hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Verifica se o usuário tem pelo menos uma das permissões especificadas
 */
export function hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Middleware helper para validar permissões em API routes
 */
export function withPermission(
  handler: (req: NextRequest) => Promise<NextResponse>,
  requiredPermission: Permission
) {
  return async function (req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role || "user";

    if (!hasPermission(userRole, requiredPermission)) {
      return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    return handler(req);
  };
}

/**
 * Middleware helper para validar múltiplas permissões (todas requeridas)
 */
export function withAllPermissions(
  handler: (req: NextRequest) => Promise<NextResponse>,
  requiredPermissions: Permission[]
) {
  return async function (req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role || "user";

    if (!hasAllPermissions(userRole, requiredPermissions)) {
      return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    return handler(req);
  };
}

/**
 * Middleware helper para validar múltiplas permissões (qualquer uma)
 */
export function withAnyPermission(
  handler: (req: NextRequest) => Promise<NextResponse>,
  requiredPermissions: Permission[]
) {
  return async function (req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role || "user";

    if (!hasAnyPermission(userRole, requiredPermissions)) {
      return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    return handler(req);
  };
}

/**
 * Verifica se o recurso pertence ao usuário
 */
export async function verifyResourceOwnership(
  resourceType: "tipoProduto" | "materiaPrima" | "tipoMaoDeObra" | "orcamento",
  resourceId: string,
  userId: string
): Promise<boolean> {
  try {
    switch (resourceType) {
      case "tipoProduto":
        // TipoProduto não tem userId - recurso global
        const tipoProduto = await prisma.tipoProduto.findUnique({
          where: { id: resourceId },
        });
        return !!tipoProduto;

      case "materiaPrima":
        // MateriaPrima não tem userId - recurso global
        const materiaPrima = await prisma.materiaPrima.findUnique({
          where: { id: resourceId },
        });
        return !!materiaPrima;

      case "tipoMaoDeObra":
        // TipoMaoDeObra não tem userId - recurso global
        const tipoMaoDeObra = await prisma.tipoMaoDeObra.findUnique({
          where: { id: resourceId },
        });
        return !!tipoMaoDeObra;

      case "orcamento":
        const orcamento = await prisma.orcamento.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });
        return orcamento?.userId === userId;

      default:
        return false;
    }
  } catch (error) {
    console.error("Error verifying resource ownership:", error);
    return false;
  }
}

/**
 * Middleware helper combinando permissão e ownership
 */
export function withPermissionAndOwnership(
  handler: (req: NextRequest, params: any) => Promise<NextResponse>,
  requiredPermission: Permission,
  resourceType: "tipoProduto" | "materiaPrima" | "tipoMaoDeObra" | "orcamento",
  getResourceId: (params: any) => string
) {
  return async function (req: NextRequest, params: any) {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role || "user";

    // Verificar permissão
    if (!hasPermission(userRole, requiredPermission)) {
      return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    // Verificar ownership (admins pulam essa verificação)
    if (userRole !== "admin") {
      const resourceId = getResourceId(params);
      const isOwner = await verifyResourceOwnership(resourceType, resourceId, session.user.id);

      if (!isOwner) {
        return NextResponse.json(
          { error: "Forbidden - You don't own this resource" },
          { status: 403 }
        );
      }
    }

    return handler(req, params);
  };
}
