import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Versão temporária simplificada da página de configurações sem dependência do contexto
const SettingsPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Configurações</h1>
        <p className="text-secondary-500">Configurar dados da empresa e preferências do sistema</p>
      </div>
      
      <Tabs defaultValue="company">
        <TabsList className="w-full border-b mb-6">
          <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
          <TabsTrigger value="tax">Impostos Padrão</TabsTrigger>
          <TabsTrigger value="display">Exibição</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Configure as informações da sua empresa que serão exibidas nos orçamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-secondary-500 mb-4">Estamos trabalhando para implementar a funcionalidade completa.</p>
                <p>A versão final permitirá configurar todos os dados da sua empresa.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Impostos Padrão</CardTitle>
              <CardDescription>
                Configure as alíquotas de impostos padrão para serem aplicadas nos orçamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-secondary-500 mb-4">Estamos trabalhando para implementar a funcionalidade completa.</p>
                <p>A versão final permitirá configurar os impostos padrão para seus orçamentos.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Exibição</CardTitle>
              <CardDescription>
                Personalize a aparência dos orçamentos e relatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-secondary-500 mb-4">Estamos trabalhando para implementar a funcionalidade completa.</p>
                <p>A versão final permitirá personalizar a aparência dos orçamentos e relatórios.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <div className="mt-6 flex justify-end">
          <Button disabled>Salvar Configurações</Button>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage;