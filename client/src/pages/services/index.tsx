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
  Search as SearchIcon,
  Wrench as WrenchIcon,
  Settings as SettingsIcon,
  Clock as ClockIcon,
  Tag as TagIcon,
  Filter as FilterIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/ui/data-table";
import { Produto } from "@/types";
import { inicializarBD, buscarTodos, adicionar, atualizar, remover } from "@/lib/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

// Função independente para salvar serviços sem depender do contexto
const salvarServicoNoBD = async (servico: Partial<Produto>): Promise<number> => {
  try {
    const db = await inicializarBD();
    
    const agora = new Date();
    const servicoParaSalvar = {
      ...servico,
      tipo: 'servico', // Garantir que o tipo seja sempre 'servico'
      criadoEm: servico.id ? undefined : agora
    };
    
    if (servico.id) {
      await atualizar('produtos', servicoParaSalvar as Produto);
      return servico.id;
    } else {
      return await adicionar('produtos', servicoParaSalvar as Omit<Produto, 'id'>);
    }
  } catch (error) {
    console.error("Erro ao salvar serviço:", error);
    throw error;
  }
};

// Função independente para buscar serviços sem depender do contexto
const buscarServicosNoBD = async (): Promise<Produto[]> => {
  try {
    const db = await inicializarBD();
    const produtos = await buscarTodos<Produto>('produtos');
    return produtos.filter(p => p.tipo === 'servico');
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return [];
  }
};

// Função independente para deletar serviços sem depender do contexto
const deletarServicoNoBD = async (id: number): Promise<void> => {
  try {
    const db = await inicializarBD();
    await remover('produtos', id);
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
    throw new Error("Erro ao excluir o serviço");
  }
};

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Produto[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filteredServices, setFilteredServices] = useState<Produto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  
  // Form state
  const [formData, setFormData] = useState<Partial<Produto>>({
    nome: '',
    descricao: '',
    preco: 0,
    unidade: '',
    codigoInterno: ''
  });

  // Carregar serviços ao iniciar
  useEffect(() => {
    loadServices();
  }, []);
  
  const loadServices = async () => {
    try {
      const loadedServices = await buscarServicosNoBD();
      setServices(loadedServices);
      setFilteredServices(loadedServices);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    }
  };
  
  // Filtrar serviços conforme pesquisa e tab ativa
  useEffect(() => {
    if (searchQuery.trim() === '' && activeTab === 'todos') {
      setFilteredServices(services);
    } else {
      let filtered = [...services];
      
      // Aplicar filtro de pesquisa
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          s => s.nome.toLowerCase().includes(query) || 
             (s.descricao && s.descricao.toLowerCase().includes(query)) ||
             (s.codigoInterno && s.codigoInterno.toLowerCase().includes(query))
        );
      }
      
      // Aplicar filtro de tab
      if (activeTab === 'recentes') {
        // Ordenar por data de criação (mais recentes primeiro)
        filtered = filtered.sort((a, b) => 
          new Date(b.criadoEm || 0).getTime() - new Date(a.criadoEm || 0).getTime()
        ).slice(0, 10); // Pegar apenas os 10 mais recentes
      }
      
      setFilteredServices(filtered);
    }
  }, [services, searchQuery, activeTab]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleOpenDialog = (service?: Produto) => {
    if (service) {
      setFormData({
        id: service.id,
        nome: service.nome,
        descricao: service.descricao,
        preco: service.preco,
        unidade: service.unidade,
        codigoInterno: service.codigoInterno
      });
      setIsEditing(true);
    } else {
      setFormData({
        nome: '',
        descricao: '',
        preco: 0,
        unidade: '',
        codigoInterno: ''
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Tratamento especial para o campo de preço
    if (name === 'preco') {
      // Remove caracteres não numéricos e converte para número
      const numericValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      setFormData({
        ...formData,
        [name]: numericValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await salvarServicoNoBD(formData);
      setIsDialogOpen(false);
      loadServices(); // Recarregar a lista após salvar
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
    }
  };
  
  const handleDeleteClick = (id: number) => {
    setServiceToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (serviceToDelete) {
      try {
        await deletarServicoNoBD(serviceToDelete);
        setIsDeleteDialogOpen(false);
        setServiceToDelete(null);
        loadServices(); // Recarregar a lista após excluir
      } catch (error) {
        console.error("Erro ao excluir serviço:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
            <p className="text-gray-500 mt-1">Gerenciamento de serviços</p>
          </div>
          <Button 
            onClick={() => handleOpenDialog()} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
          >
            <SettingsIcon size={16} />
            Novo Serviço
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
                      placeholder="Buscar serviços..." 
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
              {filteredServices.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <WrenchIcon size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Nenhum serviço encontrado.</p>
                  <Button onClick={() => handleOpenDialog()}>Adicionar Serviço</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredServices.map((service) => (
                    <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">{service.nome}</h3>
                            {service.codigoInterno && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <TagIcon size={12} className="mr-1" />
                                <span>Cód: {service.codigoInterno}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleOpenDialog(service)}
                              className="h-8 w-8 text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                            >
                              <EditIcon size={15} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteClick(service.id)}
                              className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <TrashIcon size={15} />
                            </Button>
                          </div>
                        </div>
                        
                        {service.descricao && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{service.descricao}</p>
                        )}
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center text-sm">
                            <ClockIcon size={14} className="mr-1 text-gray-400" />
                            <span className="text-gray-600">{service.unidade || 'Hora'}</span>
                          </div>
                          <div className="text-lg font-semibold text-blue-600">
                            {formatCurrency(service.preco)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog para adicionar/editar serviço */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Atualize as informações do serviço abaixo.' : 'Preencha as informações do novo serviço.'}
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
                    placeholder="Nome do serviço"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="codigoInterno">Código Interno</Label>
                  <Input
                    id="codigoInterno"
                    name="codigoInterno"
                    value={formData.codigoInterno || ''}
                    onChange={handleInputChange}
                    placeholder="Código de referência"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="preco">Preço*</Label>
                    <Input
                      id="preco"
                      name="preco"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.preco}
                      onChange={handleInputChange}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="unidade">Unidade</Label>
                    <Input
                      id="unidade"
                      name="unidade"
                      value={formData.unidade || ''}
                      onChange={handleInputChange}
                      placeholder="hora, dia, etc."
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao || ''}
                    onChange={handleInputChange}
                    placeholder="Descrição detalhada do serviço"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  {isEditing ? 'Salvar Alterações' : 'Adicionar Serviço'}
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
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o serviço
                e pode afetar orçamentos existentes que utilizam este serviço.
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

export default ServicesPage;