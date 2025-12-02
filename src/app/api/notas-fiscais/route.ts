import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// import { processarNotaFiscal } from "@/lib/claude-nf-processor";
// NOTA: pdfjs-dist causa SIGSEGV em Alpine Linux - temporariamente desabilitado

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Apenas arquivos PDF são suportados" }, { status: 400 });
    }

    // Converter arquivo para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // TEMPORARIAMENTE DESABILITADO: processamento de PDF causa SIGSEGV em Alpine Linux
    // Criar registro inicial no banco
    const notaFiscal = await prisma.notaFiscal.create({
      data: {
        arquivo: file.name,
        nomeArquivo: file.name,
        status: "erro",
        erroMensagem: "Processamento de PDF temporariamente desabilitado - aguardando solução para Alpine Linux",
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      id: notaFiscal.id,
      message: "Upload realizado, mas processamento temporariamente desabilitado",
      status: "erro",
      error: "Processamento de PDF temporariamente indisponível",
    }, { status: 503 });
  } catch (error) {
    console.error("Erro ao fazer upload da NF:", error);
    return NextResponse.json({ error: "Erro ao processar arquivo" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const notasFiscais = await prisma.notaFiscal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        atualizacoes: {
          include: {
            materiaPrima: {
              select: {
                id: true,
                nome: true,
                codigo: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(notasFiscais);
  } catch (error) {
    console.error("Erro ao buscar notas fiscais:", error);
    return NextResponse.json({ error: "Erro ao buscar notas fiscais" }, { status: 500 });
  }
}

// TEMPORARIAMENTE DESABILITADO: pdfjs-dist causa SIGSEGV em Alpine Linux
// TODO: Implementar solução alternativa usando Node.js com debian-based image ou processar PDFs externamente

/*
// Função para processar em background (idealmente seria uma queue como Bull/BullMQ)
async function processarNotaFiscalBackground(notaFiscalId: string, buffer: Buffer, userId: string) {
  // ... código comentado ...
}

// Função de matching e atualização de custos
async function matchEAtualizarCustos(notaFiscalId: string, dadosExtraidos: any, userId: string) {
  // ... código comentado ...
}

// Função de matching inteligente
async function encontrarMateriaPrima(descricao: string, unidade: string) {
  // ... código comentado ...
}
*/
