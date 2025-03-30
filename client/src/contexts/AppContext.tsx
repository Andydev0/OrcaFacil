import React, { createContext, useContext, useState, useEffect } from "react";
import { Cliente, Produto, Orcamento, ItemOrcamento, ConfiguracaoEmpresa, EstatisticasDashboard } from "@/types";
import * as db from "@/lib/db";

interface AppContextType {
  clientes: Cliente[];
  produtos: Produto[];
  orcamentos: Orcamento[];
  configuracaoEmpresa: ConfiguracaoEmpresa | null;
  estatisticasDashboard: EstatisticasDashboard | null;
  carregando: boolean;
  atualizarClientes: () => Promise<void>;
  atualizarProdutos: () => Promise<void>;
  atualizarOrcamentos: () => Promise<void>;
  atualizarEstatisticasDashboard: () => Promise<void>;
  salvarCliente: (cliente: Omit<Cliente, "id" | "criadoEm"> & { id?: number }) => Promise<number>;
  salvarProduto: (produto: Omit<Produto, "id" | "criadoEm"> & { id?: number }) => Promise<number>;
  salvarOrcamento: (orcamento: Omit<Orcamento, "id" | "criadoEm"> & { id?: number, itens: Array<Omit<ItemOrcamento, "id" | "orcamentoId">> }) => Promise<number>;
  salvarConfiguracaoEmpresa: (configuracao: Partial<ConfiguracaoEmpresa>) => Promise<void>;
  excluirCliente: (id: number) => Promise<void>;
  excluirProduto: (id: number) => Promise<void>;
  excluirOrcamento: (id: number) => Promise<void>;
  getOrcamentoComItens: (id: number) => Promise<Orcamento | null>;
  erro: string | null;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [configuracaoEmpresa, setConfiguracaoEmpresa] = useState<ConfiguracaoEmpresa | null>(null);
  const [estatisticasDashboard, setEstatisticasDashboard] = useState<EstatisticasDashboard | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Initialize database and load initial data
  useEffect(() => {
    const inicializarApp = async () => {
      try {
        await db.inicializarBD();
        await Promise.all([
          atualizarClientes(),
          atualizarProdutos(),
          atualizarOrcamentos(),
          atualizarConfiguracaoEmpresa(),
          atualizarEstatisticasDashboard(),
        ]);
        setCarregando(false);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setErro("Falha ao inicializar a aplicação. Por favor, tente novamente.");
        setCarregando(false);
      }
    };

    inicializarApp();
  }, []);

  const atualizarClientes = async () => {
    try {
      const clientes = await db.getAll<Cliente>("clientes");
      setClientes(clientes);
    } catch (error) {
      console.error("Failed to load clientes:", error);
      setErro("Falha ao carregar clientes.");
    }
  };

  const atualizarProdutos = async () => {
    try {
      const produtos = await db.getAll<Produto>("produtos");
      setProdutos(produtos);
    } catch (error) {
      console.error("Failed to load produtos:", error);
      setErro("Falha ao carregar produtos e serviços.");
    }
  };

  const atualizarOrcamentos = async () => {
    try {
      const orcamentos = await db.getAll<Orcamento>("orcamentos");
      setOrcamentos(orcamentos);
    } catch (error) {
      console.error("Failed to load orcamentos:", error);
      setErro("Falha ao carregar orçamentos.");
    }
  };

  const atualizarEstatisticasDashboard = async () => {
    try {
      const estatisticas = await db.getEstatisticasDashboard();
      setEstatisticasDashboard(estatisticas);
    } catch (error) {
      console.error("Failed to load estatisticas dashboard:", error);
      setErro("Falha ao carregar estatísticas do dashboard.");
    }
  };

  const atualizarConfiguracaoEmpresa = async () => {
    try {
      const configuracao = await db.getConfiguracaoEmpresa();
      setConfiguracaoEmpresa(configuracao);
    } catch (error) {
      console.error("Failed to load configuracao empresa:", error);
      setErro("Falha ao carregar configurações da empresa.");
    }
  };

  const salvarCliente = async (cliente: Omit<Cliente, "id" | "criadoEm"> & { id?: number }): Promise<number> => {
    try {
      let clienteId: number;
      
      if (cliente.id) {
        await db.update("clientes", cliente as Cliente);
        clienteId = cliente.id;
      } else {
        clienteId = await db.add("clientes", {
          ...cliente,
          criadoEm: new Date(),
        });
      }
      
      await atualizarClientes();
      await atualizarEstatisticasDashboard();
      
      return clienteId;
    } catch (error) {
      console.error("Failed to save cliente:", error);
      setErro("Falha ao salvar cliente.");
      throw error;
    }
  };

