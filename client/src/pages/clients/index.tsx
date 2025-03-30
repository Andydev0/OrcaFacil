import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus as PlusIcon, Edit as EditIcon, Trash as TrashIcon, Mail as MailIcon, Phone as PhoneIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/ui/data-table";
import { Client } from "@/types";
import { initDB, getAll, add, update, remove } from "@/lib/db";

// Função independente para salvar clientes sem depender do contexto
const saveClientToIndexedDB = async (client: Partial<Client>): Promise<number> => {
  try {
    const db = await initDB();
    
    const now = new Date();
    const clientToSave = {
      ...client,
      createdAt: client.id ? undefined : now
    };
    
    if (client.id) {
      return await update('clients', clientToSave as Client);
    } else {
      return await add('clients', clientToSave as Omit<Client, 'id'>);
    }
  } catch (error) {
    console.error("Erro ao salvar cliente:", error);
    throw new Error("Erro ao salvar o cliente");
  }
};

// Função independente para buscar clientes sem depender do contexto
const getClientsFromIndexedDB = async (): Promise<Client[]> => {
  try {
    const db = await initDB();
    return await getAll<Client>('clients');
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return [];
  }
};

// Função independente para deletar clientes sem depender do contexto
const deleteClientFromIndexedDB = async (id: number): Promise<void> => {
  try {
    const db = await initDB();
    await remove('clients', id);
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    throw new Error("Erro ao excluir o cliente");
  }
};

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: ''
  });

  // Carregar clientes ao iniciar
  useEffect(() => {
    loadClients();
  }, []);
  
  const loadClients = async () => {
    try {
      const loadedClients = await getClientsFromIndexedDB();
      setClients(loadedClients);
      setFilteredClients(loadedClients);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };
  
  // Filtrar clientes conforme pesquisa
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredClients(
        clients.filter(
          c => c.name.toLowerCase().includes(query) || 
             (c.document && c.document.toLowerCase().includes(query)) ||
             (c.email && c.email.toLowerCase().includes(query))
        )
      );
    }
  }, [clients, searchQuery]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setFormData({
        id: client.id,
        name: client.name,
        document: client.document,
        email: client.email,
        phone: client.phone,
        address: client.address
      });
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        document: '',
        email: '',
        phone: '',
        address: ''
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
      await saveClientToIndexedDB(formData);
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
        await deleteClientFromIndexedDB(clientToDelete);
        setIsDeleteDialogOpen(false);
        setClientToDelete(null);
        loadClients(); // Recarregar a lista após excluir
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
      }
    }
  };
  
  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof Client
    },
    {
      header: "Nome",
      accessorKey: "name" as keyof Client
    },
    {
      header: "Documento",
      accessorKey: "document" as keyof Client,
      cell: (client: Client) => client.document || '-'
    },
    {
      header: "Contato",
      accessorKey: "email" as keyof Client,
      cell: (client: Client) => (
        <div className="flex flex-col">
          {client.email && (
            <div className="flex items-center gap-1 text-xs">
              <MailIcon size={12} className="text-secondary-600" /> {client.email}
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-1 text-xs mt-1">
              <PhoneIcon size={12} className="text-secondary-600" /> {client.phone}
            </div>
          )}
          {!client.email && !client.phone && '-'}
        </div>
      )
    },
    {
      header: "Endereço",
      accessorKey: "address" as keyof Client,
      cell: (client: Client) => (
        <div className="max-w-xs truncate">{client.address || '-'}</div>
      )
    },
    {
      header: "Ações",
      accessorKey: "id" as keyof Client,
      cell: (client: Client) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(client)}>
            <EditIcon size={16} className="text-secondary-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(client.id)}>
            <TrashIcon size={16} className="text-red-600" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Clientes</h1>
          <p className="text-secondary-500">Gerenciar cadastro de clientes</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <PlusIcon size={16} />
          Novo Cliente
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Total de {filteredClients.length} clientes cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Buscar por nome, documento ou email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="max-w-md"
            />
          </div>
          
          <DataTable
            columns={columns}
            data={filteredClients}
            emptyState={
              <div className="text-center py-10">
                <p className="text-secondary-500 mb-4">Nenhum cliente cadastrado</p>
                <Button onClick={() => handleOpenDialog()} variant="outline" className="gap-2">
                  <PlusIcon size={16} />
                  Cadastrar seu primeiro cliente
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
      
      {/* Client Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Altere os dados do cliente conforme necessário.' : 'Preencha os dados para cadastrar um novo cliente.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name" className="text-right">
                  Nome*
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="document" className="text-right">
                  CPF/CNPJ
                </Label>
                <Input
                  id="document"
                  name="document"
                  value={formData.document}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-right">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="address" className="text-right">
                  Endereço
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{isEditing ? 'Atualizar' : 'Cadastrar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e pode afetar orçamentos existentes.
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
    </>
  );
};

export default ClientsPage;