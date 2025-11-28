import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  orcamentoNumero: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 9,
    color: '#64748b',
    width: '30%',
  },
  value: {
    fontSize: 10,
    color: '#0f172a',
    width: '70%',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e2e8f0',
    fontSize: 9,
  },
  tableRowLast: {
    flexDirection: 'row',
    padding: 8,
    fontSize: 9,
  },
  col1: { width: '50%' },
  col2: { width: '12%', textAlign: 'right' },
  col3: { width: '19%', textAlign: 'right' },
  col4: { width: '19%', textAlign: 'right' },
  totaisBox: {
    backgroundColor: '#eff6ff',
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
    border: '1 solid #bfdbfe',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 10,
    color: '#1e40af',
  },
  totalValue: {
    fontSize: 10,
    color: '#1e40af',
    fontWeight: 'bold',
  },
  totalFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #3b82f6',
  },
  totalFinalLabel: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: 'bold',
  },
  totalFinalValue: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
  observacoes: {
    backgroundColor: '#fef3c7',
    padding: 10,
    marginTop: 10,
    border: '1 solid #fbbf24',
    fontSize: 9,
  },
  statusBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4 8',
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoItem: {
    width: '48%',
    marginBottom: 8,
  },
});

interface OrcamentoPDFProps {
  orcamento: {
    numero: string;
    clienteNome: string;
    clienteEmail: string | null;
    clienteTelefone: string | null;
    clienteCNPJ: string | null;
    validade: string;
    subtotal: number;
    desconto: number;
    descontoTipo: string;
    total: number;
    status: string;
    observacoes: string | null;
    createdAt: string;
    itens: Array<{
      descricao: string;
      quantidade: number;
      precoUnitario: number;
      desconto: number;
      total: number;
    }>;
    user: {
      nome: string;
      email: string;
    };
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
};

const statusMap: Record<string, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviado',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  expirado: 'Expirado',
};

export const OrcamentoPDF: React.FC<OrcamentoPDFProps> = ({ orcamento }) => {
  const descontoValor = orcamento.descontoTipo === 'percentual'
    ? (Number(orcamento.subtotal) * Number(orcamento.desconto)) / 100
    : Number(orcamento.desconto);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Prezzo</Text>
          <Text style={styles.subtitle}>Sistema Inteligente de Precificação</Text>
          <Text style={styles.orcamentoNumero}>Orçamento #{orcamento.numero}</Text>
          <View style={styles.statusBadge}>
            <Text>{statusMap[orcamento.status] || orcamento.status}</Text>
          </View>
        </View>

        {/* Informações do Orçamento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Orçamento</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Data de Emissão:</Text>
                <Text style={styles.value}>{formatDate(orcamento.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Validade:</Text>
                <Text style={styles.value}>{formatDate(orcamento.validade)}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.row}>
                <Text style={styles.label}>Responsável:</Text>
                <Text style={styles.value}>{orcamento.user.nome}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dados do Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome/Razão Social:</Text>
            <Text style={styles.value}>{orcamento.clienteNome}</Text>
          </View>
          {orcamento.clienteCNPJ && (
            <View style={styles.row}>
              <Text style={styles.label}>CNPJ/CPF:</Text>
              <Text style={styles.value}>{orcamento.clienteCNPJ}</Text>
            </View>
          )}
          {orcamento.clienteEmail && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{orcamento.clienteEmail}</Text>
            </View>
          )}
          {orcamento.clienteTelefone && (
            <View style={styles.row}>
              <Text style={styles.label}>Telefone:</Text>
              <Text style={styles.value}>{orcamento.clienteTelefone}</Text>
            </View>
          )}
        </View>

        {/* Itens do Orçamento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens do Orçamento</Text>
          <View style={styles.table}>
            {/* Cabeçalho */}
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Descrição</Text>
              <Text style={styles.col2}>Qtd.</Text>
              <Text style={styles.col3}>Preço Unit.</Text>
              <Text style={styles.col4}>Total</Text>
            </View>

            {/* Linhas */}
            {orcamento.itens.map((item, index) => (
              <View
                key={index}
                style={index === orcamento.itens.length - 1 ? styles.tableRowLast : styles.tableRow}
              >
                <Text style={styles.col1}>{item.descricao}</Text>
                <Text style={styles.col2}>{item.quantidade}</Text>
                <Text style={styles.col3}>{formatCurrency(Number(item.precoUnitario))}</Text>
                <Text style={styles.col4}>{formatCurrency(Number(item.total))}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Observações */}
        {orcamento.observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <View style={styles.observacoes}>
              <Text>{orcamento.observacoes}</Text>
            </View>
          </View>
        )}

        {/* Totais */}
        <View style={styles.totaisBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(Number(orcamento.subtotal))}</Text>
          </View>

          {Number(orcamento.desconto) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Desconto ({orcamento.descontoTipo === 'percentual' ? `${orcamento.desconto}%` : 'R$'}):
              </Text>
              <Text style={styles.totalValue}>- {formatCurrency(descontoValor)}</Text>
            </View>
          )}

          <View style={styles.totalFinalRow}>
            <Text style={styles.totalFinalLabel}>TOTAL:</Text>
            <Text style={styles.totalFinalValue}>{formatCurrency(Number(orcamento.total))}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Orçamento gerado em {formatDate(new Date().toISOString())}</Text>
          <Text>Este orçamento tem validade até {formatDate(orcamento.validade)}</Text>
        </View>
      </Page>
    </Document>
  );
};
