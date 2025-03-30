import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Search,
  Bell,
  User,
  Package,
  Wrench,
  Percent
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationsDropdown } from "@/components/ui/notifications";
import { AccountSettingsDropdown } from "@/components/ui/account-settings";

// Hook personalizado para detectar tamanho da tela
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const { user, logout } = useAuth();
  const userInitials = user?.name ? getInitials(user.name) : "U";
  
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    markAsViewed
  } = useNotifications();
  
  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const navItems = [
    { href: "/", icon: <LayoutDashboard className="mr-3" />, title: "Dashboard" },
    { href: "/orcamentos", icon: <FileText className="mr-3" />, title: "Orçamentos" },
    { href: "/clientes", icon: <Users className="mr-3" />, title: "Clientes" },
    { href: "/produtos", icon: <Package className="mr-3" />, title: "Produtos" },
    { href: "/servicos", icon: <Wrench className="mr-3" />, title: "Serviços" },
    { href: "/configuracoes", icon: <Settings className="mr-3" />, title: "Configurações" }
  ];

  const pageTitle = navItems.find(item => item.href === location)?.title || "Dashboard";

  // Calcular notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar para mobile */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
      </div>

      <div
        className={`fixed inset-y-0 left-0 flex flex-col z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
          <Link href="/" className="flex items-center">
            <img
              className="h-8 w-auto"
              src="/logo.svg"
              alt="OrçaFacil"
            />
            <span className="ml-2 text-xl font-bold text-gray-900">OrçaFacil</span>
          </Link>
          <button
            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar para mobile - conteúdo */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <nav className="flex-1 p-4">
            <div className="mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                Menu Principal
              </h2>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <span
                        className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          location === item.href
                            ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {item.icon}
                        <span className="font-medium">{item.title}</span>
                        {location === item.href && (
                          <ChevronRight className="ml-auto h-4 w-4" />
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Parte inferior do sidebar */}
          <div className="flex-shrink-0 flex flex-col border-t border-gray-200 p-4">
            <Link href="/configuracoes/perfil">
              <div className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                <Avatar className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{user?.name || "Usuário"}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || "usuario@exemplo.com"}</p>
                </div>
              </div>
            </Link>
            
            <div className="mt-3 space-y-1">
              <Link href="/configuracoes/perfil">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <User className="mr-2 h-4 w-4" />
                  Configurações da Conta
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        {/* Logo */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
          <Link href="/" className="flex items-center">
            <img
              className="h-8 w-auto"
              src="/logo.svg"
              alt="OrçaFacil"
            />
            <span className="ml-2 text-xl font-bold text-gray-900">OrçaFacil</span>
          </Link>
        </div>

        <div className="p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
              Menu Principal
            </h2>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span
                      className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        location === item.href
                          ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.title}</span>
                      {location === item.href && (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Parte inferior do sidebar */}
        <div className="flex-shrink-0 flex flex-col border-t border-gray-200 p-4">
          <Link href="/configuracoes/perfil">
            <div className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
              <Avatar className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{user?.name || "Usuário"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || "usuario@exemplo.com"}</p>
              </div>
            </div>
          </Link>
          
          <div className="mt-3 space-y-1">
            <Link href="/configuracoes/perfil">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <User className="mr-2 h-4 w-4" />
                Configurações da Conta
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Barra de navegação superior */}
        <div className="sticky top-0 z-10 flex items-center h-16 flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex justify-between px-4 lg:px-6">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationsDropdown
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onRemoveNotification={removeNotification}
                onClearAllNotifications={clearAllNotifications}
                onMarkAsViewed={markAsViewed}
              />
              <AccountSettingsDropdown onLogout={handleLogout} />
            </div>
          </div>
        </div>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
