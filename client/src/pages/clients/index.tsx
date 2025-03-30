import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus as PlusIcon, 
  Edit as EditIcon, 
  Trash as TrashIcon, 
  Mail as MailIcon, 
  Phone as PhoneIcon,
  Search as SearchIcon,
  UserPlus as UserPlusIcon,
  Users as UsersIcon,
  Filter as FilterIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/ui/data-table";
import { Cliente } from "@/types";
import { inicializarBD, buscarTodos, adicionar, atualizar, remover } from "@/lib/db";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Função independente para salvar clientes sem depender do contexto
const salvarClienteNoBD = async (cliente: Partial<Cliente>): Promise<number> => {
  try {
    const db = await inicializarBD();
    
    const agora = new Date();
    const clienteParaSalvar = {
      ...cliente,
      criadoEm: cliente.id ? undefined : agora
    };
    
    if (cliente.id) {
      await atualizar('clientes', clienteParaSalvar as Cliente);
      return cliente.id;
    } else {
      return await adicionar('clientes', clienteParaSalvar as Omit<Cliente, 'id'>);
    }
  } catch (error) {
    console.error("Erro ao salvar cliente:", error);
    throw error;
  }
};

// Função independente para buscar clientes sem depender do contexto
const buscarClientesNoBD = async (): Promise<Cliente[]> => {
  try {
    const db = await inicializarBD();
    return await buscarTodos<Cliente>('clientes');
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return [];
  }
};

// Função independente para deletar clientes sem depender do contexto
const deletarClienteNoBD = async (id: number): Promise<void> => {
  try {
    const db = await inicializarBD();
    await remover('clientes', id);
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    throw new Error("Erro ao excluir o cliente");
  }
};

// Função para obter as iniciais do nome
const getInitials = (name: string) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filteredClients, setFilteredClients] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  
  // Form state
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: '',
    documento: '',
    email: '',
    telefone: '',
    endereco: ''
  });

  // Carregar clientes ao iniciar
  useEffect(() => {
    loadClients();
  }, []);
  
  const loadClients = async () => {
    try {
      const loadedClients = await buscarClientesNoBD();
      setClients(loadedClients);
      setFilteredClients(loadedClients);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };
  
  // Filtrar clientes conforme pesquisa e tab ativa
  useEffect(() => {
    if (searchQuery.trim() === '' && activeTab === 'todos') {
      setFilteredClients(clients);
    } else {
      let filtered = [...clients];
      
      // Aplicar filtro de pesquisa
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          c => c.nome.toLowerCase().includes(query) || 
             (c.documento && c.documento.toLowerCase().includes(query)) ||
             (c.email && c.email.toLowerCase().includes(query))
        );
      }
      
      // Aplicar filtro de tab
      if (activeTab === 'recentes') {
        // Ordenar por data de criação (mais recentes primeiro)
        filtered = filtered.sort((a, b) => 
          new Date(b.criadoEm || 0).getTime() - new Date(a.criadoEm || 0).getTime()
        ).slice(0, 10); // Pegar apenas os 10 mais recentes
      }
      
      setFilteredClients(filtered);
    }
  }, [clients, searchQuery, activeTab]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleOpenDialog = (client?: Cliente) => {
    if (client) {
      setFormData({
        id: client.id,
        nome: client.nome,
        documento: client.documento,
        email: client.email,
        telefone: client.telefone,
        endereco: client.endereco
      });
      setIsEditing(true);
    } else {
      setFormData({
        nome: '',
        documento: '',
        email: '',
        telefone: '',
        endereco: ''
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await salvarClienteNoBD(formData);
      setIsDialogOpen(false);
      loadClients(); // Recarregar a lista após salvar
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    }
  };
  
  const handleDeleteClick = (id: number) => {
    setClientToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (clientToDelete) {
      try {
        await deletarClienteNoBD(clientToDelete);
        setIsDeleteDialogOpen(false);
        setClientToDelete(null);
        loadClients(); // Recarregar a lista após excluir
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-500 mt-1">Gerenciamento de clientes</p>
          </div>
          <Button 
            onClick={() => handleOpenDialog()} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
          >
            <UserPlusIcon size={16} />
            Novo Cliente
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="col-span-1 md:col-span-3 bg-white shadow-sm border border-gray-100">
            <CardHeader className="pb-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      placeholder="Buscar clientes..." 
                      className="pl-10 bg-gray-50 border-gray-200"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <Tabs defaultValue="todos" className="w-full sm:w-auto" onValueChange={handleTabChange}>
                  <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="recentes">Recentes</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredClients.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <UsersIcon size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Nenhum cliente encontrado.</p>
                  <Button onClick={() => handleOpenDialog()}>Adicionar Cliente</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClients.map((client) => (
                    <Card key={client.id} className="overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
                      <div className="flex p-4">
                        <Avatar className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                          <AvatarFallback>{getInitials(client.nome)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{client.nome}</h3>
                              {client.documento && (
                                <p className="text-sm text-gray-500">{client.documento}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleOpenDialog(client)}
                                className="h-8 w-8 text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                              >
                                <EditIcon size={15} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteClick(client.id)}
                                className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <TrashIcon size={15} />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            {client.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MailIcon size={14} className="mr-2 text-gray-400" />
                                <span className="truncate">{client.email}</span>
                              </div>
                            )}
                            {client.telefone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <PhoneIcon size={14} className="mr-2 text-gray-400" />
                                <span>{client.telefone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {client.endereco && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Endereço:</span> {client.endereco}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog para adicionar/editar cliente */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Atualize as informações do cliente abaixo.' : 'Preencha as informações do novo cliente.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome*</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="documento">Documento (CPF/CNPJ)</Label>
                  <Input
                    id="documento"
                    name="documento"
                    value={formData.documento || ''}
                    onChange={handleInputChange}
                    placeholder="CPF ou CNPJ"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={formData.telefone || ''}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Textarea
                    id="endereco"
                    name="endereco"
                    value={formData.endereco || ''}
                    onChange={handleInputChange}
                    placeholder="Endereço completo"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  {isEditing ? 'Salvar Alterações' : 'Adicionar Cliente'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmação para excluir */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente
                e todos os dados associados a ele.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ClientsPage;