import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/auth";

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Carregar usuário atual do localStorage ao iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login
  const login = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulando autenticação com localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: User) => 
        u.email === data.email && u.password === data.password
      );
      
      if (!foundUser) {
        throw new Error("Credenciais inválidas");
      }
      
      // Salvar usuário autenticado no localStorage
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      setUser(foundUser);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao fazer login"));
      toast({
        title: "Erro ao fazer login",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('currentUser');
      setUser(null);
      toast({
        title: "Logout realizado com sucesso",
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao fazer logout"));
      toast({
        title: "Erro ao fazer logout",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Registro
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validações básicas
      if (data.password !== data.confirmPassword) {
        throw new Error("As senhas não coincidem");
      }
      
      if (data.password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }
      
      // Verificar se o usuário já existe
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.some((u: User) => u.email === data.email);
      
      if (userExists) {
        throw new Error("Este e-mail já está cadastrado");
      }
      
      // Criar novo usuário
      const newUser: User = {
        id: Date.now(),
        name: data.name,
        email: data.email,
        password: data.password,
        createdAt: new Date()
      };
      
      // Salvar no "banco de dados"
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Fazer login com o novo usuário
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setUser(newUser);
      
      toast({
        title: "Registro realizado com sucesso",
        description: "Bem-vindo ao sistema!",
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erro ao registrar usuário"));
      toast({
        title: "Erro ao registrar",
        description: err instanceof Error ? err.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}