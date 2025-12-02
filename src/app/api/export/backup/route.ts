import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar apenas os dados que têm relação com userId
    const [orcamentos, user] = await Promise.all([
      prisma.orcamento.findMany({
        where: { userId: session.user.id },
        include: {
          itens: {
            include: {
              itemProduto: {
                include: {
                  variacaoProduto: {
                    include: {
                      tipoProduto: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          nome: true,
          email: true,
          createdAt: true,
        },
      }),
    ]);

    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      user,
      data: {
        orcamentos,
      },
      stats: {
        orcamentos: orcamentos.length,
      },
    };

    const json = JSON.stringify(backup, null, 2);
    const buffer = Buffer.from(json, "utf-8");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="prezzo-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar backup:", error);
    return NextResponse.json({ error: "Erro ao gerar backup" }, { status: 500 });
  }
}
