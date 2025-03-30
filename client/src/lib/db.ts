import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Client, Product, Quote, QuoteItem, CompanySettings } from '@/types';

interface BudgetAppDB extends DBSchema {
  clients: {
    key: number;
    value: Client;
    indexes: { 'by-name': string };
  };
  products: {
    key: number;
    value: Product;
    indexes: { 'by-name': string; 'by-type': string };
  };
  quotes: {
    key: number;
    value: Quote;
    indexes: { 'by-client': number; 'by-status': string; 'by-date': Date };
  };
  quoteItems: {
    key: number;
    value: QuoteItem;
    indexes: { 'by-quote': number };
  };
  companySettings: {
    key: number;
    value: CompanySettings;
  };
}

let db: IDBPDatabase<BudgetAppDB>;

export const initDB = async (): Promise<IDBPDatabase<BudgetAppDB>> => {
  if (db) return db;

  db = await openDB<BudgetAppDB>('budget-app-db', 1, {
    upgrade(db) {
      // Create clients store
      const clientStore = db.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
      clientStore.createIndex('by-name', 'name');

      // Create products store
      const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
      productStore.createIndex('by-name', 'name');
      productStore.createIndex('by-type', 'type');

      // Create quotes store
      const quoteStore = db.createObjectStore('quotes', { keyPath: 'id', autoIncrement: true });
      quoteStore.createIndex('by-client', 'clientId');
      quoteStore.createIndex('by-status', 'status');
      quoteStore.createIndex('by-date', 'createdAt');

      // Create quote items store
      const quoteItemStore = db.createObjectStore('quoteItems', { keyPath: 'id', autoIncrement: true });
      quoteItemStore.createIndex('by-quote', 'quoteId');

      // Create company settings store
      db.createObjectStore('companySettings', { keyPath: 'id', autoIncrement: true });
    },
  });

  return db;
};

// Generic CRUD operations
export const getAll = async <T>(storeName: keyof BudgetAppDB): Promise<T[]> => {
  const db = await initDB();
  return db.getAll(storeName);
};

export const get = async <T>(storeName: keyof BudgetAppDB, id: number): Promise<T | undefined> => {
  const db = await initDB();
  return db.get(storeName, id);
};

export const add = async <T>(storeName: keyof BudgetAppDB, item: Omit<T, 'id'>): Promise<number> => {
  const db = await initDB();
  return db.add(storeName, item as any);
};

export const update = async <T extends { id: number }>(storeName: keyof BudgetAppDB, item: T): Promise<number> => {
  const db = await initDB();
  await db.put(storeName, item);
  return item.id;
};

export const remove = async (storeName: keyof BudgetAppDB, id: number): Promise<void> => {
  const db = await initDB();
  await db.delete(storeName, id);
};

// Specific operations for quotes with related items
export const getQuoteWithItems = async (quoteId: number): Promise<Quote | null> => {
  const db = await initDB();
  const quote = await db.get('quotes', quoteId);
  if (!quote) return null;

  const tx = db.transaction(['quoteItems', 'products', 'clients'], 'readonly');
  const items = await tx.objectStore('quoteItems').index('by-quote').getAll(quoteId);
  
  // Get products for each item
  for (const item of items) {
    item.product = await tx.objectStore('products').get(item.productId);
  }
  
  // Get client
  quote.client = await tx.objectStore('clients').get(quote.clientId);
  quote.items = items;
  
  return quote;
};

export const saveQuoteWithItems = async (quote: Omit<Quote, 'id'> & { id?: number }, items: Omit<QuoteItem, 'id' | 'quoteId'>[]): Promise<number> => {
  const db = await initDB();
  const tx = db.transaction(['quotes', 'quoteItems'], 'readwrite');
  
  let quoteId: number;
  
  if (quote.id) {
    await tx.objectStore('quotes').put(quote);
    quoteId = quote.id;
    
    // Delete existing items for this quote
    const existingItems = await db.getAllKeysFromIndex('quoteItems', 'by-quote', quoteId);
    for (const itemId of existingItems) {
      await tx.objectStore('quoteItems').delete(itemId);
    }
  } else {
    quoteId = await tx.objectStore('quotes').add({
      ...quote,
      createdAt: new Date(),
    });
  }
  
  // Add new items
  for (const item of items) {
    await tx.objectStore('quoteItems').add({
      ...item,
      quoteId
    });
  }
  
  await tx.done;
  return quoteId;
};

