import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const tipoProdutoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  codigo: z.string().optional(),
  categoria: z.string().optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
});

// GET - Listar todos os tipos de produto
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoria = searchParams.get("categoria") || "";
    const ativo = searchParams.get("ativo");

    const where: any = {};

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { codigo: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoria) {
      where.categoria = categoria;
    }

    if (ativo !== null && ativo !== "") {
      where.ativo = ativo === "true";
    }

    const tiposProduto = await prisma.tipoProduto.findMany({
      where,
      orderBy: { nome: "asc" },
      include: {
        variacoes: {
          include: {
            _count: {
              select: { composicao: true }
            }
          }
        },
        _count: {
          select: { variacoes: true }
        }
      }
    });

    return NextResponse.json(tiposProduto);
  } catch (error) {
    console.error("Erro ao buscar tipos de produto:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tipos de produto" },
      { status: 500 }
    );
  }
}

// POST - Criar novo tipo de produto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = tipoProdutoSchema.parse(body);

    // Verificar se código já existe
    if (validatedData.codigo) {
      const existing = await prisma.tipoProduto.findUnique({
        where: { codigo: validatedData.codigo }
      });

      if (existing) {
        return NextResponse.json(
          { error: "Código já cadastrado" },
          { status: 400 }
        );
      }
    }

    const tipoProduto = await prisma.tipoProduto.create({
      data: {
        nome: validatedData.nome,
        codigo: validatedData.codigo,
        categoria: validatedData.categoria,
        descricao: validatedData.descricao,
        ativo: validatedData.ativo ?? true,
      },
      include: {
        _count: {
          select: { variacoes: true }
        }
      }
    });

    return NextResponse.json(tipoProduto, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao criar tipo de produto:", error);
    return NextResponse.json(
      { error: "Erro ao criar tipo de produto" },
      { status: 500 }
    );
  }
}
