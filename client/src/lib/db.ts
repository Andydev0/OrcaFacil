import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Cliente, Produto, Orcamento, ItemOrcamento, ConfiguracaoEmpresa, EstatisticasDashboard } from '@/types';

interface BancoDadosOrcamento extends DBSchema {
  clientes: {
    key: number;
    value: Cliente;
    indexes: { 'por-nome': string };
  };
  produtos: {
    key: number;
    value: Produto;
    indexes: { 'por-nome': string; 'por-tipo': string };
  };
  orcamentos: {
    key: number;
    value: Orcamento;
    indexes: { 'por-cliente': number; 'por-status': string; 'por-data': Date };
  };
  itensOrcamento: {
    key: number;
    value: ItemOrcamento;
    indexes: { 'por-orcamento': number };
  };
  configuracaoEmpresa: {
    key: number;
    value: ConfiguracaoEmpresa;
  };
}

// Definir tipos de stores para garantir tipagem correta
type NomesStore = 'clientes' | 'produtos' | 'orcamentos' | 'itensOrcamento' | 'configuracaoEmpresa';
type ValoresStore = {
  clientes: Cliente;
  produtos: Produto;
  orcamentos: Orcamento;
  itensOrcamento: ItemOrcamento;
  configuracaoEmpresa: ConfiguracaoEmpresa;
};

let db: IDBPDatabase<BancoDadosOrcamento>;

export const inicializarBD = async (): Promise<IDBPDatabase<BancoDadosOrcamento>> => {
  if (db) return db;

  db = await openDB<BancoDadosOrcamento>('orcamento-app-db', 1, {
    upgrade(db) {
      // Criar store de clientes
      const storeClientes = db.createObjectStore('clientes', { keyPath: 'id', autoIncrement: true });
      storeClientes.createIndex('por-nome', 'nome');

      // Criar store de produtos
      const storeProdutos = db.createObjectStore('produtos', { keyPath: 'id', autoIncrement: true });
      storeProdutos.createIndex('por-nome', 'nome');
      storeProdutos.createIndex('por-tipo', 'tipo');

      // Criar store de orçamentos
      const storeOrcamentos = db.createObjectStore('orcamentos', { keyPath: 'id', autoIncrement: true });
      storeOrcamentos.createIndex('por-cliente', 'clienteId');
      storeOrcamentos.createIndex('por-status', 'status');
      storeOrcamentos.createIndex('por-data', 'criadoEm');

      // Criar store de itens de orçamento
      const storeItensOrcamento = db.createObjectStore('itensOrcamento', { keyPath: 'id', autoIncrement: true });
      storeItensOrcamento.createIndex('por-orcamento', 'orcamentoId');

      // Criar store de configurações da empresa
      db.createObjectStore('configuracaoEmpresa', { keyPath: 'id', autoIncrement: true });
    },
  });

  return db;
};

// Operações CRUD genéricas
export const buscarTodos = async <T>(nomeStore: NomesStore): Promise<T[]> => {
  const db = await inicializarBD();
  return db.getAll(nomeStore) as unknown as T[];
};

export const buscarPorId = async <T>(nomeStore: NomesStore, id: number): Promise<T | undefined> => {
  const db = await inicializarBD();
  return db.get(nomeStore, id) as unknown as T | undefined;
};

export const adicionar = async <T>(nomeStore: NomesStore, item: Omit<T, 'id'>): Promise<number> => {
  const db = await inicializarBD();
  return db.add(nomeStore, item as any);
};

export const atualizar = async <T extends { id: number }>(nomeStore: NomesStore, item: T): Promise<number> => {
  const db = await inicializarBD();
  await db.put(nomeStore, item as any);
  return item.id;
};

export const remover = async (nomeStore: NomesStore, id: number): Promise<void> => {
  const db = await inicializarBD();
  await db.delete(nomeStore, id);
};

