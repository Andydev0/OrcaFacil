import React from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/use-notifications';
import { PlusCircle } from 'lucide-react';

export const NotificationDemo: React.FC = () => {
  const { addNotification } = useNotifications();

  const addExampleNotifications = () => {
    // Adicionar uma notificação de orçamento aprovado
    addNotification({
      title: 'Orçamento #123 aprovado',
      message: 'O orçamento "Website Corporativo" foi aprovado pelo cliente.',
      type: 'success',
      link: '/orcamentos/criar?id=123'
    });

    // Adicionar uma notificação de orçamento expirando
    setTimeout(() => {
      addNotification({
        title: 'Orçamento #456 expira em breve',
        message: 'O orçamento "Aplicativo Mobile" expira em 3 dias.',
        type: 'warning',
        link: '/orcamentos/criar?id=456'
      });
    }, 1000);

    // Adicionar uma notificação de novo cliente
    setTimeout(() => {
      addNotification({
        title: 'Novo cliente cadastrado',
        message: 'O cliente "Empresa ABC" foi cadastrado com sucesso.',
        type: 'info',
        link: '/clientes'
      });
    }, 2000);
  };

  return (
    <Button 
      onClick={addExampleNotifications}
      variant="outline"
      className="flex items-center gap-2"
    >
      <PlusCircle size={16} />
      <span>Adicionar Notificações de Exemplo</span>
    </Button>
  );
};
