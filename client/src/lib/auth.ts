// Tipos de dados para autenticação
export interface User {
  id: number;
  name: string;
  email: string;
  password: string; // Em uma aplicação real, nunca armazene senhas em texto simples
  createdAt: Date;
}

// Interface para o registro de usuário
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Interface para login
export interface LoginData {
  email: string;
  password: string;
}

// Chave para armazenar usuários no localStorage
const USERS_STORAGE_KEY = 'budget_app_users';
const CURRENT_USER_KEY = 'budget_app_current_user';

// Função para obter todos os usuários
export const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  if (!usersJson) return [];
  
  try {
    return JSON.parse(usersJson);
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    return [];
  }
};

// Função para salvar a lista de usuários
const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Função para registrar um novo usuário
export const registerUser = (data: RegisterData): User | null => {
  // Validar os dados
  if (data.password !== data.confirmPassword) {
    throw new Error('As senhas não coincidem');
  }
  
  const users = getUsers();
  
  // Verificar se já existe um usuário com o mesmo email
  if (users.some(user => user.email === data.email)) {
    throw new Error('Este email já está em uso');
  }
  
  // Criar o novo usuário
  const newUser: User = {
    id: Date.now(), // Usar timestamp como ID único
    name: data.name,
    email: data.email,
    password: data.password, // Em uma aplicação real, deveria estar usando hash
    createdAt: new Date()
  };
  
  // Adicionar à lista de usuários
  users.push(newUser);
  saveUsers(users);
  
  // Retornar o usuário criado (sem a senha)
  const { password, ...userWithoutPassword } = newUser;
  return newUser;
};

// Função para fazer login
export const loginUser = (data: LoginData): User | null => {
  const users = getUsers();
  
  // Encontrar usuário com email e senha correspondentes
  const user = users.find(u => u.email === data.email && u.password === data.password);
  
  if (!user) {
    throw new Error('Email ou senha incorretos');
  }
  
  // Armazenar usuário atual no localStorage (em uma aplicação real, use tokens)
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  
  return user;
};

// Função para obter o usuário atual
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Função para fazer logout
export const logoutUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};