// Funções auxiliares para operações comuns no banco de dados
export const getAll = async <T>(store: "clientes" | "produtos" | "orcamentos" | "itensOrcamento" | "configuracaoEmpresa"): Promise<T[]> => {
  const db = await inicializarBD();
  const result = await db.getAll(store);
  return result as unknown as T[];
};

export const get = async <T>(store: "clientes" | "produtos" | "orcamentos" | "itensOrcamento" | "configuracaoEmpresa", id: number): Promise<T | undefined> => {
  const db = await inicializarBD();
  const result = await db.get(store, id);
  return result as unknown as T | undefined;
};

export const add = async <T>(store: "clientes" | "produtos" | "orcamentos" | "itensOrcamento" | "configuracaoEmpresa", item: T): Promise<number> => {
  const db = await inicializarBD();
  return db.add(store, item as unknown as Cliente | Produto | Orcamento | ItemOrcamento | ConfiguracaoEmpresa);
};

export const update = async <T extends { id: number }>(store: "clientes" | "produtos" | "orcamentos" | "itensOrcamento" | "configuracaoEmpresa", item: T): Promise<void> => {
  const db = await inicializarBD();
  await db.put(store, item as unknown as Cliente | Produto | Orcamento | ItemOrcamento | ConfiguracaoEmpresa);
};

export const remove = async (store: "clientes" | "produtos" | "orcamentos" | "itensOrcamento" | "configuracaoEmpresa", id: number): Promise<void> => {
  const db = await inicializarBD();
  await db.delete(store, id);
};

// Operações específicas para orçamentos com itens relacionados
export const buscarOrcamentoComItens = async (orcamentoId: number): Promise<Orcamento | null> => {
  const db = await inicializarBD();
  const orcamento = await db.get('orcamentos', orcamentoId);
  if (!orcamento) return null;

  const tx = db.transaction(['itensOrcamento', 'produtos', 'clientes'], 'readonly');
  const itens = await tx.objectStore('itensOrcamento').index('por-orcamento').getAll(orcamentoId);
  
  // Buscar produtos para cada item
  for (const item of itens) {
    item.produto = await tx.objectStore('produtos').get(item.produtoId);
  }
  
  // Buscar cliente
  orcamento.cliente = await tx.objectStore('clientes').get(orcamento.clienteId);
  orcamento.itens = itens;
  
  return orcamento;
};

export const salvarOrcamentoComItens = async (
  orcamento: Partial<Orcamento> & { id?: number; criadoEm: Date; clienteId: number; titulo: string; validoAte: Date; status: Orcamento['status']; total: number; incluirImpostos: boolean }, 
  itens: Array<Omit<ItemOrcamento, 'id' | 'orcamentoId'> & { id?: number }>
): Promise<number> => {
  const db = await inicializarBD();
  
  let orcamentoId: number;
  
  // Primeiro, salvar ou atualizar o orçamento
  if (orcamento.id) {
    // Atualizar orçamento existente
    const txOrcamento = db.transaction('orcamentos', 'readwrite');
    // Garantir que o objeto tenha uma propriedade 'itens' válida
    const orcamentoCompleto = {
      ...orcamento,
      itens: [] // Inicializar com array vazio, os itens serão adicionados separadamente
    } as Orcamento;
    await txOrcamento.objectStore('orcamentos').put(orcamentoCompleto);
    await txOrcamento.done;
    orcamentoId = orcamento.id;
    
    // Excluir itens existentes para este orçamento em uma transação separada
    const itensExistentes = await db.getAllKeysFromIndex('itensOrcamento', 'por-orcamento', orcamentoId);
    if (itensExistentes.length > 0) {
      const txDeletar = db.transaction('itensOrcamento', 'readwrite');
      for (const itemId of itensExistentes) {
        txDeletar.objectStore('itensOrcamento').delete(itemId);
      }
      await txDeletar.done;
    }
  } else {
    // Criar novo orçamento
    const txNovo = db.transaction('orcamentos', 'readwrite');
    // Garantir que o objeto tenha uma propriedade 'itens' válida
    const orcamentoCompleto = {
      ...orcamento,
      itens: [] // Inicializar com array vazio, os itens serão adicionados separadamente
    };
    // Remover explicitamente a propriedade id para que o IndexedDB gere um novo
    delete (orcamentoCompleto as any).id;
    
    orcamentoId = await txNovo.objectStore('orcamentos').add(orcamentoCompleto as unknown as Orcamento);
    await txNovo.done;
  }
  
  // Adicionar novos itens em uma transação separada
  if (itens.length > 0) {
    const txItens = db.transaction('itensOrcamento', 'readwrite');
    for (const item of itens) {
      // Garantir que o objeto tenha as propriedades necessárias
      const itemCompleto = {
        ...item,
        orcamentoId,
        subtotal: (item.quantidade || 0) * (item.precoUnitario || 0) * (1 - (item.desconto || 0) / 100)
      };
      // Remover explicitamente a propriedade id para que o IndexedDB gere um novo
      delete itemCompleto.id;
      
      txItens.objectStore('itensOrcamento').add(itemCompleto as unknown as ItemOrcamento);
    }
    await txItens.done;
  }
  
  return orcamentoId;
};

