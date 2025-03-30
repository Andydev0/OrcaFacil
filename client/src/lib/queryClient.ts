import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Função para simular requisições API usando localStorage
// Esta é uma implementação temporária para prototipação
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Simulação de API para autenticação local
  if (url === '/api/login') {
    const { email, password } = data as { email: string; password: string };
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return new Response(JSON.stringify(user), { status: 200 });
    } else {
      return new Response('Credenciais inválidas', { status: 401 });
    }
  }
  
  if (url === '/api/register') {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userData = data as any;
    
    if (users.some((u: any) => u.email === userData.email)) {
      return new Response('E-mail já cadastrado', { status: 400 });
    }
    
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return new Response(JSON.stringify(newUser), { status: 201 });
  }
  
  if (url === '/api/logout') {
    localStorage.removeItem('currentUser');
    return new Response(null, { status: 200 });
  }
  
  if (url === '/api/user') {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      return new Response(currentUser, { status: 200 });
    } else {
      return new Response('Não autenticado', { status: 401 });
    }
  }
  
  // Para outras requisições API, use o comportamento padrão
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    if (queryKey[0] === '/api/user') {
      // Para requisições de usuário, use nossa simulação local
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        return unauthorizedBehavior === "returnNull" ? null : Promise.reject(new Error('Não autenticado'));
      }
      return JSON.parse(currentUser);
    }
    
    // Para outras requisições, use o comportamento padrão
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
