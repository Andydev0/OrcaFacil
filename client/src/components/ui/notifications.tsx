import React from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertCircle, Clock, FileText, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  link?: string;
  notificationId?: string; // ID único para rastreamento de notificações já vistas
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemoveNotification?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onMarkAsViewed?: (notificationId: string) => void; // Nova prop para marcar como vista
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
  onClearAllNotifications,
  onMarkAsViewed
}) => {
  const [, navigate] = useLocation();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleItemClick = (notification: Notification) => {
    // Se tiver um link, primeiro remover a notificação e depois navegar
    if (notification.link) {
      // Remover a notificação independente do tipo
      if (onRemoveNotification) {
        // Certifique-se de que a notificação seja removida antes de navegar
        onRemoveNotification(notification.id);
        
        // Se tiver um ID de notificação, marcar como vista
        if (notification.notificationId && onMarkAsViewed) {
          onMarkAsViewed(notification.notificationId);
        }
        
        // Pequeno atraso para garantir que a notificação seja removida
        setTimeout(() => {
          // Navegar para o link após remover a notificação
          navigate(notification.link!);
        }, 50);
      } else {
        // Se não houver função para remover, apenas navegar
        navigate(notification.link);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-gray-50 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 relative"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificações</span>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Limpar notificações
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`flex items-start p-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => handleItemClick(notification)}
              >
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  {notification.link ? (
                    <div onClick={() => notification.link && navigate(notification.link)} className="cursor-pointer">
                      <p className="font-medium text-gray-900 truncate">{notification.title}</p>
                      <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-gray-900 truncate">{notification.title}</p>
                      <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}
                      </p>
                    </>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
