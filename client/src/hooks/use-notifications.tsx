import { useState, useEffect, useCallback } from 'react';
// Implementação simples de UUID v4 para evitar problemas de importação
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
import { Notification } from '@/components/ui/notifications';
import { buscarTodos } from '@/lib/db';
import { Orcamento } from '@/types';

// Função para verificar se um orçamento está prestes a expirar (7 dias)
const isExpiringSoon = (validoAte: Date) => {
  const now = new Date();
  const expirationDate = new Date(validoAte);
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 7;
};

// Função para verificar se um orçamento foi recentemente aprovado (últimas 24 horas)
const isRecentlyApproved = (status: string, criadoEm: Date) => {
  if (status !== 'aprovado') return false;
  
  const now = new Date();
  const creationDate = new Date(criadoEm);
  const diffTime = now.getTime() - creationDate.getTime();
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  return diffHours <= 24;
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar notificações do localStorage
  useEffect(() => {
    const storedNotifications = localStorage.getItem('budgetcraft_notifications');
    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications);
        // Converter strings de data para objetos Date
        const notificationsWithDates = parsedNotifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    }
    setLoading(false);
  }, []);

  // Salvar notificações no localStorage quando mudarem
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('budgetcraft_notifications', JSON.stringify(notifications));
    }
  }, [notifications, loading]);

  // Verificar orçamentos e gerar notificações
  const checkForNewNotifications = useCallback(async () => {
    try {
      // Buscar todos os orçamentos
      const orcamentos = await buscarTodos<Orcamento>('orcamentos');
      
      const newNotifications: Notification[] = [];
      
      // Obter IDs de notificações que já foram vistas
      const viewedNotificationIds = JSON.parse(localStorage.getItem('budgetcraft_viewed_notifications') || '[]');
      
      // Verificar orçamentos prestes a expirar
      orcamentos.forEach(orcamento => {
        // Criar um ID único para esta notificação específica
        const notificationId = `expiring_${orcamento.id}`;
        
        // Verificar se já existe uma notificação para este orçamento
        const existingExpNotification = notifications.find(
          n => n.title.includes(`Orçamento #${orcamento.id}`) && n.message.includes('expira')
        );
        
        // Verificar se esta notificação já foi vista
        const alreadyViewed = viewedNotificationIds.includes(notificationId);
        
        // Apenas mostrar notificações para orçamentos que não estão em rascunho e não foram vistas
        if (orcamento.status !== 'rascunho' && isExpiringSoon(orcamento.validoAte) && !existingExpNotification && !alreadyViewed) {
          newNotifications.push({
            id: uuidv4(),
            title: `Orçamento #${orcamento.id} expira em breve`,
            message: `O orçamento "${orcamento.titulo}" expira em breve.`,
            type: 'warning',
            timestamp: new Date(),
            read: false,
            link: `/orcamentos/${orcamento.id}?modo=visualizar`,
            notificationId: notificationId // Adicionar ID único para rastreamento
          });
        }
        
        // Verificar orçamentos recentemente aprovados
        const approvalNotificationId = `approved_${orcamento.id}`;
        
        // Verificar se já existe uma notificação para este orçamento
        const existingApprovalNotification = notifications.find(
          n => n.title.includes(`Orçamento #${orcamento.id}`) && n.message.includes('aprovado')
        );
        
        // Verificar se esta notificação já foi vista
        const approvalAlreadyViewed = viewedNotificationIds.includes(approvalNotificationId);
        
        // Apenas mostrar notificações para orçamentos que não estão em rascunho e não foram vistas
        if (orcamento.status !== 'rascunho' && isRecentlyApproved(orcamento.status, orcamento.criadoEm) && !existingApprovalNotification && !approvalAlreadyViewed) {
          newNotifications.push({
            id: uuidv4(),
            title: `Orçamento #${orcamento.id} aprovado`,
            message: `O orçamento "${orcamento.titulo}" foi aprovado!`,
            type: 'success',
            timestamp: new Date(),
            read: false,
            link: `/orcamentos/${orcamento.id}?modo=visualizar`,
            notificationId: approvalNotificationId // Adicionar ID único para rastreamento
          });
        }
      });
      
      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao verificar notificações:', error);
    }
  }, [notifications]);

  // Verificar notificações a cada 5 minutos
  useEffect(() => {
    if (!loading) {
      checkForNewNotifications();
      
      const interval = setInterval(() => {
        checkForNewNotifications();
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [checkForNewNotifications, loading]);

  // Adicionar uma notificação manualmente
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Marcar uma notificação como lida
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  }, []);

  // Marcar todas as notificações como lidas
  const markAllAsRead = useCallback(() => {
    // Limpar todas as notificações ao invés de apenas marcá-las como lidas
    setNotifications([]);
    // Salvar no localStorage imediatamente
    localStorage.setItem('budgetcraft_notifications', JSON.stringify([]));
  }, []);

  // Remover uma notificação
  const removeNotification = useCallback((id: string) => {
    console.log('Removendo notificação:', id);
    setNotifications(prev => {
      const updated = prev.filter(notification => notification.id !== id);
      // Salvar no localStorage imediatamente
      localStorage.setItem('budgetcraft_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Limpar todas as notificações
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Marcar uma notificação como vista
  const markAsViewed = useCallback((notificationId: string) => {
    const viewedNotificationIds = JSON.parse(localStorage.getItem('budgetcraft_viewed_notifications') || '[]');
    viewedNotificationIds.push(notificationId);
    localStorage.setItem('budgetcraft_viewed_notifications', JSON.stringify(viewedNotificationIds));
  }, []);

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    loading,
    markAsViewed
  };
};