export const getEstatisticasDashboard = async (): Promise<EstatisticasDashboard> => {
  const db = await inicializarBD();
  
  // Obter contagens
  const clientes = await db.count('clientes');
  const produtos = await db.count('produtos');
  const orcamentos = await db.count('orcamentos');
  
  // Obter orçamentos recentes
  const orcamentosRecentes = await db.getAllFromIndex('orcamentos', 'por-data', IDBKeyRange.upperBound(new Date()));
  
  // Calcular valor total dos orçamentos
  let valorTotal = 0;
  for (const orcamento of orcamentosRecentes) {
    valorTotal += orcamento.total || 0;
  }
  
  // Valores padrão para satisfazer o tipo EstatisticasDashboard
  return {
    orcamentosAtivos: orcamentos,
    totalMensal: valorTotal,
    taxaConversao: 0,
    clientesAtivos: clientes,
    orcamentosRecentes: orcamentosRecentes.slice(0, 5),
    clientesPrincipais: [],
    produtosPopulares: [],
    dadosGraficoBarras: [{ mes: 'Jan' }],
    dadosGraficoLinha: [{ mes: 'Jan', Orçamentos: 0, Aprovados: 0 }],
    tendenciaOrcamentos: 0,
    tendenciaTotalMensal: 0,
    tendenciaTaxaConversao: 0,
    tendenciaClientesAtivos: 0
  };
};

export const getConfiguracaoEmpresa = async (): Promise<ConfiguracaoEmpresa | null> => {
  const db = await inicializarBD();
  const configuracoes = await db.getAll('configuracaoEmpresa');
  return configuracoes.length > 0 ? configuracoes[0] : null;
};

// Obter configurações da empresa ou criar padrão
export const buscarConfiguracaoEmpresa = async (): Promise<ConfiguracaoEmpresa> => {
  try {
    const db = await inicializarBD();
    const configuracoes = await db.getAll('configuracaoEmpresa');
    
    if (configuracoes.length === 0) {
      // Criar configurações padrão
      const configuracoesPadrao: ConfiguracaoEmpresa = {
        id: 1, // ID fixo para evitar problemas
        nome: 'Minha Empresa',
        moeda: 'BRL',
        configuracaoImpostosPadrao: {
          iss: 3,
          pis: 0.65,
          cofins: 3
        },
        criadoEm: new Date()
      };
      
      try {
        // Tenta adicionar com ID fixo
        await db.put('configuracaoEmpresa', configuracoesPadrao);
        return configuracoesPadrao;
      } catch (error) {
        console.error("Erro ao salvar configuração padrão:", error);
        // Retorna o objeto mesmo se falhar ao salvar
        return configuracoesPadrao;
      }
    }
    
    return configuracoes[0];
  } catch (error) {
    console.error("Erro ao buscar configuração da empresa:", error);
    // Retorna uma configuração padrão em caso de erro
    return {
      id: 1,
      nome: 'Minha Empresa',
      moeda: 'BRL',
      configuracaoImpostosPadrao: {
        iss: 3,
        pis: 0.65,
        cofins: 3
      },
      criadoEm: new Date()
    };
  }
};

