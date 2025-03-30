// Utilitários para trabalhar com IndexedDB

// Inicializa o banco de dados com todos os stores necessários
export const initializeDatabase = async (): Promise<IDBDatabase> => {
  // Incremente a versão para forçar uma atualização do esquema
  const DB_VERSION = 2;
  
  return new Promise((resolve, reject) => {
    // Abrir o banco de dados diretamente, sem tentar excluí-lo primeiro
    proceedWithCreation();
    
    function proceedWithCreation() {
      const openRequest = window.indexedDB.open("OrcaFacilDB", DB_VERSION);
      
      openRequest.onerror = (event) => {
        console.error("Erro ao abrir o banco de dados:", event);
        reject(new Error("Erro ao abrir o banco de dados"));
      };
      
      openRequest.onsuccess = (event) => {
        console.log("Banco de dados aberto com sucesso na versão:", DB_VERSION);
        
        // Verificar se todos os object stores estão presentes
        const db = (event.target as IDBOpenDBRequest).result;
        const storeNames = Array.from(db.objectStoreNames);
        console.log("Object stores disponíveis:", storeNames);
        
        resolve(db);
      };
      
      // Este evento é disparado apenas quando:
      // 1. O banco de dados não existe e está sendo criado
      // 2. A versão do banco de dados foi alterada
      openRequest.onupgradeneeded = (event) => {
        console.log("Evento onupgradeneeded disparado. Criando/atualizando estrutura do banco de dados...");
        
        const db = (event.target as IDBOpenDBRequest).result;
        
        try {
          // Criar apenas os object stores que não existem
          if (!db.objectStoreNames.contains("products")) {
            const productsStore = db.createObjectStore("products", { keyPath: "id", autoIncrement: true });
            productsStore.createIndex("by-name", "name", { unique: false });
            productsStore.createIndex("by-type", "type", { unique: false });
            console.log("ObjectStore 'products' criado");
          }
          
          if (!db.objectStoreNames.contains("clients")) {
            const clientsStore = db.createObjectStore("clients", { keyPath: "id", autoIncrement: true });
            clientsStore.createIndex("by-name", "name", { unique: false });
            console.log("ObjectStore 'clients' criado");
          }
          
          if (!db.objectStoreNames.contains("quotes")) {
            const quotesStore = db.createObjectStore("quotes", { keyPath: "id", autoIncrement: true });
            quotesStore.createIndex("by-client", "clientId", { unique: false });
            quotesStore.createIndex("by-status", "status", { unique: false });
            quotesStore.createIndex("by-date", "createdAt", { unique: false });
            console.log("ObjectStore 'quotes' criado");
          }
          
          if (!db.objectStoreNames.contains("quoteItems")) {
            const quoteItemsStore = db.createObjectStore("quoteItems", { keyPath: "id", autoIncrement: true });
            quoteItemsStore.createIndex("by-quote", "quoteId", { unique: false });
            console.log("ObjectStore 'quoteItems' criado");
          }
          
          if (!db.objectStoreNames.contains("companySettings")) {
            const settingsStore = db.createObjectStore("companySettings", { keyPath: "id", autoIncrement: true });
            console.log("ObjectStore 'companySettings' criado");
          }
          
          console.log("Todos os object stores foram verificados/criados com sucesso!");
        } catch (error) {
          console.error("Erro ao criar object stores:", error);
        }
      };
    }
  });
};

// Garantir que a inicialização seja chamada apenas uma vez
let dbPromise: Promise<IDBDatabase> | null = null;

export const getDatabase = (): Promise<IDBDatabase> => {
  if (!dbPromise) {
    dbPromise = initializeDatabase();
  }
  return dbPromise;
};

// Função para verificar se um object store existe e recriar o banco se necessário
const checkAndReinitIfNeeded = async (storeName: string): Promise<IDBDatabase> => {
  const db = await getDatabase();
  
  // Verificar se o object store existe
  if (!Array.from(db.objectStoreNames).includes(storeName)) {
    console.error(`O object store '${storeName}' não existe! Reinicializando o banco de dados...`);
    // Forçar a reinicialização do banco de dados
    dbPromise = null;
    return getDatabase();
  }
  
  return db;
};

