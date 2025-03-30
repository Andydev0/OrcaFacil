import React, { createContext, useContext, useState, useEffect } from "react";
import { Client, Product, Quote, QuoteItem, CompanySettings, DashboardStats } from "@/types";
import * as db from "@/lib/db";

interface AppContextType {
  clients: Client[];
  products: Product[];
  quotes: Quote[];
  companySettings: CompanySettings | null;
  dashboardStats: DashboardStats | null;
  loading: boolean;
  refreshClients: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshQuotes: () => Promise<void>;
  refreshDashboardStats: () => Promise<void>;
  saveClient: (client: Omit<Client, "id" | "createdAt"> & { id?: number }) => Promise<number>;
  saveProduct: (product: Omit<Product, "id" | "createdAt"> & { id?: number }) => Promise<number>;
  saveQuote: (quote: Omit<Quote, "id" | "createdAt"> & { id?: number, items: Array<Omit<QuoteItem, "id" | "quoteId">> }) => Promise<number>;
  saveCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  deleteQuote: (id: number) => Promise<void>;
  getQuoteWithItems: (id: number) => Promise<Quote | null>;
  error: string | null;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database and load initial data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await db.initDB();
        await Promise.all([
          refreshClients(),
          refreshProducts(),
          refreshQuotes(),
          refreshCompanySettings(),
          refreshDashboardStats(),
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setError("Falha ao inicializar a aplicação. Por favor, tente novamente.");
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const refreshClients = async () => {
    try {
      const clients = await db.getAll<Client>("clients");
      setClients(clients);
    } catch (error) {
      console.error("Failed to load clients:", error);
      setError("Falha ao carregar clientes.");
    }
  };

  const refreshProducts = async () => {
    try {
      const products = await db.getAll<Product>("products");
      setProducts(products);
    } catch (error) {
      console.error("Failed to load products:", error);
      setError("Falha ao carregar produtos e serviços.");
    }
  };

  const refreshQuotes = async () => {
    try {
      const quotes = await db.getAll<Quote>("quotes");
      setQuotes(quotes);
    } catch (error) {
      console.error("Failed to load quotes:", error);
      setError("Falha ao carregar orçamentos.");
    }
  };

  const refreshDashboardStats = async () => {
    try {
      const stats = await db.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      setError("Falha ao carregar estatísticas do dashboard.");
    }
  };

  const refreshCompanySettings = async () => {
    try {
      const settings = await db.getCompanySettings();
      setCompanySettings(settings);
    } catch (error) {
      console.error("Failed to load company settings:", error);
      setError("Falha ao carregar configurações da empresa.");
    }
  };

  const saveClient = async (client: Omit<Client, "id" | "createdAt"> & { id?: number }): Promise<number> => {
    try {
      let clientId: number;
      
      if (client.id) {
        await db.update("clients", client as Client);
        clientId = client.id;
      } else {
        clientId = await db.add("clients", {
          ...client,
          createdAt: new Date(),
        });
      }
      
      await refreshClients();
      await refreshDashboardStats();
      
      return clientId;
    } catch (error) {
      console.error("Failed to save client:", error);
      setError("Falha ao salvar cliente.");
      throw error;
    }
  };

  const saveProduct = async (product: Omit<Product, "id" | "createdAt"> & { id?: number }): Promise<number> => {
    try {
      let productId: number;
      
      if (product.id) {
        await db.update("products", product as Product);
        productId = product.id;
      } else {
        productId = await db.add("products", {
          ...product,
          createdAt: new Date(),
        });
      }
      
      await refreshProducts();
      await refreshDashboardStats();
      
      return productId;
    } catch (error) {
      console.error("Failed to save product:", error);
      setError("Falha ao salvar produto.");
      throw error;
    }
  };

  const saveQuote = async (quote: Omit<Quote, "id" | "createdAt"> & { id?: number, items: Array<Omit<QuoteItem, "id" | "quoteId">> }): Promise<number> => {
    try {
      const { items, ...quoteData } = quote;
      
      // Need to create this as a proper object with createdAt and empty items included
      const quoteToSave: Omit<Quote, "id"> & { id?: number } = {
        ...quoteData,
        createdAt: new Date(),
        items: [],
      };
      
      const quoteId = await db.saveQuoteWithItems(
        quoteToSave, 
        items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          description: item.description,
          subtotal: item.subtotal,
        }))
      );
      
      await refreshQuotes();
      await refreshDashboardStats();
      
      return quoteId;
    } catch (error) {
      console.error("Failed to save quote:", error);
      setError("Falha ao salvar orçamento.");
      throw error;
    }
  };

  const saveCompanySettings = async (settings: Partial<CompanySettings>): Promise<void> => {
    try {
      if (companySettings) {
        await db.update("companySettings", {
          ...companySettings,
          ...settings,
        });
      } else {
        await db.add("companySettings", {
          ...settings,
          createdAt: new Date(),
        });
      }
      
      await refreshCompanySettings();
    } catch (error) {
      console.error("Failed to save company settings:", error);
      setError("Falha ao salvar configurações da empresa.");
      throw error;
    }
  };

  const deleteClient = async (id: number): Promise<void> => {
    try {
      await db.remove("clients", id);
      await refreshClients();
      await refreshDashboardStats();
    } catch (error) {
      console.error("Failed to delete client:", error);
      setError("Falha ao excluir cliente.");
      throw error;
    }
  };

  const deleteProduct = async (id: number): Promise<void> => {
    try {
      await db.remove("products", id);
      await refreshProducts();
      await refreshDashboardStats();
    } catch (error) {
      console.error("Failed to delete product:", error);
      setError("Falha ao excluir produto.");
      throw error;
    }
  };

  const deleteQuote = async (id: number): Promise<void> => {
    try {
      await db.remove("quotes", id);
      await refreshQuotes();
      await refreshDashboardStats();
    } catch (error) {
      console.error("Failed to delete quote:", error);
      setError("Falha ao excluir orçamento.");
      throw error;
    }
  };

  const getQuoteWithItems = async (id: number): Promise<Quote | null> => {
    try {
      return await db.getQuoteWithItems(id);
    } catch (error) {
      console.error("Failed to get quote with items:", error);
      setError("Falha ao carregar orçamento com itens.");
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        clients,
        products,
        quotes,
        companySettings,
        dashboardStats,
        loading,
        error,
        refreshClients,
        refreshProducts,
        refreshQuotes,
        refreshDashboardStats,
        saveClient,
        saveProduct,
        saveQuote,
        saveCompanySettings,
        deleteClient,
        deleteProduct,
        deleteQuote,
        getQuoteWithItems,
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