// Atualizar configurações da empresa
export const atualizarConfiguracaoEmpresa = async (configuracao: ConfiguracaoEmpresa): Promise<void> => {
  try {
    const db = await inicializarBD();
    await db.put('configuracaoEmpresa', configuracao);
  } catch (error) {
    console.error("Erro ao atualizar configuração da empresa:", error);
    throw error;
  }
};

// Funções de busca
export const buscarClientes = async (consulta: string): Promise<Cliente[]> => {
  const db = await inicializarBD();
  const clientes = await db.getAll('clientes');
  if (!consulta) return clientes;
  
  const consultaMinuscula = consulta.toLowerCase();
  return clientes.filter(cliente => 
    cliente.nome.toLowerCase().includes(consultaMinuscula) ||
    (cliente.documento && cliente.documento.includes(consulta)) ||
    (cliente.email && cliente.email.toLowerCase().includes(consultaMinuscula))
  );
};

export const buscarProdutos = async (consulta: string, tipo?: 'produto' | 'servico'): Promise<Produto[]> => {
  const db = await inicializarBD();
  let produtos: Produto[] = [];
  
  if (tipo) {
    produtos = await db.getAllFromIndex('produtos', 'por-tipo', tipo);
  } else {
    produtos = await db.getAll('produtos');
  }
  
  if (!consulta) return produtos;
  
  const consultaMinuscula = consulta.toLowerCase();
  return produtos.filter(produto => 
    produto.nome.toLowerCase().includes(consultaMinuscula) ||
    (produto.descricao?.toLowerCase().includes(consultaMinuscula) || false)
  );
};