// Get company settings or create default
export const getCompanySettings = async (): Promise<CompanySettings> => {
  const db = await initDB();
  const settings = await db.getAll('companySettings');
  
  if (settings.length === 0) {
    // Create default settings
    const defaultSettings: Omit<CompanySettings, 'id' | 'createdAt'> = {
      name: 'Minha Empresa',
      currency: 'BRL',
      defaultTaxSettings: {
        iss: 3,
        pis: 0.65,
        cofins: 3
      }
    };
    
    const id = await db.add('companySettings', {
      ...defaultSettings,
      createdAt: new Date()
    });
    
    return {
      ...defaultSettings,
      id,
      createdAt: new Date()
    };
  }
  
  return settings[0];
};

// Search functions
export const searchClients = async (query: string): Promise<Client[]> => {
  const db = await initDB();
  const clients = await db.getAll('clients');
  if (!query) return clients;
  
  const lowerQuery = query.toLowerCase();
  return clients.filter(client => 
    client.name.toLowerCase().includes(lowerQuery) ||
    (client.document && client.document.includes(query)) ||
    (client.email && client.email.toLowerCase().includes(lowerQuery))
  );
};

export const searchProducts = async (query: string, type?: 'product' | 'service'): Promise<Product[]> => {
  const db = await initDB();
  let products: Product[] = [];
  
  if (type) {
    products = await db.getAllFromIndex('products', 'by-type', type);
  } else {
    products = await db.getAll('products');
  }
  
  if (!query) return products;
  
  const lowerQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    (product.description && product.description.toLowerCase().includes(lowerQuery))
  );
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  const db = await initDB();
  
  // Get quotes
  const allQuotes = await db.getAll('quotes');
  const activeQuotes = allQuotes.filter(q => q.status !== 'rejected' && q.status !== 'draft').length;
  
  // Calculate monthly total
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyQuotes = allQuotes.filter(q => new Date(q.createdAt) >= firstDayOfMonth);
  const monthlyTotal = monthlyQuotes.reduce((sum, quote) => sum + (quote.total || 0), 0);
  
  // Calculate conversion rate
  const totalFinalized = allQuotes.filter(q => q.status === 'approved' || q.status === 'rejected').length;
  const approvedQuotes = allQuotes.filter(q => q.status === 'approved').length;
  const conversionRate = totalFinalized ? (approvedQuotes / totalFinalized) * 100 : 0;
  
  // Get active clients
  const clients = await db.getAll('clients');
  const activeClientIds = new Set(
    allQuotes
      .filter(q => q.status !== 'rejected' && q.status !== 'draft')
      .map(q => q.clientId)
  );
  
  // Get recent quotes with client information
  const sortedQuotes = [...allQuotes].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const recentQuotes = sortedQuotes.slice(0, 5);
  
  for (const quote of recentQuotes) {
    quote.client = clients.find(c => c.id === quote.clientId);
    
    // Get items for this quote
    const items = await db.getAllFromIndex('quoteItems', 'by-quote', quote.id);
    quote.items = items;
  }
  
  // Get top products
  const allItems = await db.getAll('quoteItems');
  const productCounts = new Map<number, number>();
  
  for (const item of allItems) {
    const count = productCounts.get(item.productId) || 0;
    productCounts.set(item.productId, count + 1);
  }
  
  const products = await db.getAll('products');
  const productCountArray = Array.from(productCounts.entries())
    .map(([productId, count]) => {
      const product = products.find(p => p.id === productId);
      return {
        id: productId,
        name: product?.name || 'Produto desconhecido',
        count
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  const maxCount = Math.max(...productCountArray.map(p => p.count));
  
  const topProducts = productCountArray.map(p => ({
    name: p.name,
    count: p.count,
    percentage: (p.count / maxCount) * 100
  }));
  
  // Get top clients
  const clientTotals = new Map<number, { total: number; quotes: number; approved: number }>();
  
  for (const quote of allQuotes) {
    const current = clientTotals.get(quote.clientId) || { total: 0, quotes: 0, approved: 0 };
    clientTotals.set(quote.clientId, {
      total: current.total + (quote.total || 0),
      quotes: current.quotes + 1,
      approved: current.approved + (quote.status === 'approved' ? 1 : 0)
    });
  }
  
  const topClients = Array.from(clientTotals.entries())
    .map(([clientId, stats]) => {
      const client = clients.find(c => c.id === clientId);
      return {
        id: clientId,
        name: client?.name || 'Cliente desconhecido',
        type: 'Empresa',
        total: stats.total,
        conversionRate: stats.quotes ? (stats.approved / stats.quotes) * 100 : 0
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);
  
  return {
    activeQuotes,
    monthlyTotal,
    conversionRate,
    activeClients: activeClientIds.size,
    recentQuotes,
    topProducts,
    topClients
  };
};
