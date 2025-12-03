import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processarNotaFiscal } from "@/lib/claude-nf-processor";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

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

    // Criar registro inicial no banco
    const notaFiscal = await prisma.notaFiscal.create({
      data: {
        arquivo: file.name,
        nomeArquivo: file.name,
        status: "processando",
        userId: session.user.id,
      },
    });

    // Processar em background
    processarNotaFiscalBackground(notaFiscal.id, buffer, session.user.id);

    return NextResponse.json({
      id: notaFiscal.id,
      message: "Nota fiscal enviada para processamento",
      status: "processando",
    });
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

// Função para processar em background
async function processarNotaFiscalBackground(notaFiscalId: string, buffer: Buffer, userId: string) {
  try {
    // Extrair texto do PDF usando pdfjs-dist
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;

    let pdfText = "";

    // Extrair texto de todas as páginas
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      pdfText += pageText + "\n";
    }

    // Processar com Claude AI
    const dadosExtraidos = await processarNotaFiscal(pdfText);

    // Atualizar registro com dados extraídos
    await prisma.notaFiscal.update({
      where: { id: notaFiscalId },
      data: {
        fornecedor: dadosExtraidos.fornecedor,
        numeroNF: dadosExtraidos.numeroNF,
        dataEmissao: dadosExtraidos.dataEmissao ? new Date(dadosExtraidos.dataEmissao) : null,
        valorTotal: dadosExtraidos.valorTotal,
        dadosExtraidos: dadosExtraidos as any,
        itensProcessados: dadosExtraidos.itens.length,
        status: "processado",
      },
    });

    // Fazer o matching dos itens com matérias-primas
    await matchEAtualizarCustos(notaFiscalId, dadosExtraidos, userId);
  } catch (error) {
    console.error("Erro ao processar NF em background:", error);

    // Atualizar status para erro
    await prisma.notaFiscal.update({
      where: { id: notaFiscalId },
      data: {
        status: "erro",
        erroMensagem: error instanceof Error ? error.message : "Erro desconhecido",
      },
    });
  }
}

// Função de matching e atualização de custos
async function matchEAtualizarCustos(notaFiscalId: string, dadosExtraidos: any, userId: string) {
  const itens = dadosExtraidos.itens || [];
  let itensAtualizados = 0;

  for (const item of itens) {
    // Tentar encontrar matéria-prima correspondente
    const materiaPrima = await encontrarMateriaPrima(item.descricao, item.unidade);

    if (materiaPrima) {
      const custoNovo = Number(item.valorUnitario);
      const custoAnterior = Number(materiaPrima.custoUnitario);

      // Só criar atualização se houver diferença
      if (custoNovo !== custoAnterior) {
        const percentualMudanca = ((custoNovo - custoAnterior) / custoAnterior) * 100;

        // Criar registro de atualização (não confirmado)
        await prisma.atualizacaoCusto.create({
          data: {
            notaFiscalId,
            materiaPrimaId: materiaPrima.id,
            custoAnterior,
            custoNovo,
            percentualMudanca,
            motivo: "IA",
            confirmado: false,
            userId,
          },
        });

        itensAtualizados++;
      }
    }
  }

  // Atualizar contador de itens atualizados
  await prisma.notaFiscal.update({
    where: { id: notaFiscalId },
    data: { itensAtualizados },
  });
}

// Função de matching inteligente
async function encontrarMateriaPrima(descricao: string, unidade: string) {
  const descricaoLower = descricao.toLowerCase();

  // 1. Tentar match exato por nome
  let materiaPrima = await prisma.materiaPrima.findFirst({
    where: {
      nome: {
        equals: descricao,
        mode: "insensitive",
      },
      ativo: true,
    },
  });

  if (materiaPrima) return materiaPrima;

  // 2. Tentar match parcial por nome (contém)
  materiaPrima = await prisma.materiaPrima.findFirst({
    where: {
      nome: {
        contains: descricao,
        mode: "insensitive",
      },
      unidadeMedida: unidade,
      ativo: true,
    },
  });

  if (materiaPrima) return materiaPrima;

  // 3. Tentar match por palavras-chave
  const palavrasChave = descricaoLower.split(" ").filter((p) => p.length > 3);

  for (const palavra of palavrasChave) {
    materiaPrima = await prisma.materiaPrima.findFirst({
      where: {
        nome: {
          contains: palavra,
          mode: "insensitive",
        },
        unidadeMedida: unidade,
        ativo: true,
      },
    });

    if (materiaPrima) return materiaPrima;
  }

  return null;
}