// Função genérica para salvar um objeto em um objectStore
export const saveObject = async <T extends { id?: number }>(
  storeName: string,
  object: T
): Promise<number> => {
  const db = await checkAndReinitIfNeeded(storeName);
  
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      
      const now = new Date();
      const objectToSave = {
        ...object,
        createdAt: object.id ? undefined : now
      };
      
      let request;
      if (object.id) {
        request = store.put(objectToSave);
      } else {
        request = store.add(objectToSave);
      }
      
      request.onsuccess = () => {
        resolve(request.result as number);
      };
      
      request.onerror = (event) => {
        console.error(`Erro ao salvar no objectStore '${storeName}':`, event);
        reject(new Error(`Erro ao salvar no objectStore '${storeName}'`));
      };
      
      transaction.onerror = (event) => {
        console.error(`Erro na transação do objectStore '${storeName}':`, event);
        reject(new Error(`Erro na transação do objectStore '${storeName}'`));
      };
    } catch (error) {
      console.error(`Erro ao tentar salvar em '${storeName}':`, error);
      reject(error);
    }
  });
};

// Função genérica para buscar todos os objetos de um objectStore
export const getAllObjects = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await checkAndReinitIfNeeded(storeName);
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result as T[]);
        };
        
        request.onerror = (event) => {
          console.error(`Erro ao buscar do objectStore '${storeName}':`, event);
          reject(new Error(`Erro ao buscar do objectStore '${storeName}'`));
        };
      } catch (error) {
        console.error(`Erro ao tentar buscar todos os objetos em '${storeName}':`, error);
        resolve([]); // Retornar lista vazia em caso de erro para evitar falhas na interface
      }
    });
  } catch (error) {
    console.error(`Erro crítico ao buscar do objectStore '${storeName}':`, error);
    return []; // Garantir que sempre retornamos uma lista, mesmo em caso de erro grave
  }
};

// Função genérica para buscar um objeto pelo id
export const getObjectById = async <T>(storeName: string, id: number): Promise<T | null> => {
  try {
    const db = await checkAndReinitIfNeeded(storeName);
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        
        request.onsuccess = () => {
          resolve(request.result as T || null);
        };
        
        request.onerror = (event) => {
          console.error(`Erro ao buscar objeto com id ${id} do objectStore '${storeName}':`, event);
          reject(new Error(`Erro ao buscar objeto com id ${id} do objectStore '${storeName}'`));
        };
      } catch (error) {
        console.error(`Erro ao tentar buscar objeto com id ${id} em '${storeName}':`, error);
        resolve(null); // Retornar null em caso de erro para evitar falhas na interface
      }
    });
  } catch (error) {
    console.error(`Erro crítico ao buscar objeto do objectStore '${storeName}':`, error);
    return null; // Garantir que sempre retornamos um valor, mesmo em caso de erro grave
  }
};

// Função genérica para excluir um objeto pelo id
export const deleteObjectById = async (storeName: string, id: number): Promise<void> => {
  const db = await checkAndReinitIfNeeded(storeName);
  
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error(`Erro ao excluir objeto com id ${id} do objectStore '${storeName}':`, event);
        reject(new Error(`Erro ao excluir objeto com id ${id} do objectStore '${storeName}'`));
      };
    } catch (error) {
      console.error(`Erro ao tentar excluir objeto com id ${id} em '${storeName}':`, error);
      reject(error);
    }
  });
};

// Função para buscar objetos por um índice específico
export const getObjectsByIndex = async <T>(
  storeName: string, 
  indexName: string, 
  value: any
): Promise<T[]> => {
  try {
    const db = await checkAndReinitIfNeeded(storeName);
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        
        request.onsuccess = () => {
          resolve(request.result as T[]);
        };
        
        request.onerror = (event) => {
          console.error(`Erro ao buscar objetos pelo índice '${indexName}' no objectStore '${storeName}':`, event);
          reject(new Error(`Erro ao buscar objetos pelo índice '${indexName}' no objectStore '${storeName}'`));
        };
      } catch (error) {
        console.error(`Erro ao tentar buscar objetos pelo índice '${indexName}' em '${storeName}':`, error);
        resolve([]); // Retornar lista vazia em caso de erro para evitar falhas na interface
      }
    });
  } catch (error) {
    console.error(`Erro crítico ao buscar objetos pelo índice do objectStore '${storeName}':`, error);
    return []; // Garantir que sempre retornamos uma lista, mesmo em caso de erro grave
  }
};