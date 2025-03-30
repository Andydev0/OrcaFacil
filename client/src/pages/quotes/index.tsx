import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus as PlusIcon } from "lucide-react";
import { Link } from "wouter";

// Versão temporária simplificada da página de orçamentos sem dependência do contexto
const QuotesPage: React.FC = () => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Orçamentos</h1>
          <p className="text-secondary-500">Gerencie todos os seus orçamentos</p>
        </div>
        <Link href="/quotes/create">
          <Button className="flex items-center gap-2">
            <PlusIcon size={16} />
            Novo Orçamento
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Orçamentos</CardTitle>
          <CardDescription>
            Esta é uma versão simplificada da tela de orçamentos, criada temporariamente para resolver problemas de contexto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-secondary-500 mb-4">Estamos trabalhando para implementar a funcionalidade completa.</p>
            <p>A versão final permitirá gerenciar todos os seus orçamentos.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default QuotesPage;