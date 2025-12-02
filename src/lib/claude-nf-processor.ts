import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || "",
});

export interface NFItem {
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
}

export interface NFDadosExtraidos {
  fornecedor: string | null;
  numeroNF: string | null;
  dataEmissao: string | null;
  valorTotal: number | null;
  itens: NFItem[];
}

export async function processarNotaFiscal(pdfText: string): Promise<NFDadosExtraidos> {
  const prompt = `Você é um assistente especializado em extrair dados de Notas Fiscais brasileiras.

Analise o texto da nota fiscal abaixo e extraia as seguintes informações:

1. Nome do Fornecedor
2. Número da Nota Fiscal
3. Data de Emissão (formato YYYY-MM-DD)
4. Valor Total
5. Lista de itens com:
   - Descrição do produto
   - Quantidade
   - Unidade de medida
   - Valor unitário
   - Valor total do item

IMPORTANTE:
- Retorne APENAS um JSON válido, sem texto adicional
- Se não encontrar alguma informação, use null
- Para itens, tente identificar materiais de construção, insumos industriais, matérias-primas
- Normalize as unidades (ex: M, MT, METRO → metro; KG, KILO → kg; UN, UND, UNID → unidade)
- Valores devem ser números, sem símbolos de moeda

Formato esperado:
{
  "fornecedor": "string ou null",
  "numeroNF": "string ou null",
  "dataEmissao": "YYYY-MM-DD ou null",
  "valorTotal": number ou null,
  "itens": [
    {
      "descricao": "string",
      "quantidade": number,
      "unidade": "string",
      "valorUnitario": number,
      "valorTotal": number
    }
  ]
}

TEXTO DA NOTA FISCAL:
${pdfText}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Extrair JSON da resposta (pode vir com markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Não foi possível extrair JSON da resposta da IA");
    }

    const dados: NFDadosExtraidos = JSON.parse(jsonMatch[0]);

    // Validar e normalizar dados
    return {
      fornecedor: dados.fornecedor || null,
      numeroNF: dados.numeroNF || null,
      dataEmissao: dados.dataEmissao || null,
      valorTotal: dados.valorTotal || null,
      itens: (dados.itens || []).map((item) => ({
        descricao: item.descricao || "Sem descrição",
        quantidade: Number(item.quantidade) || 0,
        unidade: normalizarUnidade(item.unidade || "unidade"),
        valorUnitario: Number(item.valorUnitario) || 0,
        valorTotal: Number(item.valorTotal) || 0,
      })),
    };
  } catch (error) {
    console.error("Erro ao processar NF com Claude:", error);
    throw new Error("Erro ao processar nota fiscal com IA");
  }
}

function normalizarUnidade(unidade: string): string {
  const u = unidade.toLowerCase().trim();

  // Metro
  if (["m", "mt", "mts", "metro", "metros"].includes(u)) return "metro";

  // Quilograma
  if (["kg", "kilo", "quilograma", "quilogramas"].includes(u)) return "kg";

  // Litro
  if (["l", "lt", "lts", "litro", "litros"].includes(u)) return "litro";

  // Unidade
  if (["un", "und", "unid", "unidade", "unidades", "pc", "pç", "peça", "peças"].includes(u))
    return "unidade";

  // Caixa
  if (["cx", "caixa", "caixas"].includes(u)) return "caixa";

  // Padrão
  return "unidade";
}
