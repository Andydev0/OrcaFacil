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
  Eye as EyeIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon
} from "lucide-react";
import { Link } from "wouter";
import { buscarTodos } from "@/lib/db";
import { Orcamento, Cliente } from "@/types";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const PaginaOrcamentos: React.FC = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filteredOrcamentos, setFilteredOrcamentos] = useState<Orcamento[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setCarregando(true);
        const dadosOrcamentos = await buscarTodos<Orcamento>('orcamentos');
        const dadosClientes = await buscarTodos<Cliente>('clientes');
        
        // Ordenar orçamentos por data (mais recentes primeiro)
        const orcamentosOrdenados = dadosOrcamentos.sort((a: Orcamento, b: Orcamento) => 
          new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
        );
        
        setOrcamentos(orcamentosOrdenados);
        setFilteredOrcamentos(orcamentosOrdenados);
        setClientes(dadosClientes);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setCarregando(false);
      }
    };
    
    buscarDados();
  }, []);

  // Filtrar orçamentos conforme pesquisa e tab ativa
  useEffect(() => {
    let filtered = [...orcamentos];
    
    // Filtrar por status
    if (activeTab !== "todos") {
      filtered = filtered.filter(o => o.status === activeTab);
    }
    
    // Filtrar por termo de busca
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.titulo.toLowerCase().includes(query) || 
        obterNomeCliente(o.clienteId).toLowerCase().includes(query) ||
        o.id.toString().includes(query)
      );
    }
    
    setFilteredOrcamentos(filtered);
  }, [orcamentos, searchQuery, activeTab, clientes]);

  // Função para obter o nome do cliente pelo ID
  const obterNomeCliente = (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : "Cliente não encontrado";
  };

  // Função para renderizar o status com cores diferentes
  const renderizarStatus = (status: string) => {
    let variante = "";
    let rotulo = "";
    
    switch (status) {
      case "rascunho":
        variante = "rascunho";
        rotulo = "Rascunho";
        break;
      case "pendente":
        variante = "pendente";
        rotulo = "Pendente";
        break;
      case "aprovado":
        variante = "aprovado";
        rotulo = "Aprovado";
        break;
      case "recusado":
        variante = "recusado";
        rotulo = "Recusado";
        break;
      case "analisando":
        variante = "analise";
        rotulo = "Em Análise";
        break;
      default:
        variante = "default";
        rotulo = status;
    }
    
    return (
      <Badge variant={variante as any} className="font-medium">{rotulo}</Badge>
    );
  };

  // Formatar data para exibição
  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Função para exportar como PDF
  const exportarPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Título do documento
      doc.setFontSize(18);
      doc.text("Relatório de Orçamentos", 14, 22);
      
      // Data de geração
      doc.setFontSize(11);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
      
      // Cabeçalhos da tabela
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Nº", 14, 45);
      doc.text("Cliente", 30, 45);
      doc.text("Título", 90, 45);
      doc.text("Data", 140, 45);
      doc.text("Total", 170, 45);
      doc.text("Status", 195, 45);
      
      // Linha separadora
      doc.setDrawColor(0, 0, 0);
      doc.line(14, 48, 195, 48);
      
      // Dados da tabela
      let y = 55;
      filteredOrcamentos.forEach((orcamento, index) => {
        if (y > 270) {
          // Nova página se atingir o limite
          doc.addPage();
          y = 20;
          
          // Cabeçalhos na nova página
          doc.setFontSize(12);
          doc.text("Nº", 14, y);
          doc.text("Cliente", 30, y);
          doc.text("Título", 90, y);
          doc.text("Data", 140, y);
          doc.text("Total", 170, y);
          doc.text("Status", 195, y);
          
          // Linha separadora
          doc.line(14, y + 3, 195, y + 3);
          y += 10;
        }
        
        doc.setFontSize(10);
        doc.text(`#${orcamento.id}`, 14, y);
        doc.text(obterNomeCliente(orcamento.clienteId).substring(0, 30), 30, y);
        doc.text(orcamento.titulo.substring(0, 25), 90, y);
        doc.text(formatarData(orcamento.criadoEm), 140, y);
        doc.text(formatCurrency(orcamento.total), 170, y);
        doc.text(orcamento.status, 195, y);
        
        y += 8;
      });
      
      // Salvar o PDF
      doc.save("orcamentos.pdf");
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF. Tente novamente.");
    }
  };
  
  // Função para exportar como Excel
  const exportarExcel = () => {
    try {
      // Preparar os dados para o Excel
      const dadosExcel = filteredOrcamentos.map(orcamento => ({
        'Nº': orcamento.id,
        'Cliente': obterNomeCliente(orcamento.clienteId),
        'Título': orcamento.titulo,
        'Data': formatarData(orcamento.criadoEm),
        'Validade': formatarData(orcamento.validoAte),
        'Total': formatCurrency(orcamento.total),
        'Status': orcamento.status
      }));
      
      // Criar uma planilha
      const ws = XLSX.utils.json_to_sheet(dadosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orçamentos");
      
      // Salvar o arquivo
      XLSX.writeFile(wb, "orcamentos.xlsx");
      toast.success("Excel exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      toast.error("Erro ao exportar Excel. Tente novamente.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
            <p className="text-gray-500 mt-1">Gerencie todos os seus orçamentos</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/orcamentos/criar">
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
                <PlusIcon size={16} />
                Novo Orçamento
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <DownloadIcon size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportarPDF}>Exportar como PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={exportarExcel}>Exportar como Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="col-span-1 md:col-span-4 bg-white shadow-sm border border-gray-100">
            <CardHeader className="pb-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      placeholder="Buscar orçamentos..." 
                      className="pl-10 bg-gray-50 border-gray-200"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <Tabs defaultValue="todos" className="w-full sm:w-auto" onValueChange={handleTabChange}>
                  <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="pendente">Pendentes</TabsTrigger>
                    <TabsTrigger value="aprovado">Aprovados</TabsTrigger>
                    <TabsTrigger value="recusado">Recusados</TabsTrigger>
                    <TabsTrigger value="rascunho">Rascunhos</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {carregando ? (
                // Esqueleto de carregamento
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : filteredOrcamentos.length === 0 ? (
                // Mensagem quando não há orçamentos
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <FilterIcon size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Nenhum orçamento encontrado com os filtros atuais.</p>
                  <Link href="/orcamentos/criar">
                    <Button>Criar Novo Orçamento</Button>
                  </Link>
                </div>
              ) : (
                // Tabela de orçamentos
                <div className="overflow-x-auto rounded-md border border-gray-100">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Nº</TableHead>
                        <TableHead className="font-semibold">Cliente</TableHead>
                        <TableHead className="font-semibold">Título</TableHead>
                        <TableHead className="font-semibold">Data</TableHead>
                        <TableHead className="font-semibold">Validade</TableHead>
                        <TableHead className="font-semibold">Total</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="text-right font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrcamentos.map((orcamento) => (
                        <TableRow key={orcamento.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-blue-600">#{orcamento.id}</TableCell>
                          <TableCell className="font-medium">{obterNomeCliente(orcamento.clienteId)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{orcamento.titulo}</TableCell>
                          <TableCell>{formatarData(orcamento.criadoEm)}</TableCell>
                          <TableCell>{formatarData(orcamento.validoAte)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(orcamento.total)}</TableCell>
                          <TableCell>{renderizarStatus(orcamento.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Link href={`/orcamentos/${orcamento.id}?modo=visualizar`}>
                                <Button variant="ghost" size="icon" title="Visualizar" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                                  <EyeIcon size={16} />
                                </Button>
                              </Link>
                              <Link href={`/orcamentos/${orcamento.id}?modo=editar`}>
                                <Button variant="ghost" size="icon" title="Editar" className="h-8 w-8 text-gray-500 hover:text-amber-600 hover:bg-amber-50">
                                  <EditIcon size={16} />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" title="Excluir" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50">
                                <TrashIcon size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaginaOrcamentos;