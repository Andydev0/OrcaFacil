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
import AuthPage from "@/pages/auth-page";
import { initializeDatabase } from "@/lib/idb-utils";
import { ProtectedRoute } from "@/lib/protected-route";

// App component with added error boundary
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
          path="/quotes" 
          component={() => (
            <SidebarLayout>
              <QuotesPage />
            </SidebarLayout>
          )} 
        />
        <ProtectedRoute 
          path="/quotes/create" 
          component={() => (
            <SidebarLayout>
              <CreateQuotePage />
            </SidebarLayout>
          )} 
        />
        <Route 
          path="/quotes/:id" 
          component={(params: any) => (
            <SidebarLayout>
              <CreateQuotePage params={params} />
            </SidebarLayout>
          )} 
        />
        <ProtectedRoute 
          path="/products" 
          component={() => (
            <SidebarLayout>
              <ProductsPage />
            </SidebarLayout>
          )} 
        />
        <ProtectedRoute 
          path="/services" 
          component={() => (
            <SidebarLayout>
              <ServicesPage />
            </SidebarLayout>
          )} 
        />
        <ProtectedRoute 
          path="/clients" 
          component={() => (
            <SidebarLayout>
              <ClientsPage />
            </SidebarLayout>
          )} 
        />
        <ProtectedRoute 
          path="/settings" 
          component={() => (
            <SidebarLayout>
              <SettingsPage />
            </SidebarLayout>
          )} 
        />
          
        {/* Rota de fallback */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}
