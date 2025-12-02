import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validação
const materiaPrimaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  codigo: z.string().optional(),
  unidadeMedida: z.string().min(1, "Unidade de medida é obrigatória"),
  custoUnitario: z.number().min(0, "Custo deve ser maior ou igual a zero"),
  fornecedor: z.string().optional(),
  categoria: z.string().optional(),
  ativo: z.boolean().optional(),
});

// GET - Listar todas as matérias-primas
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const sortBy = searchParams.get("sortBy") || "nome";
    const order = searchParams.get("order") || "asc";

    const where: any = {};

    // Filtro de busca
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { codigo: { contains: search, mode: "insensitive" } },
        { fornecedor: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtro de categoria
    if (categoria) {
      where.categoria = categoria;
    }

    // Filtro de ativo/inativo
    if (ativo !== null && ativo !== "") {
      where.ativo = ativo === "true";
    }

    const skip = (page - 1) * limit;

    // Validar campos de ordenação permitidos
    const allowedSortFields = [
      "nome",
      "codigo",
      "unidadeMedida",
      "custoUnitario",
      "fornecedor",
      "categoria",
      "ativo",
      "createdAt",
    ];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "nome";
    const validOrder = order === "asc" || order === "desc" ? order : "asc";

    const [materiasPrimas, total] = await Promise.all([
      prisma.materiaPrima.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [validSortBy]: validOrder },
        include: {
          _count: {
            select: { composicoes: true },
          },
        },
      }),
      prisma.materiaPrima.count({ where }),
    ]);

    return NextResponse.json({
      data: materiasPrimas,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar matérias-primas:", error);
    return NextResponse.json({ error: "Erro ao buscar matérias-primas" }, { status: 500 });
  }
}

// POST - Criar nova matéria-prima
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    // Validar dados
    const validatedData = materiaPrimaSchema.parse(body);

    // Verificar se código já existe (se fornecido)
    if (validatedData.codigo) {
      const existing = await prisma.materiaPrima.findUnique({
        where: { codigo: validatedData.codigo },
      });

      if (existing) {
        return NextResponse.json({ error: "Código já cadastrado" }, { status: 400 });
      }
    }

    // Criar matéria-prima
    const materiaPrima = await prisma.materiaPrima.create({
      data: {
        nome: validatedData.nome,
        codigo: validatedData.codigo,
        unidadeMedida: validatedData.unidadeMedida,
        custoUnitario: validatedData.custoUnitario,
        fornecedor: validatedData.fornecedor,
        categoria: validatedData.categoria,
        ativo: validatedData.ativo ?? true,
      },
    });

    return NextResponse.json(materiaPrima, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    console.error("Erro ao criar matéria-prima:", error);
    return NextResponse.json({ error: "Erro ao criar matéria-prima" }, { status: 500 });
  }
}
