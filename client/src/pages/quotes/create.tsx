import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft as ArrowLeftIcon } from "lucide-react";

interface CreateQuotePageProps {
  params?: {
    id: string;
  };
}

// Versão temporária simplificada da página de criar orçamentos sem dependência do contexto
const CreateQuotePage: React.FC<CreateQuotePageProps> = ({ params }) => {
  const isEditing = params && params.id !== undefined;
  const quoteId = isEditing ? params.id : null;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{isEditing ? 'Editar Orçamento' : 'Novo Orçamento'}</h1>
          <p className="text-secondary-500">{isEditing ? `Editando orçamento #${quoteId}` : 'Criar um novo orçamento'}</p>
        </div>
        <Link href="/quotes">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeftIcon size={16} />
            Voltar
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{isEditing ? 'Editar Orçamento' : 'Criar Orçamento'}</CardTitle>
          <CardDescription>
            Esta é uma versão simplificada da tela de criação de orçamentos, criada temporariamente para resolver problemas de contexto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-secondary-500 mb-4">Estamos trabalhando para implementar a funcionalidade completa.</p>
            <p>A versão final permitirá criar orçamentos detalhados com produtos, serviços e informações do cliente.</p>
            {isEditing && (
              <p className="mt-4 font-medium">ID do orçamento: {quoteId}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Link href="/quotes">
            <Button variant="outline" className="mr-2">Cancelar</Button>
          </Link>
          <Button disabled>Salvar Orçamento</Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default CreateQuotePage;