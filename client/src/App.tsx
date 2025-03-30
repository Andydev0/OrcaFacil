import { Switch, Route } from "wouter";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import SidebarLayout from "@/components/layouts/SidebarLayout";
import QuotesPage from "@/pages/quotes";
import CreateQuotePage from "@/pages/quotes/create";
import ProductsPage from "@/pages/products";
import ServicesPage from "@/pages/services";
import ClientsPage from "@/pages/clients";
import SettingsPage from "@/pages/settings";
import PerfilPage from "@/pages/configuracoes/perfil";
import SegurancaPage from "@/pages/configuracoes/seguranca";
import AuthPage from "@/pages/auth-page";
import { initializeDatabase } from "@/lib/idb-utils";
import { ProtectedRoute } from "@/lib/protected-route";

export default function App() {
  // Inicializa o banco de dados quando o aplicativo é carregado
  useEffect(() => {
    const initDB = async () => {
      try {
        const db = await initializeDatabase();
        console.log("Banco de dados inicializado com sucesso:", db);
      } catch (error) {
        console.error("Erro ao inicializar o banco de dados:", error);
      }
    };
    
    initDB();
  }, []);

  return (
    <div className="app-container">
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/login" component={AuthPage} />
          
        {/* Rotas protegidas dentro do layout com sidebar */}
        <ProtectedRoute 
          path="/" 
          component={() => (
            <SidebarLayout>
              <Dashboard />
            </SidebarLayout>
          )} 
        />
        <ProtectedRoute 
          path="/orcamentos" 
          component={() => (
            <SidebarLayout>
              <QuotesPage />
            </SidebarLayout>
          )} 
        />
        <ProtectedRoute 
          path="/orcamentos/criar" 
          component={() => (
            <SidebarLayout>
              <CreateQuotePage />
            </SidebarLayout>
          )} 
        />
        <Route 
          path="/orcamentos/:id" 
        >
          {params => (
            <SidebarLayout>
              <CreateQuotePage params={params} />
            </SidebarLayout>
          )}
        </Route>
        <ProtectedRoute 
          path="/produtos" 
          component={() => (
            <SidebarLayout>
              <ProductsPage />
            </SidebarLayout>
          )} 
        />
        <ProtectedRoute 
          path="/servicos" 
          component={() => (
            <SidebarLayout>
              <ServicesPage />
            </SidebarLayout>
          )} 
        />
        <ProtectedRoute 
          path="/clientes" 
          component={() => (
            <SidebarLayout>
              <ClientsPage />
            </SidebarLayout>
          )} 
        />
        <ProtectedRoute 
          path="/configuracoes" 
          component={() => (
            <SidebarLayout>
              <SettingsPage />
            </SidebarLayout>
          )} 
        />
        <ProtectedRoute 
          path="/configuracoes/perfil" 
          component={() => (
            <SidebarLayout>
              <PerfilPage />
            </SidebarLayout>
          )} 
        />
        <ProtectedRoute 
          path="/configuracoes/seguranca" 
          component={() => (
            <SidebarLayout>
              <SegurancaPage />
            </SidebarLayout>
          )} 
        />
          
        {/* Rota de fallback */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}
