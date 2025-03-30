import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  FileTextIcon,
  MoneyIcon,
  PercentIcon,
  UserIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  ArrowRightIcon,
  BuildingIcon,
  Building2Icon,
  UserStarIcon,
  ToolsIcon
} from "@/components/ui/icons";
import { formatCurrency, getStatusColor, getStatusText } from "@/lib/utils";

// Importar tipos necessários
import { Orcamento, EstatisticasDashboard } from "@/types";
import { obterEstatisticasDashboard } from "@/lib/db";

// Componente de Dashboard com dados reais
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<EstatisticasDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const dashboardStats = await obterEstatisticasDashboard();
        console.log("Estatísticas carregadas:", dashboardStats);
        setStats(dashboardStats);
      } catch (error) {
        console.error("Erro ao carregar estatísticas do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  // Renderizar esqueletos durante o carregamento
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-12 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-8 bg-gray-200 rounded-md w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Retornar mensagem se não houver estatísticas
  if (!stats) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-4">Não foi possível carregar as estatísticas. Tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => {
            try {
              const { inicializarBD, adicionar } = await import('@/lib/db');
              const db = await inicializarBD();
              
              // Adicionar cliente de exemplo
              const clienteId = await adicionar('clientes', {
                nome: 'Cliente Exemplo',
                documento: '123.456.789-00',
                email: 'cliente@exemplo.com',
                telefone: '(11) 98765-4321',
                endereco: 'Rua Exemplo, 123',
                criadoEm: new Date()
              });
              
              // Adicionar produtos de exemplo
              const produtoId1 = await adicionar('produtos', {
                nome: 'Produto Exemplo 1',
                descricao: 'Descrição do produto exemplo 1',
                preco: 100,
                tipo: 'produto',
                criadoEm: new Date()
              });
              
              const produtoId2 = await adicionar('produtos', {
                nome: 'Serviço Exemplo 1',
                descricao: 'Descrição do serviço exemplo 1',
                preco: 150,
                tipo: 'servico',
                criadoEm: new Date()
              });
              
              // Adicionar orçamento de exemplo
              const orcamentoId = await adicionar('orcamentos', {
                titulo: 'Orçamento Exemplo',
                clienteId,
                criadoEm: new Date(),
                validoAte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
                status: 'pendente',
                total: 350,
                incluirImpostos: true,
                itens: []
              });
              
              // Adicionar itens ao orçamento
              await adicionar('itensOrcamento', {
                orcamentoId,
                produtoId: produtoId1,
                quantidade: 2,
                precoUnitario: 100,
                desconto: 0,
                subtotal: 200
              });
              
              await adicionar('itensOrcamento', {
                orcamentoId,
                produtoId: produtoId2,
                quantidade: 1,
                precoUnitario: 150,
                desconto: 0,
                subtotal: 150
              });
              
              alert('Dados de exemplo adicionados com sucesso!');
              window.location.reload();
            } catch (error) {
              console.error('Erro ao adicionar dados de exemplo:', error);
              alert('Erro ao adicionar dados de exemplo. Verifique o console para mais detalhes.');
            }
          }}>
            Adicionar Dados de Exemplo
          </Button>
          <Button asChild>
            <Link href="/orcamentos/criar">
              <PlusIcon className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard 
          title="Orçamentos Ativos"
          value={stats.orcamentosAtivos}
          icon={<FileTextIcon />}
          description="Total de orçamentos ativos"
          trend={{
            value: Math.round(stats.tendenciaOrcamentos),
            isPositive: stats.tendenciaOrcamentos >= 0
          }}
        />
        
        <DashboardCard 
          title="Total Mensal"
          value={formatCurrency(stats.totalMensal)}
          icon={<MoneyIcon />}
          description="Valor total dos orçamentos este mês"
          trend={{
            value: Math.round(stats.tendenciaTotalMensal),
            isPositive: stats.tendenciaTotalMensal >= 0
          }}
        />
        
        <DashboardCard 
          title="Taxa de Conversão"
          value={`${stats.taxaConversao.toFixed(1)}%`}
          icon={<PercentIcon />}
          description="Orçamentos aprovados vs. finalizados"
          trend={{
            value: Math.round(stats.tendenciaTaxaConversao),
            isPositive: stats.tendenciaTaxaConversao >= 0
          }}
        />
        
        <DashboardCard 
          title="Clientes Ativos"
          value={stats.clientesAtivos}
          icon={<UserIcon />}
          description="Clientes com orçamentos ativos"
          trend={{
            value: Math.round(stats.tendenciaClientesAtivos),
            isPositive: stats.tendenciaClientesAtivos >= 0
          }}
        />
      </div>

      {/* Orçamentos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Título</th>
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2">Valor</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Data</th>
                  <th className="text-right p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {stats.orcamentosRecentes.map((orcamento) => (
                  <tr key={orcamento.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{orcamento.titulo}</td>
                    <td className="p-2">{orcamento.cliente?.nome || "Cliente não encontrado"}</td>
                    <td className="p-2">{formatCurrency(orcamento.total)}</td>
                    <td className="p-2">
                      <Badge variant={getStatusColor(orcamento.status)}>
                        {getStatusText(orcamento.status)}
                      </Badge>
                    </td>
                    <td className="p-2">{new Date(orcamento.criadoEm).toLocaleDateString()}</td>
                    <td className="p-2 text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/orcamentos/${orcamento.id}`}>
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/orcamentos/${orcamento.id}`}>
                          <EditIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {stats.orcamentosRecentes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      Nenhum orçamento encontrado. Crie seu primeiro orçamento!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <Button variant="outline" asChild>
              <Link href="/orcamentos">
                Ver Todos
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clientes e Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Principais Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Principais Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.clientesPrincipais.map((cliente) => (
                <div key={cliente.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      {cliente.tipo === 'Empresa' ? (
                        <BuildingIcon className="h-5 w-5 text-primary" />
                      ) : (
                        <UserStarIcon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{cliente.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Taxa de conversão: {cliente.taxaConversao.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(cliente.total)}</p>
                </div>
              ))}
              {stats.clientesPrincipais.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Nenhum cliente encontrado. Adicione clientes para ver estatísticas!
                </div>
              )}
            </div>
            <Separator className="my-4" />
            <div className="text-right">
              <Button variant="outline" asChild>
                <Link href="/clientes">
                  Ver Todos
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Produtos Populares */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.produtosPopulares.map((produto) => (
                <div key={produto.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      {produto.tipo === 'servico' ? (
                        <ToolsIcon className="h-5 w-5 text-primary" />
                      ) : (
                        <Building2Icon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{produto.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {produto.quantidade} unidades
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(produto.valor)}</p>
                </div>
              ))}
              {stats.produtosPopulares.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Nenhum produto encontrado. Adicione produtos para ver estatísticas!
                </div>
              )}
            </div>
            <Separator className="my-4" />
            <div className="text-right">
              <Button variant="outline" asChild>
                <Link href="/produtos">
                  Ver Todos
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
