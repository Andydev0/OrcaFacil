import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  buscarPorId, 
  buscarTodos, 
  salvarOrcamentoComItens,
  buscarConfiguracaoEmpresa
} from "@/lib/db";
import { 
  Cliente, 
  Produto, 
  Orcamento, 
  ItemOrcamento, 
  StatusOrcamento as OrcamentoStatus,
  ConfiguracaoEmpresa,
  Quote,
  Client,
  CompanySettings,
  QuoteItem
} from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft as ArrowLeftIcon, Plus as PlusIcon, Trash as TrashIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, calculateSubtotal } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface CreateQuotePageProps {
  params?: {
    id: string;
  };
}

const CreateQuotePage: React.FC<CreateQuotePageProps> = ({ params }) => {
  const [location, setLocation] = useLocation();
  
  // Adicionar log para depuração
  console.log("Parâmetros recebidos em CreateQuotePage:", params);
  
  // Extrair o modo da URL (visualizar ou editar)
  const urlParams = new URLSearchParams(window.location.search);
  const modo = urlParams.get('modo') || 'editar'; // Padrão é modo de edição
  
  console.log("Modo:", modo);
  
  // Verificar se params existe e tem a propriedade id
  const isEditing = params && params.id !== undefined;
  const quoteId = isEditing ? parseInt(params.id) : null;
  
  // Determinar se os campos devem ser somente leitura (no modo visualizar)
  const somenteLeitura = modo === 'visualizar';
  
  console.log("isEditing:", isEditing, "quoteId:", quoteId, "somenteLeitura:", somenteLeitura);
  
  // Estados para formulário
  const [titulo, setTitulo] = useState("");
  const [clienteId, setClienteId] = useState<number | "">("");
  const [status, setStatus] = useState<OrcamentoStatus>("rascunho");
  const [validoAte, setValidoAte] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [condicoesPagamento, setCondicoesPagamento] = useState("");
  const [prazoEntrega, setPrazoEntrega] = useState("");
  const [incluirImpostos, setIncluirImpostos] = useState(false);
  const [taxaIss, setTaxaIss] = useState(3);
  const [taxaPis, setTaxaPis] = useState(0.65);
  const [taxaCofins, setTaxaCofins] = useState(3);
  
  // Estados para itens do orçamento
  const [items, setItems] = useState<Array<{
    id?: number;
    produtoId: number | "";
    produto?: Produto;
    quantidade: number;
    precoUnitario: number;
    desconto: number;
    descricao: string;
    subtotal: number;
  }>>([]);
  
  // Estados para dados
  const [clients, setClients] = useState<Cliente[]>([]);
  const [products, setProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configuracaoEmpresa, setConfiguracaoEmpresa] = useState<ConfiguracaoEmpresa | null>(null);
  
  // Função para imprimir o orçamento diretamente
  const imprimirOrcamento = () => {
    try {
      // Verificar se temos os dados necessários
      if (!clienteId || typeof clienteId !== 'number') {
        alert('Por favor, selecione um cliente antes de imprimir.');
        return;
      }

      // Criar uma folha de estilo para impressão
      const style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-white.p-8.rounded-lg.shadow-lg.max-w-4xl.mx-auto, 
          .bg-white.p-8.rounded-lg.shadow-lg.max-w-4xl.mx-auto * {
            visibility: visible;
          }
          .bg-white.p-8.rounded-lg.shadow-lg.max-w-4xl.mx-auto {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            size: auto;
            margin: 10mm;
          }
          button {
            display: none !important;
          }
        }
      `;
      
      // Adicionar a folha de estilo ao documento
      document.head.appendChild(style);
      
      // Imprimir a página
      window.print();
      
      // Remover a folha de estilo após a impressão
      setTimeout(() => {
        document.head.removeChild(style);
      }, 1000);
    } catch (error) {
      console.error('Erro ao imprimir orçamento:', error);
      alert('Ocorreu um erro ao imprimir. Por favor, tente novamente.');
    }
  };
  
  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        // Carregar clientes e produtos
        const clientsData = await buscarTodos<Cliente>('clientes');
        const productsData = await buscarTodos<Produto>('produtos');
        
        setClients(clientsData);
        setProducts(productsData);
        
        // Carregar configurações da empresa
        const configEmpresa = await buscarConfiguracaoEmpresa();
        setConfiguracaoEmpresa(configEmpresa);
        
        // Se estiver editando, carregar dados do orçamento
        if (isEditing && quoteId) {
          const quote = await buscarPorId<Orcamento>('orcamentos', quoteId);
          if (quote) {
            setTitulo(quote.titulo);
            setClienteId(quote.clienteId);
            setStatus(quote.status);
            setValidoAte(new Date(quote.validoAte).toISOString().split('T')[0]);
            setObservacoes(quote.observacoes || "");
            setFormaPagamento(quote.formaPagamento || "");
            setCondicoesPagamento(quote.condicoesPagamento || "");
            setPrazoEntrega(quote.prazoEntrega || "");
            setIncluirImpostos(quote.incluirImpostos);
            
            if (quote.detalhesImpostos) {
              setTaxaIss(quote.detalhesImpostos.iss);
              setTaxaPis(quote.detalhesImpostos.pis);
              setTaxaCofins(quote.detalhesImpostos.cofins);
            }
            
            // Carregar itens do orçamento
            const quoteItems = await buscarTodos<ItemOrcamento>('itensOrcamento');
            const filteredItems = quoteItems.filter(item => item.orcamentoId === quoteId);
            
            // Mapear itens para o formato do estado
            const mappedItems = await Promise.all(filteredItems.map(async (item) => {
              const product = await buscarPorId<Produto>('produtos', item.produtoId);
              return {
                id: item.id,
                produtoId: item.produtoId,
                produto: product,
                quantidade: item.quantidade,
                precoUnitario: item.precoUnitario,
                desconto: item.desconto,
                descricao: item.descricao || "",
                subtotal: item.subtotal
              };
            }));
            
            setItems(mappedItems);
          }
        } else {
          // Definir data de validade padrão (30 dias a partir de hoje)
          const defaultDate = new Date();
          defaultDate.setDate(defaultDate.getDate() + 30);
          setValidoAte(defaultDate.toISOString().split('T')[0]);
          
          // Adicionar um item vazio por padrão
          addItem();
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, [isEditing, quoteId]);
  
  // Adicionar novo item
  const addItem = () => {
    setItems([
      ...items,
      {
        produtoId: "",
        quantidade: 1,
        precoUnitario: 0,
        desconto: 0,
        descricao: "",
        subtotal: 0
      }
    ]);
  };
  
  // Remover item
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  // Atualizar item
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    // Se o produto for alterado, atualizar o preço unitário
    if (field === 'produtoId' && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        item.precoUnitario = selectedProduct.preco;
        item.produto = selectedProduct;
        item.descricao = selectedProduct.descricao;
      }
    }
    
    // Recalcular subtotal
    item.subtotal = calculateSubtotal(
      item.quantidade, 
      item.precoUnitario, 
      item.desconto
    );
    
    newItems[index] = item;
    setItems(newItems);
  };
  
  // Calcular total
  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    if (incluirImpostos) {
      const taxRate = taxaIss + taxaPis + taxaCofins;
      return subtotal * (1 + taxRate / 100);
    }
    
    return subtotal;
  };
  
  // Salvar orçamento
  const saveQuote = async () => {
    if (!titulo || clienteId === "" || !validoAte || items.length === 0) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      setSaving(true);
      
      // Preparar dados do orçamento
      const quoteData: Partial<Orcamento> = {
        id: isEditing ? quoteId || undefined : undefined,
        titulo: titulo,
        clienteId: clienteId as number,
        status,
        validoAte: new Date(validoAte),
        observacoes: observacoes,
        formaPagamento: formaPagamento,
        condicoesPagamento: condicoesPagamento,
        prazoEntrega: prazoEntrega,
        incluirImpostos: incluirImpostos,
        detalhesImpostos: {
          iss: taxaIss,
          pis: taxaPis,
          cofins: taxaCofins
        },
        total: calculateTotal(),
        criadoEm: new Date()
      };
      
      // Preparar itens do orçamento
      const quoteItems = items.map(item => ({
        produtoId: item.produtoId as number,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        desconto: item.desconto,
        descricao: item.descricao,
        subtotal: item.subtotal
      }));
      
      // Salvar orçamento e itens
      const savedQuoteId = await salvarOrcamentoComItens(quoteData as Orcamento, quoteItems);
      
      // Redirecionar para a lista de orçamentos
      setLocation("/orcamentos");
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
      alert("Erro ao salvar orçamento. Verifique o console para mais detalhes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ) : modo === 'visualizar' ? (
        // Visualização para o cliente
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
          {/* Cabeçalho da empresa */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Orçamento #{quoteId}</h1>
              <p className="text-gray-600">Válido até: {new Date(validoAte).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold">{configuracaoEmpresa?.nome || 'OrçaFácil'}</h2>
              {configuracaoEmpresa?.documento && (
                <p className="text-gray-600">{configuracaoEmpresa.documento}</p>
              )}
              <p className="text-gray-600">{configuracaoEmpresa?.email || 'contato@orcafacil.com.br'}</p>
              <p className="text-gray-600">{configuracaoEmpresa?.telefone || '(11) 99999-9999'}</p>
              {configuracaoEmpresa?.endereco && (
                <p className="text-gray-600">{configuracaoEmpresa.endereco}</p>
              )}
            </div>
          </div>
          
          {/* Informações do cliente */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Cliente</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-medium">{clients.find(c => c.id === clienteId)?.nome || 'Cliente não encontrado'}</p>
              <p className="text-gray-600">{clients.find(c => c.id === clienteId)?.email || ''}</p>
              <p className="text-gray-600">{clients.find(c => c.id === clienteId)?.telefone || ''}</p>
            </div>
          </div>
          
          {/* Detalhes do orçamento */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Detalhes do Orçamento</h3>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <p><span className="font-medium">Título:</span> {titulo}</p>
              <p><span className="font-medium">Status:</span> {
                {
                  'rascunho': 'Rascunho',
                  'pendente': 'Pendente',
                  'analisando': 'Em Análise',
                  'aprovado': 'Aprovado',
                  'recusado': 'Recusado'
                }[status] || status
              }</p>
              {observacoes && (
                <div className="mt-2">
                  <p className="font-medium">Observações:</p>
                  <p className="text-gray-600 whitespace-pre-line">{observacoes}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Tabela de itens */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Itens do Orçamento</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2 border">Item</th>
                    <th className="text-left p-2 border">Descrição</th>
                    <th className="text-right p-2 border">Qtd</th>
                    <th className="text-right p-2 border">Preço Unit.</th>
                    <th className="text-right p-2 border">Desconto</th>
                    <th className="text-right p-2 border">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 border">{products.find(p => p.id === item.produtoId)?.nome || 'Produto não encontrado'}</td>
                      <td className="p-2 border">{item.descricao || '-'}</td>
                      <td className="p-2 border text-right">{item.quantidade}</td>
                      <td className="p-2 border text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoUnitario)}</td>
                      <td className="p-2 border text-right">{item.desconto}%</td>
                      <td className="p-2 border text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Resumo de valores */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="font-medium">Subtotal:</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(items.reduce((sum, item) => sum + item.subtotal, 0))}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Desconto:</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(0)}</span>
              </div>
              
              {/* Impostos da configuração da empresa */}
              {configuracaoEmpresa?.configuracaoImpostosPadrao?.iss && configuracaoEmpresa.configuracaoImpostosPadrao.iss > 0 && (
                <div className="flex justify-between py-1 text-sm text-gray-600">
                  <span>ISS ({configuracaoEmpresa?.configuracaoImpostosPadrao?.iss}%):</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(items.reduce((sum, item) => sum + item.subtotal, 0) * (configuracaoEmpresa?.configuracaoImpostosPadrao?.iss || 0) / 100)}</span>
                </div>
              )}
              
              {configuracaoEmpresa?.configuracaoImpostosPadrao?.pis && configuracaoEmpresa.configuracaoImpostosPadrao.pis > 0 && (
                <div className="flex justify-between py-1 text-sm text-gray-600">
                  <span>PIS ({configuracaoEmpresa?.configuracaoImpostosPadrao?.pis}%):</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(items.reduce((sum, item) => sum + item.subtotal, 0) * (configuracaoEmpresa?.configuracaoImpostosPadrao?.pis || 0) / 100)}</span>
                </div>
              )}
              
              {configuracaoEmpresa?.configuracaoImpostosPadrao?.cofins && configuracaoEmpresa.configuracaoImpostosPadrao.cofins > 0 && (
                <div className="flex justify-between py-1 text-sm text-gray-600">
                  <span>COFINS ({configuracaoEmpresa?.configuracaoImpostosPadrao?.cofins}%):</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(items.reduce((sum, item) => sum + item.subtotal, 0) * (configuracaoEmpresa?.configuracaoImpostosPadrao?.cofins || 0) / 100)}</span>
                </div>
              )}
              
              {configuracaoEmpresa?.configuracaoImpostosPadrao?.outros && (
                <div className="flex justify-between py-1 text-sm text-gray-600">
                  <span>Outros impostos:</span>
                  <span>{configuracaoEmpresa.configuracaoImpostosPadrao.outros}</span>
                </div>
              )}
              
              <div className="flex justify-between py-2">
                <span className="font-medium">Impostos:</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(incluirImpostos ? (taxaIss + taxaPis + taxaCofins) * items.reduce((sum, item) => sum + item.subtotal, 0) / 100 : 0)}</span>
              </div>
              <div className="flex justify-between py-2 border-t font-bold">
                <span>Total:</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotal())}</span>
              </div>
            </div>
          </div>
          
          {/* Condições de pagamento */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Condições de Pagamento</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p><span className="font-medium">Forma de Pagamento:</span> {formaPagamento || 'Não especificado'}</p>
              <p><span className="font-medium">Prazo de Entrega:</span> {prazoEntrega || 'Não especificado'}</p>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={imprimirOrcamento}>
                Imprimir
              </Button>
              <Button variant="default">
                Aprovar Orçamento
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="info">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Informações Básicas</TabsTrigger>
            <TabsTrigger value="items">Itens do Orçamento</TabsTrigger>
            <TabsTrigger value="payment">Pagamento e Entrega</TabsTrigger>
            <TabsTrigger value="taxes">Impostos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Orçamento</CardTitle>
                <CardDescription>Preencha as informações básicas do orçamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título do Orçamento *</Label>
                    <Input 
                      id="titulo" 
                      placeholder="Ex: Desenvolvimento de Website" 
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      disabled={somenteLeitura}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cliente">Cliente *</Label>
                    <Select 
                      value={clienteId.toString()} 
                      onValueChange={(value) => setClienteId(parseInt(value))}
                      disabled={somenteLeitura}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={status} 
                      onValueChange={(value) => setStatus(value as OrcamentoStatus)}
                      disabled={somenteLeitura}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="analisando">Em Análise</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                        <SelectItem value="recusado">Recusado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="validoAte">Válido até *</Label>
                    <Input 
                      id="validoAte" 
                      type="date" 
                      value={validoAte}
                      onChange={(e) => setValidoAte(e.target.value)}
                      disabled={somenteLeitura}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea 
                    id="observacoes" 
                    placeholder="Informações adicionais sobre o orçamento" 
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    disabled={somenteLeitura}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Itens do Orçamento</CardTitle>
                <CardDescription>Adicione produtos e serviços ao orçamento</CardDescription>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-secondary-500 mb-4">Nenhum item adicionado</p>
                    <Button onClick={addItem} disabled={somenteLeitura}>
                      Adicionar Item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium">Item {index + 1}</h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(index)}
                            disabled={somenteLeitura}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`produto-${index}`}>Produto/Serviço *</Label>
                            <Select 
                              value={item.produtoId.toString()} 
                              onValueChange={(value) => updateItem(index, 'produtoId', parseInt(value))}
                              disabled={somenteLeitura}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.nome} ({product.tipo})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`quantidade-${index}`}>Quantidade *</Label>
                            <Input 
                              id={`quantidade-${index}`} 
                              type="number" 
                              min="1"
                              value={item.quantidade}
                              onChange={(e) => updateItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                              disabled={somenteLeitura}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor={`preco-${index}`}>Preço Unitário *</Label>
                            <Input 
                              id={`preco-${index}`} 
                              type="number" 
                              min="0"
                              step="0.01"
                              value={item.precoUnitario}
                              onChange={(e) => updateItem(index, 'precoUnitario', parseFloat(e.target.value) || 0)}
                              disabled={somenteLeitura}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`desconto-${index}`}>Desconto (%)</Label>
                            <Input 
                              id={`desconto-${index}`} 
                              type="number" 
                              min="0"
                              max="100"
                              value={item.desconto}
                              onChange={(e) => updateItem(index, 'desconto', parseFloat(e.target.value) || 0)}
                              disabled={somenteLeitura}
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <Label htmlFor={`descricao-${index}`}>Descrição</Label>
                          <Textarea 
                            id={`descricao-${index}`} 
                            placeholder="Descrição detalhada do item" 
                            value={item.descricao}
                            onChange={(e) => updateItem(index, 'descricao', e.target.value)}
                            disabled={somenteLeitura}
                          />
                        </div>
                        
                        <div className="mt-4 text-right">
                          <p className="text-sm text-secondary-500">Subtotal: {formatCurrency(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2"
                      onClick={addItem}
                      disabled={somenteLeitura}
                    >
                      <PlusIcon size={16} />
                      Adicionar Item
                    </Button>
                    
                    <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">Total do Orçamento:</p>
                        <p className="text-xl font-bold">{formatCurrency(calculateTotal())}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Pagamento e Entrega</CardTitle>
                <CardDescription>Defina as condições de pagamento e entrega</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                  <Select 
                    value={formaPagamento} 
                    onValueChange={setFormaPagamento}
                    disabled={somenteLeitura}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartaoCredito">Cartão de Crédito</SelectItem>
                      <SelectItem value="cartaoDebito">Cartão de Débito</SelectItem>
                      <SelectItem value="transferenciaBancaria">Transferência Bancária</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="condicoesPagamento">Condições de Pagamento</Label>
                  <Select 
                    value={condicoesPagamento} 
                    onValueChange={setCondicoesPagamento}
                    disabled={somenteLeitura}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione as condições de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aVista">À vista</SelectItem>
                      <SelectItem value="30dias">30 dias</SelectItem>
                      <SelectItem value="60dias">60 dias</SelectItem>
                      <SelectItem value="90dias">90 dias</SelectItem>
                      <SelectItem value="parcelado">Parcelado</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prazoEntrega">Prazo de Entrega</Label>
                  <Input 
                    id="prazoEntrega" 
                    placeholder="Ex: 15 dias úteis após aprovação" 
                    value={prazoEntrega}
                    onChange={(e) => setPrazoEntrega(e.target.value)}
                    disabled={somenteLeitura}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="taxes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Impostos</CardTitle>
                <CardDescription>Defina os impostos aplicáveis ao orçamento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="incluirImpostos" 
                    checked={incluirImpostos}
                    onCheckedChange={setIncluirImpostos}
                    disabled={somenteLeitura}
                  />
                  <Label htmlFor="incluirImpostos">Incluir impostos no orçamento</Label>
                </div>
                
                {incluirImpostos && (
                  <div className="mt-4 space-y-4">
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="taxaIss">ISS (%)</Label>
                        <Input 
                          id="taxaIss" 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={taxaIss}
                          onChange={(e) => setTaxaIss(parseFloat(e.target.value) || 0)}
                          disabled={somenteLeitura}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="taxaPis">PIS (%)</Label>
                        <Input 
                          id="taxaPis" 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={taxaPis}
                          onChange={(e) => setTaxaPis(parseFloat(e.target.value) || 0)}
                          disabled={somenteLeitura}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="taxaCofins">COFINS (%)</Label>
                        <Input 
                          id="taxaCofins" 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={taxaCofins}
                          onChange={(e) => setTaxaCofins(parseFloat(e.target.value) || 0)}
                          disabled={somenteLeitura}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
                      <p className="text-sm text-secondary-500">
                        Total de impostos: {taxaIss + taxaPis + taxaCofins}%
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      <div className="mt-6 flex justify-end gap-2">
        <Link href="/orcamentos">
          <Button variant="outline">Cancelar</Button>
        </Link>
        <Button 
          onClick={saveQuote} 
          disabled={saving || loading || somenteLeitura}
        >
          {saving ? "Salvando..." : "Salvar Orçamento"}
        </Button>
      </div>
    </div>
  );
};

export default CreateQuotePage;