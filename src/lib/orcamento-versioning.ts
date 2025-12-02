import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface OrcamentoSnapshot {
  id: string;
  numero: string;
  clienteNome: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  status: string;
  validade: Date;
  observacoes?: string;
  desconto: number;
  itens: any[];
  valorTotal: number;
}

/**
 * Creates a new version of an orcamento
 */
export async function createOrcamentoVersion(
  orcamentoId: string,
  changeNote?: string
): Promise<number> {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Get current orcamento data
  const orcamento = await prisma.orcamento.findUnique({
    where: { id: orcamentoId },
    include: {
      itens: {
        include: {
          itemProduto: true,
        },
      },
    },
  });

  if (!orcamento) throw new Error("Orçamento não encontrado");
  if (orcamento.userId !== session.user.id) throw new Error("Forbidden");

  // Get current version number from existing versions
  const versions = await prisma.$queryRaw<Array<{ version: number }>>`
    SELECT MAX(version) as version FROM OrcamentoVersion WHERE orcamentoId = ${orcamentoId}
  `;
  const currentVersion = versions[0]?.version || 0;
  const newVersion = currentVersion + 1;

  // Create snapshot
  const snapshot: OrcamentoSnapshot = {
    id: orcamento.id,
    numero: orcamento.numero,
    clienteNome: orcamento.clienteNome,
    clienteEmail: orcamento.clienteEmail || undefined,
    clienteTelefone: orcamento.clienteTelefone || undefined,
    status: orcamento.status,
    validade: orcamento.validade,
    observacoes: orcamento.observacoes || undefined,
    desconto: Number(orcamento.desconto),
    itens: orcamento.itens.map((item) => ({
      itemProdutoId: item.itemProdutoId,
      descricao: item.descricao,
      quantidade: Number(item.quantidade),
      valorUnitario: Number(item.precoUnitario),
      valorTotal: Number(item.total),
    })),
    valorTotal: Number(orcamento.total),
  };

  // Save version
  await prisma.$executeRaw`
    INSERT INTO OrcamentoVersion (id, orcamentoId, version, data, changedBy, changeNote, createdAt)
    VALUES (
      ${generateId()},
      ${orcamentoId},
      ${newVersion},
      ${JSON.stringify(snapshot)},
      ${session.user.id},
      ${changeNote || null},
      ${new Date().toISOString()}
    )
  `;

  return newVersion;
}

/**
 * Gets all versions of an orcamento
 */
export async function getOrcamentoVersions(orcamentoId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  const versions = await prisma.$queryRaw<any[]>`
    SELECT
      ov.*,
      u.name as changedByName,
      u.email as changedByEmail
    FROM OrcamentoVersion ov
    JOIN User u ON u.id = ov.changedBy
    WHERE ov.orcamentoId = ${orcamentoId}
    ORDER BY ov.version DESC
  `;

  return versions.map((version) => ({
    ...version,
    data: JSON.parse(version.data),
  }));
}

/**
 * Gets a specific version of an orcamento
 */
export async function getOrcamentoVersion(orcamentoId: string, version: number) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const versionData = await prisma.$queryRaw<any[]>`
    SELECT
      ov.*,
      u.name as changedByName,
      u.email as changedByEmail
    FROM OrcamentoVersion ov
    JOIN User u ON u.id = ov.changedBy
    WHERE ov.orcamentoId = ${orcamentoId}
      AND ov.version = ${version}
    LIMIT 1
  `;

  if (versionData.length === 0) return null;

  return {
    ...versionData[0],
    data: JSON.parse(versionData[0].data),
  };
}

/**
 * Restores an orcamento to a specific version
 */
export async function restoreOrcamentoVersion(orcamentoId: string, version: number): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const versionData = await getOrcamentoVersion(orcamentoId, version);
  if (!versionData) throw new Error("Versão não encontrada");

  const snapshot: OrcamentoSnapshot = versionData.data;

  // Create new version before restoring
  await createOrcamentoVersion(orcamentoId, `Restaurado para versão ${version}`);

  // Restore orcamento data
  await prisma.orcamento.update({
    where: { id: orcamentoId },
    data: {
      clienteNome: snapshot.clienteNome,
      clienteEmail: snapshot.clienteEmail,
      clienteTelefone: snapshot.clienteTelefone,
      status: snapshot.status,
      validade: snapshot.validade,
      observacoes: snapshot.observacoes,
      desconto: snapshot.desconto,
      total: snapshot.valorTotal,
    },
  });

  // Delete existing itens
  await prisma.itemOrcamento.deleteMany({
    where: { orcamentoId },
  });

  // Recreate itens from snapshot
  for (const item of snapshot.itens) {
    await prisma.itemOrcamento.create({
      data: {
        orcamentoId,
        itemProdutoId: (item as any).itemProdutoId,
        descricao: (item as any).descricao || "",
        quantidade: item.quantidade,
        precoUnitario: item.valorUnitario,
        total: item.valorTotal,
      },
    });
  }
}

/**
 * Compares two versions of an orcamento
 */
export async function compareOrcamentoVersions(
  orcamentoId: string,
  version1: number,
  version2: number
) {
  const [v1, v2] = await Promise.all([
    getOrcamentoVersion(orcamentoId, version1),
    getOrcamentoVersion(orcamentoId, version2),
  ]);

  if (!v1 || !v2) throw new Error("Versão não encontrada");

  const data1: OrcamentoSnapshot = v1.data;
  const data2: OrcamentoSnapshot = v2.data;

  const differences: Record<string, any> = {};

  // Compare basic fields
  const fieldsToCompare = [
    "clienteNome",
    "clienteEmail",
    "clienteTelefone",
    "status",
    "desconto",
    "valorTotal",
    "observacoes",
  ];

  for (const field of fieldsToCompare) {
    if (
      JSON.stringify(data1[field as keyof OrcamentoSnapshot]) !==
      JSON.stringify(data2[field as keyof OrcamentoSnapshot])
    ) {
      differences[field] = {
        version1: data1[field as keyof OrcamentoSnapshot],
        version2: data2[field as keyof OrcamentoSnapshot],
      };
    }
  }

  // Compare itens
  if (JSON.stringify(data1.itens) !== JSON.stringify(data2.itens)) {
    differences.itens = {
      version1: data1.itens,
      version2: data2.itens,
    };
  }

  return {
    version1: v1,
    version2: v2,
    differences,
  };
}

/**
 * Helper to generate unique IDs
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
