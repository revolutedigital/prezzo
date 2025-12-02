import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  VIEW = "VIEW",
  EXPORT = "EXPORT",
  SEND = "SEND",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
}

export enum AuditResourceType {
  PRODUTO = "PRODUTO",
  MATERIA_PRIMA = "MATERIA_PRIMA",
  MAO_DE_OBRA = "MAO_DE_OBRA",
  ORCAMENTO = "ORCAMENTO",
  NOTA_FISCAL = "NOTA_FISCAL",
  USER = "USER",
  CONFIGURACAO = "CONFIGURACAO",
}

interface AuditLogData {
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceName?: string;
  changes?: Record<string, any>;
  request?: NextRequest;
}

/**
 * Creates an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return;

    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (data.request) {
      ipAddress =
        data.request.headers.get("x-forwarded-for") ||
        data.request.headers.get("x-real-ip") ||
        undefined;
      userAgent = data.request.headers.get("user-agent") || undefined;
    }

    await prisma.$executeRaw`
      INSERT INTO AuditLog (id, userId, action, resourceType, resourceId, resourceName, changes, ipAddress, userAgent, createdAt)
      VALUES (
        ${generateId()},
        ${session.user.id},
        ${data.action},
        ${data.resourceType},
        ${data.resourceId},
        ${data.resourceName || null},
        ${data.changes ? JSON.stringify(data.changes) : null},
        ${ipAddress || null},
        ${userAgent || null},
        ${new Date().toISOString()}
      )
    `;
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging shouldn't break the main operation
  }
}

/**
 * Gets audit logs for a specific resource
 */
export async function getAuditLogsForResource(
  resourceType: AuditResourceType,
  resourceId: string,
  limit: number = 50
) {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  const logs = await prisma.$queryRaw<any[]>`
    SELECT
      al.*,
      u.name as userName,
      u.email as userEmail
    FROM AuditLog al
    JOIN User u ON u.id = al.userId
    WHERE al.resourceType = ${resourceType}
      AND al.resourceId = ${resourceId}
      AND al.userId = ${session.user.id}
    ORDER BY al.createdAt DESC
    LIMIT ${limit}
  `;

  return logs.map((log) => ({
    ...log,
    changes: log.changes ? JSON.parse(log.changes) : null,
  }));
}

/**
 * Gets all audit logs for current user
 */
export async function getUserAuditLogs(limit: number = 100, offset: number = 0) {
  const session = await getServerSession(authOptions);
  if (!session) return { logs: [], total: 0 };

  const [logs, countResult] = await Promise.all([
    prisma.$queryRaw<any[]>`
      SELECT
        al.*,
        u.name as userName,
        u.email as userEmail
      FROM AuditLog al
      JOIN User u ON u.id = al.userId
      WHERE al.userId = ${session.user.id}
      ORDER BY al.createdAt DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM AuditLog
      WHERE userId = ${session.user.id}
    `,
  ]);

  return {
    logs: logs.map((log) => ({
      ...log,
      changes: log.changes ? JSON.parse(log.changes) : null,
    })),
    total: countResult[0]?.count || 0,
  };
}

/**
 * Compares two objects and returns the differences
 */
export function getObjectDiff(oldObj: any, newObj: any): Record<string, any> {
  const changes: Record<string, any> = {};

  // Check for changed or new fields
  for (const key in newObj) {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      changes[key] = {
        old: oldObj[key],
        new: newObj[key],
      };
    }
  }

  // Check for removed fields
  for (const key in oldObj) {
    if (!(key in newObj)) {
      changes[key] = {
        old: oldObj[key],
        new: null,
      };
    }
  }

  return changes;
}

/**
 * Helper to generate unique IDs
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Middleware helper to automatically log actions
 */
export function withAuditLog(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>,
  getAuditData: (req: NextRequest, ...args: any[]) => Promise<AuditLogData | null>
) {
  return async function (req: NextRequest, ...args: any[]) {
    const response = await handler(req, ...args);

    // Only log successful operations
    if (response.ok) {
      const auditData = await getAuditData(req, ...args);
      if (auditData) {
        await createAuditLog({
          ...auditData,
          request: req,
        });
      }
    }

    return response;
  };
}
