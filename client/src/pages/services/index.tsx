import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus as PlusIcon, Edit as EditIcon, Trash as TrashIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";

// Função independente para salvar serviços sem depender do contexto
const saveServiceToIndexedDB = async (service: Partial<Product>): Promise<number> => {
  const db = await window.indexedDB.open("BudgetAppDB", 1);
  
  return new Promise((resolve, reject) => {
    db.onerror = () => {
      reject(new Error("Erro ao abrir o banco de dados"));
    };
    
    db.onsuccess = () => {
      const database = db.result;
      const transaction = database.transaction(["products"], "readwrite");
      const store = transaction.objectStore("products");
      
      const now = new Date();
      const serviceToSave = {
        ...service,
        createdAt: service.id ? undefined : now
      };
      
      let request;
      if (service.id) {
        request = store.put(serviceToSave);
      } else {
        request = store.add(serviceToSave);
      }
      
      request.onsuccess = () => {
        resolve(request.result as number);
      };
      
      request.onerror = () => {
        reject(new Error("Erro ao salvar o serviço"));
      };
    };
    
    db.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains("products")) {
        const store = database.createObjectStore("products", { keyPath: "id", autoIncrement: true });
        store.createIndex("by-name", "name", { unique: false });
        store.createIndex("by-type", "type", { unique: false });
      }
    };
  });
};

// Função independente para buscar serviços sem depender do contexto
const getServicesFromIndexedDB = async (): Promise<Product[]> => {
  const db = await window.indexedDB.open("BudgetAppDB", 1);
  
  return new Promise((resolve, reject) => {
    db.onerror = () => {
      reject(new Error("Erro ao abrir o banco de dados"));
    };
    
    db.onsuccess = () => {
      const database = db.result;
      const transaction = database.transaction(["products"], "readonly");
      const store = transaction.objectStore("products");
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result as Product[]);
      };
      
      request.onerror = () => {
        reject(new Error("Erro ao buscar serviços"));
      };
    };
    
    db.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains("products")) {
        const store = database.createObjectStore("products", { keyPath: "id", autoIncrement: true });
        store.createIndex("by-name", "name", { unique: false });
        store.createIndex("by-type", "type", { unique: false });
      }
    };
  });
};

// Função independente para deletar serviços sem depender do contexto
const deleteServiceFromIndexedDB = async (id: number): Promise<void> => {
  const db = await window.indexedDB.open("BudgetAppDB", 1);
  
  return new Promise((resolve, reject) => {
    db.onerror = () => {
      reject(new Error("Erro ao abrir o banco de dados"));
    };
    
    db.onsuccess = () => {
      const database = db.result;
      const transaction = database.transaction(["products"], "readwrite");
      const store = transaction.objectStore("products");
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error("Erro ao excluir o serviço"));
      };
    };
  });
};

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filteredServices, setFilteredServices] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    type: 'service'
  });

  // Carregar serviços ao iniciar
  useEffect(() => {
    loadServices();
  }, []);
  
  const loadServices = async () => {
    try {
      const loadedProducts = await getServicesFromIndexedDB();
      setServices(loadedProducts.filter(p => p.type === 'service'));
      setFilteredServices(loadedProducts.filter(p => p.type === 'service'));
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    }
  };
  
  // Filtrar serviços conforme pesquisa
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(services);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredServices(
        services.filter(
          p => p.name.toLowerCase().includes(query) || 
             (p.description && p.description.toLowerCase().includes(query))
        )
      );
    }
  }, [services, searchQuery]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleOpenDialog = (service?: Product) => {
    if (service) {
      setFormData({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        type: 'service'
      });
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        type: 'service'
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await saveServiceToIndexedDB(formData);
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
        await deleteServiceFromIndexedDB(serviceToDelete);
        setIsDeleteDialogOpen(false);
        setServiceToDelete(null);
        loadServices(); // Recarregar a lista após excluir
      } catch (error) {
        console.error("Erro ao excluir serviço:", error);
      }
    }
  };
  
  const columns = [
    {
      header: "ID",
      accessorKey: "id" as keyof Product
    },
    {
      header: "Nome",
      accessorKey: "name" as keyof Product
    },
    {
      header: "Descrição",
      accessorKey: "description" as keyof Product,
      cell: (service: Product) => (
        <div className="max-w-xs truncate">{service.description || '-'}</div>
      )
    },
    {
      header: "Preço",
      accessorKey: "price" as keyof Product,
      cell: (service: Product) => formatCurrency(service.price)
    },
    {
      header: "Ações",
      accessorKey: "id" as keyof Product,
      cell: (service: Product) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(service)}>
            <EditIcon size={16} className="text-secondary-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(service.id)}>
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
          <h1 className="text-2xl font-bold text-secondary-900">Serviços</h1>
          <p className="text-secondary-500">Gerenciar cadastro de serviços</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <PlusIcon size={16} />
          Novo Serviço
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Serviços</CardTitle>
          <CardDescription>
            Total de {filteredServices.length} serviços cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="max-w-md"
            />
          </div>
          
          <DataTable
            columns={columns}
            data={filteredServices}
            emptyState={
              <div className="text-center py-10">
                <p className="text-secondary-500 mb-4">Nenhum serviço cadastrado</p>
                <Button onClick={() => handleOpenDialog()} variant="outline" className="gap-2">
                  <PlusIcon size={16} />
                  Cadastrar seu primeiro serviço
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
      
      {/* Service Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Altere os dados do serviço conforme necessário.' : 'Preencha os dados para cadastrar um novo serviço.'}
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
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-right">
                  Preço por hora*
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Badge className="bg-blue-600">Serviço</Badge>
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
              Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita e pode afetar orçamentos existentes.
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

export default ServicesPage;