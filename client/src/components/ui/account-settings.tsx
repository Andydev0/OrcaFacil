import React, { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  User, 
  Building, 
  Shield, 
  LogOut,
  Edit,
  ChevronDown
} from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { buscarConfiguracaoEmpresa, atualizarConfiguracaoEmpresa } from "@/lib/db";
import { ConfiguracaoEmpresa } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface AccountSettingsDropdownProps {
  onLogout: () => void;
}

export const AccountSettingsDropdown: React.FC<AccountSettingsDropdownProps> = ({
  onLogout
}) => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [companySettings, setCompanySettings] = useState<ConfiguracaoEmpresa | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCompanySettingsClick = async () => {
    try {
      setIsLoading(true);
      const config = await buscarConfiguracaoEmpresa();
      setCompanySettings(config);
      setCompanyName(config.nome || "");
      setIsCompanyDialogOpen(true);
    } catch (error) {
      console.error("Erro ao carregar configurações da empresa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações da empresa.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCompanySettings = async () => {
    if (!companySettings) return;
    
    try {
      setIsLoading(true);
      
      const updatedSettings: ConfiguracaoEmpresa = {
        ...companySettings,
        nome: companyName
      };
      
      await atualizarConfiguracaoEmpresa(updatedSettings);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da empresa foram atualizadas com sucesso.",
        variant: "default"
      });
      
      setIsCompanyDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar configurações da empresa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações da empresa.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const userInitials = user?.name ? getInitials(user.name) : "U";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => navigate("/configuracoes/perfil")}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleCompanySettingsClick}>
            <Building className="mr-2 h-4 w-4" />
            <span>Empresa</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate("/configuracoes/seguranca")}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Segurança</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => navigate("/configuracoes")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Dialog para configurações da empresa */}
      <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações da Empresa</DialogTitle>
            <DialogDescription>
              Atualize as informações da sua empresa.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Digite o nome da sua empresa"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompanyDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveCompanySettings}
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
