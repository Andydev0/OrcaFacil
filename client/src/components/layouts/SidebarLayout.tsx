import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import {
  DashboardIcon,
  FileTextIcon,
  ShoppingBagIcon,
  ToolsIcon,
  UserIcon,
  SettingsIcon,
  MenuIcon,
  CloseIcon,
  NotificationIcon,
  QuestionIcon,
} from "@/components/ui/icons";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Search, Bell, HelpCircle, ChevronRight } from "lucide-react";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const { user, logout } = useAuth();
  
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    // Close sidebar on location change on mobile
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  const handleLogout = () => {
    logout();
    setLocation('/auth');
  };

  const navItems = [
    { href: "/", icon: <DashboardIcon className="mr-3" />, title: "Dashboard" },
    { href: "/quotes", icon: <FileTextIcon className="mr-3" />, title: "Orçamentos" },
    { href: "/products", icon: <ShoppingBagIcon className="mr-3" />, title: "Produtos" },
    { href: "/services", icon: <ToolsIcon className="mr-3" />, title: "Serviços" },
    { href: "/clients", icon: <UserIcon className="mr-3" />, title: "Clientes" },
    { href: "/settings", icon: <SettingsIcon className="mr-3" />, title: "Configurações" },
  ];

  const pageTitle = navItems.find(item => item.href === location)?.title || "Dashboard";

  const userInitials = user?.name ? getInitials(user.name) : "??";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:transform-none lg:relative`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <FileTextIcon size={20} />
              </div>
              <h1 className="text-xl font-bold text-gray-800">BudgetCraft</h1>
            </div>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <CloseIcon size={20} />
              </Button>
            )}
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
            
            <div className="mt-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                Recursos
              </h2>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
                    <HelpCircle className="mr-3 h-5 w-5" />
                    <span className="font-medium">Ajuda & Suporte</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                  <Avatar className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{user?.name || "Usuário"}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || "usuario@exemplo.com"}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <div className="flex items-center cursor-pointer w-full">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-4 text-gray-500 hover:text-gray-700"
                >
                  <MenuIcon size={20} />
                </Button>
              )}
              <h2 className="text-xl font-bold text-gray-800">{pageTitle}</h2>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-gray-50 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300"
              >
                <Bell size={18} />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-gray-50 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300"
              >
                <HelpCircle size={18} />
              </Button>
              <Separator orientation="vertical" className="h-8 mx-1 hidden md:block" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 md:flex items-center hidden"
              >
                <LogOut size={16} className="mr-2" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
