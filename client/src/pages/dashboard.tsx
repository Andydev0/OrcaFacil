import React from "react";
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
import { BarChart, LineChart } from "@/components/ui/chart";

// Import types we need
import { Quote, DashboardStats } from "@/types";

// Temporary dashboard placeholder without context dependency
const Dashboard: React.FC = () => {
  // Static placeholder data with types
  const activeQuotes = 10;
  const monthlyTotal = 25000;
  const conversionRate = 65;
  const activeClients = 12;
  const recentQuotes: Quote[] = [];
  
  interface TopProduct {
    name: string;
    count: number;
    percentage: number;
  }
  
  interface TopClient {
    id: number;
    name: string;
    type: string;
    total: number;
    conversionRate: number;
  }
  
  const topProducts: TopProduct[] = [
    { name: "Instalação Elétrica", count: 15, percentage: 75 },
    { name: "Pintura Residencial", count: 12, percentage: 60 },
    { name: "Reforma de Banheiro", count: 8, percentage: 40 },
    { name: "Construção de Muro", count: 6, percentage: 30 }
  ];
  
  const topClients: TopClient[] = [
    { id: 1, name: "Construtora Silva", type: "Empresa", total: 45000, conversionRate: 80 },
    { id: 2, name: "João Pereira", type: "Pessoa Física", total: 28000, conversionRate: 65 },
    { id: 3, name: "Imobiliária Central", type: "Empresa", total: 22000, conversionRate: 70 }
  ];

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Bem-vindo ao seu painel de controle</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/quotes/create">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
              <PlusIcon className="mr-2" size={16} />
              Novo Orçamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Summary */}
      <div className="dashboard-grid mb-8">
        <DashboardCard
          title="Orçamentos Ativos"
          value={activeQuotes}
          icon={<FileTextIcon size={20} />}
          trend={{ value: 8.2, isPositive: true }}
        />

        <DashboardCard
          title="Total Orçado (Mês)"
          value={formatCurrency(monthlyTotal)}
          icon={<MoneyIcon size={20} />}
          trend={{ value: 12.5, isPositive: true }}
          iconClassName="bg-gradient-to-r from-green-500 to-emerald-500"
        />

        <DashboardCard
          title="Taxa de Conversão"
          value={`${conversionRate.toFixed(0)}%`}
          icon={<PercentIcon size={20} />}
          trend={{ value: 2.4, isPositive: false }}
          iconClassName="bg-gradient-to-r from-blue-500 to-cyan-500"
        />

        <DashboardCard
          title="Clientes Ativos"
          value={activeClients}
          icon={<UserIcon size={20} />}
          trend={{ value: 5.3, isPositive: true }}
          iconClassName="bg-gradient-to-r from-orange-500 to-amber-500"
        />
      </div>

      {/* Quick Actions and Recent Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="data-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-800">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Link href="/quotes/create">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200"
                >
                  <span className="flex items-center">
                    <FileTextIcon className="mr-3" />
                    Novo Orçamento
                  </span>
                  <ArrowRightIcon size={16} />
                </Button>
              </Link>
              
              <Link href="/clients">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between p-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200"
                >
                  <span className="flex items-center">
                    <UserIcon className="mr-3" />
                    Adicionar Cliente
                  </span>
                  <ArrowRightIcon size={16} />
                </Button>
              </Link>
              
              <Link href="/products">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between p-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200"
                >
                  <span className="flex items-center">
                    <ToolsIcon className="mr-3" />
                    Novo Produto/Serviço
                  </span>
                  <ArrowRightIcon size={16} />
                </Button>
              </Link>
              
              <Link href="/quotes">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-between p-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200"
                >
                  <span className="flex items-center">
                    <FileTextIcon className="mr-3" />
                    Relatórios
                  </span>
                  <ArrowRightIcon size={16} />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="data-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-gray-800">Orçamentos Recentes</CardTitle>
            <Link href="/quotes">
              <span className="text-blue-600 text-sm hover:underline cursor-pointer">Ver todos</span>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuotes.length > 0 ? (
                    recentQuotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-4 text-sm text-gray-800">
                          {quote.client?.name || "Cliente não encontrado"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-800">
                          {formatCurrency(quote.total || 0)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <Badge className={getStatusColor(quote.status)}>
                            {getStatusText(quote.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-right">
                          <Link href={`/quotes/${quote.id}`}>
                            <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full">
                              <EyeIcon size={16} />
                            </Button>
                          </Link>
                          <Link href={`/quotes/${quote.id}`}>
                            <Button variant="ghost" size="icon" className="ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full">
                              <EditIcon size={16} />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-sm text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center py-6">
                          <FileTextIcon size={36} className="text-gray-300 mb-2" />
                          <p>Nenhum orçamento recente encontrado</p>
                          <Link href="/quotes/create">
                            <Button variant="outline" size="sm" className="mt-3 text-blue-600 border-blue-300 hover:bg-blue-50">
                              Criar orçamento
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product and Client Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="data-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-gray-800">Produtos Mais Orçados</CardTitle>
            <Link href="/products">
              <span className="text-blue-600 text-sm hover:underline cursor-pointer">Ver catálogo</span>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {topProducts.length > 0 ? (
              <div className="space-y-5">
                {topProducts.map((product, index) => (
                  <div key={index} className="animate-slideInUp" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{product.name}</span>
                      <span className="text-sm font-medium text-gray-900">{product.count} orçamentos</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" 
                        style={{ width: `${product.percentage}%`, transition: "width 1s ease-in-out" }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ToolsIcon size={36} className="mx-auto text-gray-300 mb-2" />
                <p>Nenhum produto encontrado nos orçamentos</p>
                <Link href="/products">
                  <Button variant="outline" size="sm" className="mt-3 text-blue-600 border-blue-300 hover:bg-blue-50">
                    Adicionar produtos
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="data-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-gray-800">Principais Clientes</CardTitle>
            <Link href="/clients">
              <span className="text-blue-600 text-sm hover:underline cursor-pointer">Ver clientes</span>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orçado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversão</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.length > 0 ? (
                    topClients.map((client, index) => (
                      <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-150 animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 shadow-sm">
                              {client.type === "Empresa" ? <BuildingIcon size={16} /> : <UserIcon size={16} />}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-800">{client.name}</p>
                              <p className="text-xs text-gray-500">{client.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-800">
                          {formatCurrency(client.total)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  client.conversionRate >= 70 ? "bg-green-500" : 
                                  client.conversionRate >= 50 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${client.conversionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{client.conversionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-sm text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center py-6">
                          <UserIcon size={36} className="text-gray-300 mb-2" />
                          <p>Nenhum cliente com orçamentos encontrado</p>
                          <Link href="/clients">
                            <Button variant="outline" size="sm" className="mt-3 text-blue-600 border-blue-300 hover:bg-blue-50">
                              Adicionar cliente
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
