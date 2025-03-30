import React, { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ConfiguracaoEmpresa, ConfiguracaoImpostos } from "@/types";
import * as db from "@/lib/db";
import { toast } from "sonner";

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estado para configurações da empresa
  const [configuracaoEmpresa, setConfiguracaoEmpresa] = useState<ConfiguracaoEmpresa>({
    id: 0,
    nome: '',
    documento: '',
    email: '',
    telefone: '',
    endereco: '',
    logo: '',
    moeda: 'BRL',
    criadoEm: new Date(),
    configuracaoImpostosPadrao: {
      iss: 3,
      pis: 0.65,
      cofins: 3
    }
  });

  // Carregar configurações da empresa
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        setLoading(true);
        const config = await db.buscarConfiguracaoEmpresa();
        if (config) {
          setConfiguracaoEmpresa(config);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast.error("Erro ao carregar configurações");
      } finally {
        setLoading(false);
      }
    };

    carregarConfiguracoes();
  }, []);

  // Função para atualizar configurações da empresa
  const salvarConfiguracoes = async () => {
    try {
      setSaving(true);
      
      // Verificar se já existe alguma configuração no banco de dados
      const configExistente = await db.getConfiguracaoEmpresa();
      
      if (configExistente) {
        // Se já existe uma configuração, atualizar usando o ID existente
        const configAtualizada = {
          ...configuracaoEmpresa,
          id: configExistente.id
        };
        await db.atualizar('configuracaoEmpresa', configAtualizada);
        setConfiguracaoEmpresa(configAtualizada);
      } else {
        // Se não existe configuração, criar uma nova
        const novaConfig = {
          ...configuracaoEmpresa,
          criadoEm: new Date()
        };
        // Remover explicitamente o id para evitar conflitos
        delete (novaConfig as any).id;
        
        const id = await db.adicionar('configuracaoEmpresa', novaConfig);
        setConfiguracaoEmpresa(prev => ({ ...prev, id }));
      }
      
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  // Handlers para atualizar os campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfiguracaoEmpresa(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImpostoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfiguracaoEmpresa(prev => {
      // Garante que configuracaoImpostosPadrao existe com valores padrão
      const currentConfig = prev.configuracaoImpostosPadrao || {
        iss: 0,
        pis: 0,
        cofins: 0
      };
      
      return {
        ...prev,
        configuracaoImpostosPadrao: {
          ...currentConfig,
          [name]: parseFloat(value) || 0
        }
      };
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Configurações</h1>
        <p className="text-secondary-500">Configurar dados da empresa e preferências do sistema</p>
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="company">
          <TabsList className="w-full border-b mb-6">
            <TabsTrigger value="company">Dados da Empresa</TabsTrigger>
            <TabsTrigger value="tax">Impostos Padrão</TabsTrigger>
            <TabsTrigger value="display">Exibição</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
                <CardDescription>
                  Configure as informações da sua empresa que serão exibidas nos orçamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Empresa</Label>
                    <Input 
                      id="nome" 
                      name="nome"
                      placeholder="Nome da sua empresa" 
                      value={configuracaoEmpresa.nome}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documento">CNPJ/CPF</Label>
                    <Input 
                      id="documento" 
                      name="documento"
                      placeholder="CNPJ ou CPF" 
                      value={configuracaoEmpresa.documento || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email"
                      placeholder="Email de contato" 
                      value={configuracaoEmpresa.email || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input 
                      id="telefone" 
                      name="telefone"
                      placeholder="Telefone de contato" 
                      value={configuracaoEmpresa.telefone || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Textarea 
                    id="endereco" 
                    name="endereco"
                    placeholder="Endereço completo" 
                    value={configuracaoEmpresa.endereco || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo">URL do Logo</Label>
                  <Input 
                    id="logo" 
                    name="logo"
                    placeholder="URL da imagem do logo" 
                    value={configuracaoEmpresa.logo || ''}
                    onChange={handleInputChange}
                  />
                  <p className="text-xs text-gray-500">Informe a URL de uma imagem para ser usada como logo nos orçamentos</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle>Impostos Padrão</CardTitle>
                <CardDescription>
                  Configure as alíquotas de impostos padrão para serem aplicadas nos orçamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="iss">ISS (%)</Label>
                    <Input 
                      id="iss" 
                      name="iss"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="Ex: 3.00" 
                      value={configuracaoEmpresa.configuracaoImpostosPadrao?.iss || 0}
                      onChange={handleImpostoChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pis">PIS (%)</Label>
                    <Input 
                      id="pis" 
                      name="pis"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="Ex: 0.65" 
                      value={configuracaoEmpresa.configuracaoImpostosPadrao?.pis || 0}
                      onChange={handleImpostoChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cofins">COFINS (%)</Label>
                    <Input 
                      id="cofins" 
                      name="cofins"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="Ex: 3.00" 
                      value={configuracaoEmpresa.configuracaoImpostosPadrao?.cofins || 0}
                      onChange={handleImpostoChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="outros">Outros Impostos (descrição)</Label>
                  <Textarea 
                    id="outros" 
                    name="outros"
                    placeholder="Descreva outros impostos aplicáveis" 
                    value={configuracaoEmpresa.configuracaoImpostosPadrao?.outros || ''}
                    onChange={(e) => {
                      setConfiguracaoEmpresa(prev => {
                        // Garante que configuracaoImpostosPadrao existe com valores padrão
                        const currentConfig = prev.configuracaoImpostosPadrao || {
                          iss: 0,
                          pis: 0,
                          cofins: 0
                        };
                        
                        return {
                          ...prev,
                          configuracaoImpostosPadrao: {
                            ...currentConfig,
                            outros: e.target.value
                          }
                        };
                      });
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Exibição</CardTitle>
                <CardDescription>
                  Personalize a aparência dos orçamentos e relatórios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="moeda">Moeda</Label>
                    <Input 
                      id="moeda" 
                      name="moeda"
                      placeholder="Código da moeda (ex: BRL)" 
                      value={configuracaoEmpresa.moeda}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-gray-500">Código da moeda no formato ISO (ex: BRL, USD, EUR)</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <Switch 
                    id="tema-escuro"
                    checked={false}
                    onCheckedChange={() => {}}
                  />
                  <Label htmlFor="tema-escuro">Tema Escuro</Label>
                </div>
                
                <p className="text-secondary-500 mt-4">Mais opções de personalização estarão disponíveis em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={salvarConfiguracoes}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </Tabs>
      )}
    </div>
  );
};

export default SettingsPage;