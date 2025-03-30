import React from 'react';
import { Redirect, Route } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ path, component: Component }) => {
  const { user, isLoading } = useAuth();

  // Se estiver carregando, mostrar um indicador
  if (isLoading) {
    return (
      <Route path={path}>
        {(params) => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </Route>
    );
  }

  // Se não estiver autenticado, redirecionar para a página de login
  if (!user) {
    return (
      <Route path={path}>
        {() => <Redirect to="/auth" />}
      </Route>
    );
  }

  // Se estiver autenticado, renderizar o componente
  // Usar render props para passar os parâmetros para o componente
  return (
    <Route path={path}>
      {(params) => <Component {...params} />}
    </Route>
  );
};

export default ProtectedRoute;