// Obter estatísticas do dashboard
export const obterEstatisticasDashboard = async (): Promise<EstatisticasDashboard> => {
  // Obter todos os orçamentos para análise
  const orcamentos = await getAll<Orcamento>("orcamentos");
  const clientes = await getAll<Cliente>("clientes");
  const produtos = await getAll<Produto>("produtos");
  const itensOrcamento = await getAll<ItemOrcamento>("itensOrcamento");
  
  // Calcular orçamentos ativos (rascunho, pendentes, em análise ou aprovados)
  const orcamentosAtivos = orcamentos.filter(o => 
    o.status === 'rascunho' || o.status === 'pendente' || o.status === 'analisando' || o.status === 'aprovado'
  ).length;
  
  // Calcular total mensal (orçamentos deste mês)
  const dataAtual = new Date();
  const inicioMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
  const orcamentosMes = orcamentos.filter(o => 
    new Date(o.criadoEm) >= inicioMes
  );
  const totalMensal = orcamentosMes.reduce((total, o) => total + (o.total || 0), 0);
  
  // Calcular dados do mês anterior para comparação
  const inicioMesAnterior = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1);
  const fimMesAnterior = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 0);
  
  const orcamentosMesAnterior = orcamentos.filter(o => {
    const data = new Date(o.criadoEm);
    return data >= inicioMesAnterior && data <= fimMesAnterior;
  });
  
  const orcamentosAtivosMesAnterior = orcamentosMesAnterior.filter(o => 
    o.status === 'rascunho' || o.status === 'pendente' || o.status === 'analisando' || o.status === 'aprovado'
  ).length;
  
  const totalMensalAnterior = orcamentosMesAnterior.reduce((total, o) => total + (o.total || 0), 0);
  
  // Calcular tendências
  const tendenciaOrcamentos = orcamentosAtivosMesAnterior > 0 
    ? ((orcamentosAtivos - orcamentosAtivosMesAnterior) / orcamentosAtivosMesAnterior) * 100 
    : 0;
    
  const tendenciaTotalMensal = totalMensalAnterior > 0 
    ? ((totalMensal - totalMensalAnterior) / totalMensalAnterior) * 100 
    : 0;
  
  // Calcular taxa de conversão (orçamentos aprovados / total finalizados)
  const orcamentosFinalizados = orcamentos.filter(o => 
    o.status === 'aprovado' || o.status === 'recusado'
  );
  const orcamentosAprovados = orcamentos.filter(o => o.status === 'aprovado');
  const taxaConversao = orcamentosFinalizados.length > 0 
    ? (orcamentosAprovados.length / orcamentosFinalizados.length) * 100 
    : 0;
    
  // Calcular taxa de conversão do mês anterior
  const orcamentosFinalizadosMesAnterior = orcamentosMesAnterior.filter(o => 
    o.status === 'aprovado' || o.status === 'recusado'
  );
  const orcamentosAprovadosMesAnterior = orcamentosMesAnterior.filter(o => 
    o.status === 'aprovado'
  );
  const taxaConversaoMesAnterior = orcamentosFinalizadosMesAnterior.length > 0 
    ? (orcamentosAprovadosMesAnterior.length / orcamentosFinalizadosMesAnterior.length) * 100 
    : 0;
    
  const tendenciaTaxaConversao = taxaConversaoMesAnterior > 0 
    ? ((taxaConversao - taxaConversaoMesAnterior) / taxaConversaoMesAnterior) * 100 
    : 0;
  
  // Calcular clientes ativos (com orçamentos ativos)
  const clientesIds = new Set(
    orcamentos
      .filter(o => o.status === 'rascunho' || o.status === 'pendente' || o.status === 'analisando' || o.status === 'aprovado')
      .map(o => o.clienteId)
      .filter(id => id) // Filtra IDs nulos ou indefinidos
  );
  const clientesAtivos = clientesIds.size;
  
  // Calcular clientes ativos do mês anterior
  const clientesIdsMesAnterior = new Set(
    orcamentosMesAnterior
      .filter(o => o.status === 'rascunho' || o.status === 'pendente' || o.status === 'analisando' || o.status === 'aprovado')
      .map(o => o.clienteId)
      .filter(id => id)
  );
  const clientesAtivosMesAnterior = clientesIdsMesAnterior.size;
  
  const tendenciaClientesAtivos = clientesAtivosMesAnterior > 0 
    ? ((clientesAtivos - clientesAtivosMesAnterior) / clientesAtivosMesAnterior) * 100 
    : 0;
  
  // Obter orçamentos recentes ordenados por data
  const orcamentosRecentes = [...orcamentos]
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
    .slice(0, 5)
    .map(o => {
      // Adicionar informações do cliente
      const cliente = clientes.find(c => c.id === o.clienteId);
      return { ...o, cliente };
    });
  
  // Calcular principais clientes (por valor total de orçamentos)
  const clientesMap = new Map<number, {
    id: number;
    total: number;
    orcamentos: number;
    aprovados: number;
  }>();
  
  orcamentos.forEach(o => {
    if (!clientesMap.has(o.clienteId)) {
      clientesMap.set(o.clienteId, {
        id: o.clienteId,
        total: 0,
        orcamentos: 0,
        aprovados: 0
      });
    }
    
    const clienteStats = clientesMap.get(o.clienteId);
    if (clienteStats) {
      clienteStats.total += (o.total || 0);
      clienteStats.orcamentos += 1;
      if (o.status === 'aprovado') {
        clienteStats.aprovados += 1;
      }
    }
  });
  
  const clientesPrincipais = Array.from(clientesMap.entries())
    .map(([id, stats]) => {
      const cliente = clientes.find(c => c.id === id);
      return {
        id,
        nome: cliente?.nome || 'Cliente não encontrado',
        tipo: cliente?.documento && cliente.documento.length > 14 ? 'Empresa' : 'Pessoa',
        total: stats.total,
        taxaConversao: stats.orcamentos > 0 
          ? (stats.aprovados / stats.orcamentos) * 100 
          : 0
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  
  // Calcular produtos populares (por quantidade em orçamentos)
  const produtosMap = new Map<number, {
    id: number;
    quantidade: number;
    valor: number;
  }>();
  
  itensOrcamento.forEach(item => {
    if (!produtosMap.has(item.produtoId)) {
      produtosMap.set(item.produtoId, {
        id: item.produtoId,
        quantidade: 0,
        valor: 0
      });
    }
    
    const produtoStats = produtosMap.get(item.produtoId);
    if (produtoStats) {
      produtoStats.quantidade += (item.quantidade || 0);
      produtoStats.valor += (item.subtotal || 0);
    }
  });
  
  const produtosPopulares = Array.from(produtosMap.entries())
    .map(([id, stats]) => {
      const produto = produtos.find(p => p.id === id);
      return {
        id,
        nome: produto?.nome || 'Produto não encontrado',
        tipo: produto?.tipo || 'produto',
        quantidade: stats.quantidade,
        valor: stats.valor
      };
    })
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);
  
  // Dados para gráficos
  // Dados para gráfico de barras - produtos mais vendidos por mês
  const ultimosSeisMeses = Array.from({ length: 6 }, (_, i) => {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    return {
      mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
      mesNum: data.getMonth(),
      ano: data.getFullYear()
    };
  }).reverse();
  
  const dadosGraficoBarras = ultimosSeisMeses.map(periodo => {
    const resultado: { [key: string]: string | number } = { mes: periodo.mes };
    
    // Pegar os 3 produtos mais populares para mostrar no gráfico
    const top3Produtos = produtosPopulares.slice(0, 3);
    
    top3Produtos.forEach(produto => {
      // Calcular quantidade vendida deste produto neste mês
      const quantidadeMes = itensOrcamento
        .filter(item => {
          const orcamento = orcamentos.find(o => o.id === item.orcamentoId);
          if (!orcamento) return false;
          
          const dataOrcamento = new Date(orcamento.criadoEm);
          return item.produtoId === produto.id && 
                 dataOrcamento.getMonth() === periodo.mesNum && 
                 dataOrcamento.getFullYear() === periodo.ano;
        })
        .reduce((sum, item) => sum + (item.quantidade || 0), 0);
      
      resultado[produto.nome] = quantidadeMes;
    });
    
    return resultado;
  });
  
  // Dados para gráfico de linha - orçamentos por mês
  const dadosGraficoLinha = ultimosSeisMeses.map(periodo => {
    // Contar orçamentos deste mês
    const orcamentosMes = orcamentos.filter(o => {
      const dataOrcamento = new Date(o.criadoEm);
      return dataOrcamento.getMonth() === periodo.mesNum && 
             dataOrcamento.getFullYear() === periodo.ano;
    });
    
    // Contar aprovados
    const aprovadosMes = orcamentosMes.filter(o => o.status === 'aprovado');
    
    return {
      mes: periodo.mes,
      Orçamentos: orcamentosMes.length,
      Aprovados: aprovadosMes.length
    };
  });
  
  return {
    orcamentosAtivos,
    totalMensal,
    taxaConversao,
    clientesAtivos,
    orcamentosRecentes,
    clientesPrincipais,
    produtosPopulares,
    dadosGraficoBarras,
    dadosGraficoLinha,
    tendenciaOrcamentos,
    tendenciaTotalMensal,
    tendenciaTaxaConversao,
    tendenciaClientesAtivos
  };
};

// Manter compatibilidade com código existente
export const getDashboardStats = obterEstatisticasDashboard;

// Renomear para manter consistência com o AppContext
export const saveOrcamentoWithItens = salvarOrcamentoComItens;
export const getOrcamentoComItens = buscarOrcamentoComItens;
