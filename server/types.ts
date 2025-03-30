// Definição de tipos para o servidor
export interface User {
  id: number;
  username: string;
  password: string;
}

export interface InsertUser {
  username: string;
  password: string;
}

// Exportação fictícia para compatibilidade com o código existente
export const users = {};
