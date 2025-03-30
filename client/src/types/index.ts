export type ItemNavegacao = {
  titulo: string;
  href: string;
  icone: string;
  estaAtivo?: boolean;
};

export interface Cliente {
  id: number;
  nome: string;
  documento?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  criadoEm: Date;
}

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  tipo: 'produto' | 'servico';
  unidade?: string;
  codigoInterno?: string;
  criadoEm: Date;
}

export interface ItemOrcamento {
  id: number;
  orcamentoId: number;
  produtoId: number;
  produto?: Produto;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  descricao?: string;
  subtotal: number;
}

export type StatusOrcamento = 'rascunho' | 'pendente' | 'aprovado' | 'recusado' | 'analisando';

export interface ConfiguracaoImpostos {
  iss: number;
  pis: number;
  cofins: number;
  outros?: string;
}

export interface Orcamento {
  id: number;
  titulo: string;
  clienteId: number;
  cliente?: Partial<Cliente>;
  criadoEm: Date;
  validoAte: Date;
  status: StatusOrcamento;
  total: number;
  observacoes?: string;
  formaPagamento?: string;
  condicoesPagamento?: string;
  pagamentoPersonalizado?: string;
  prazoEntrega?: string;
  incluirImpostos: boolean;
  detalhesImpostos?: ConfiguracaoImpostos;
  itens: ItemOrcamento[];
}

export interface ConfiguracaoEmpresa {
  id: number;
  nome: string;
  documento?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  logo?: string;
  configuracaoImpostosPadrao?: ConfiguracaoImpostos;
  moeda: string;
  criadoEm: Date;
}

export interface EstatisticasDashboard {
  orcamentosAtivos: number;
  totalMensal: number;
  taxaConversao: number;
  clientesAtivos: number;
  orcamentosRecentes: Orcamento[];
  clientesPrincipais: Array<{
    id: number;
    nome: string;
    tipo: string;
    total: number;
    taxaConversao: number;
  }>;
  produtosPopulares: Array<{
    id: number;
    nome: string;
    tipo: string;
    quantidade: number;
    valor: number;
  }>;
  dadosGraficoBarras: Array<{
    [key: string]: string | number;
  }>;
  dadosGraficoLinha: Array<{
    mes: string;
    Orçamentos: number;
    Aprovados: number;
  }>;
  tendenciaOrcamentos: number;
  tendenciaTotalMensal: number;
  tendenciaTaxaConversao: number;
  tendenciaClientesAtivos: number;
}

// Tipos para o gerador de PDF
export interface Quote {
  id: number | string;
  title: string;
  createdAt: Date;
  validUntil: Date;
  status: StatusOrcamento;
  includeTaxes: boolean;
  taxDetails?: {
    iss: number;
    pis: number;
    cofins: number;
  };
  paymentMethod?: string;
  paymentTerms?: string;
  customPayment?: string;
  deliveryTime?: string;
  notes?: string;
  items: QuoteItem[];
}

export interface QuoteItem {
  product?: {
    name: string;
    description?: string;
  };
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface Client {
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CompanySettings {
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
}