  const salvarProduto = async (produto: Omit<Produto, "id" | "criadoEm"> & { id?: number }): Promise<number> => {
    try {
      let produtoId: number;
      
      if (produto.id) {
        await db.update("produtos", produto as Produto);
        produtoId = produto.id;
      } else {
        produtoId = await db.add("produtos", {
          ...produto,
          criadoEm: new Date(),
        });
      }
      
      await atualizarProdutos();
      await atualizarEstatisticasDashboard();
      
      return produtoId;
    } catch (error) {
      console.error("Failed to save produto:", error);
      setErro("Falha ao salvar produto.");
      throw error;
    }
  };

  const salvarOrcamento = async (orcamento: Omit<Orcamento, "id" | "criadoEm"> & { id?: number, itens: Array<Omit<ItemOrcamento, "id" | "orcamentoId">> }): Promise<number> => {
    try {
      const { itens, ...orcamentoData } = orcamento;
      
      // Need to create this as a proper object with criadoEm and empty itens included
      const orcamentoToSave: Omit<Orcamento, "id"> & { id?: number } = {
        ...orcamentoData,
        criadoEm: new Date(),
        itens: [],
      };
      
      const orcamentoId = await db.saveOrcamentoWithItens(
        orcamentoToSave, 
        itens.map(item => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          desconto: item.desconto,
          descricao: item.descricao,
          subtotal: item.subtotal,
        }))
      );
      
      await atualizarOrcamentos();
      await atualizarEstatisticasDashboard();
      
      return orcamentoId;
    } catch (error) {
      console.error("Failed to save orcamento:", error);
      setErro("Falha ao salvar orçamento.");
      throw error;
    }
  };

  const salvarConfiguracaoEmpresa = async (configuracao: Partial<ConfiguracaoEmpresa>): Promise<void> => {
    try {
      if (configuracaoEmpresa) {
        await db.update("configuracaoEmpresa", {
          ...configuracaoEmpresa,
          ...configuracao,
        });
      } else {
        await db.add("configuracaoEmpresa", {
          ...configuracao,
          criadoEm: new Date(),
        });
      }
      
      await atualizarConfiguracaoEmpresa();
    } catch (error) {
      console.error("Failed to save configuracao empresa:", error);
      setErro("Falha ao salvar configurações da empresa.");
      throw error;
    }
  };

  const excluirCliente = async (id: number): Promise<void> => {
    try {
      await db.remove("clientes", id);
      await atualizarClientes();
      await atualizarEstatisticasDashboard();
    } catch (error) {
      console.error("Failed to delete cliente:", error);
      setErro("Falha ao excluir cliente.");
      throw error;
    }
  };

  const excluirProduto = async (id: number): Promise<void> => {
    try {
      await db.remove("produtos", id);
      await atualizarProdutos();
      await atualizarEstatisticasDashboard();
    } catch (error) {
      console.error("Failed to delete produto:", error);
      setErro("Falha ao excluir produto.");
      throw error;
    }
  };

  const excluirOrcamento = async (id: number): Promise<void> => {
    try {
      await db.remove("orcamentos", id);
      await atualizarOrcamentos();
      await atualizarEstatisticasDashboard();
    } catch (error) {
      console.error("Failed to delete orcamento:", error);
      setErro("Falha ao excluir orçamento.");
      throw error;
    }
  };

  const getOrcamentoComItens = async (id: number): Promise<Orcamento | null> => {
    try {
      return await db.getOrcamentoComItens(id);
    } catch (error) {
      console.error("Failed to get orcamento with itens:", error);
      setErro("Falha ao carregar orçamento com itens.");
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        clientes,
        produtos,
        orcamentos,
        configuracaoEmpresa,
        estatisticasDashboard,
        carregando,
        erro,
        atualizarClientes,
        atualizarProdutos,
        atualizarOrcamentos,
        atualizarEstatisticasDashboard,
        salvarCliente,
        salvarProduto,
        salvarOrcamento,
        salvarConfiguracaoEmpresa,
        excluirCliente,
        excluirProduto,
        excluirOrcamento,
        getOrcamentoComItens,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};