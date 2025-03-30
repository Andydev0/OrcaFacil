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

import { saveObject, getAllObjects, deleteObjectById, getDatabase } from "@/lib/idb-utils";

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    type: 'product'
  });

  // Carregar produtos quando o componente é montado
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // O banco de dados já foi inicializado no App
      const loadedProducts = await getAllObjects<Product>("products");
      console.log("Produtos carregados:", loadedProducts);
      
      // Se não tivermos produtos ainda, podemos estar trabalhando com um DB vazio
      // Nesse caso, definimos uma lista vazia ao invés de tentar filtrar
      if (!loadedProducts || loadedProducts.length === 0) {
        setProducts([]);
        setFilteredProducts([]);
        return;
      }
      
      const onlyProducts = loadedProducts.filter(p => p.type === 'product');
      setProducts(onlyProducts);
      setFilteredProducts(onlyProducts);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      // Em caso de erro, definimos listas vazias para evitar erros de renderização
      setProducts([]);
      setFilteredProducts([]);
    }
  };
  
  // Filtrar produtos conforme pesquisa
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredProducts(
        products.filter(
          p => p.name.toLowerCase().includes(query) || 
             (p.description && p.description.toLowerCase().includes(query))
        )
      );
    }
  }, [products, searchQuery]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        type: 'product'
      });
      setIsEditing(true);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        type: 'product'
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
      await saveObject("products", formData);
      setIsDialogOpen(false);
      loadProducts(); // Recarregar a lista após salvar
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  };
  
  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteObjectById("products", productToDelete);
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
        loadProducts(); // Recarregar a lista após excluir
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
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
      cell: (product: Product) => (
        <div className="max-w-xs truncate">{product.description || '-'}</div>
      )
    },
    {
      header: "Preço",
      accessorKey: "price" as keyof Product,
      cell: (product: Product) => formatCurrency(product.price)
    },
    {
      header: "Ações",
      accessorKey: "id" as keyof Product,
      cell: (product: Product) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
            <EditIcon size={16} className="text-secondary-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product.id)}>
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
          <h1 className="text-2xl font-bold text-secondary-900">Produtos</h1>
          <p className="text-secondary-500">Gerenciar cadastro de produtos</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <PlusIcon size={16} />
          Novo Produto
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            Total de {filteredProducts.length} produtos cadastrados
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
            data={filteredProducts}
            emptyState={
              <div className="text-center py-10">
                <p className="text-secondary-500 mb-4">Nenhum produto cadastrado</p>
                <Button onClick={() => handleOpenDialog()} variant="outline" className="gap-2">
                  <PlusIcon size={16} />
                  Cadastrar seu primeiro produto
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
      
      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Altere os dados do produto conforme necessário.' : 'Preencha os dados para cadastrar um novo produto.'}
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
                  Preço*
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
              <Badge>Produto</Badge>
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
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita e pode afetar orçamentos existentes.
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

export default ProductsPage;