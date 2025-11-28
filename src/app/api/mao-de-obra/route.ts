import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validação
const maoDeObraSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  codigo: z.string().optional(),
  custoHora: z.number().positive("Custo por hora deve ser positivo"),
  incluiMaquina: z.boolean().default(false),
  custoMaquinaHora: z.number().positive().optional().nullable(),
  descricao: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
});

// GET - Listar todos os tipos de mão de obra
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const tiposMaoDeObra = await prisma.tipoMaoDeObra.findMany({
      orderBy: { nome: "asc" },
      include: {
        _count: {
          select: {
            composicoesMaoDeObra: true,
          },
        },
      },
    });

    // Calcular custo total por hora
    const tiposComCustoTotal = tiposMaoDeObra.map((tipo) => ({
      ...tipo,
      custoTotalHora: tipo.incluiMaquina
        ? Number(tipo.custoHora) + Number(tipo.custoMaquinaHora || 0)
        : Number(tipo.custoHora),
      produtosVinculados: tipo._count.composicoesMaoDeObra,
    }));

    return NextResponse.json(tiposComCustoTotal);
  } catch (error) {
    console.error("Erro ao buscar tipos de mão de obra:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tipos de mão de obra" },
      { status: 500 }
    );
  }
}

// POST - Criar novo tipo de mão de obra
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = maoDeObraSchema.parse(body);

    // Validação: se incluiMaquina é true, custoMaquinaHora deve ser fornecido
    if (data.incluiMaquina && !data.custoMaquinaHora) {
      return NextResponse.json(
        { error: "Custo de máquina é obrigatório quando inclui máquina" },
        { status: 400 }
      );
    }

    // Verificar se código já existe
    if (data.codigo) {
      const existente = await prisma.tipoMaoDeObra.findUnique({
        where: { codigo: data.codigo },
      });

      if (existente) {
        return NextResponse.json(
          { error: "Código já está em uso" },
          { status: 400 }
        );
      }
    }

    const tipoMaoDeObra = await prisma.tipoMaoDeObra.create({
      data: {
        nome: data.nome,
        codigo: data.codigo,
        custoHora: data.custoHora,
        incluiMaquina: data.incluiMaquina,
        custoMaquinaHora: data.custoMaquinaHora,
        descricao: data.descricao,
        ativo: data.ativo,
      },
    });

    return NextResponse.json(tipoMaoDeObra, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao criar tipo de mão de obra:", error);
    return NextResponse.json(
      { error: "Erro ao criar tipo de mão de obra" },
      { status: 500 }
    );
  }
}
