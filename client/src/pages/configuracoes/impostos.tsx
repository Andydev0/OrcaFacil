import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layouts/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { buscarConfiguracaoEmpresa, atualizarConfiguracaoEmpresa } from "@/lib/db";
import { ConfiguracaoEmpresa } from "@/types";

export default function ImpostosPage() {
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoEmpresa | null>(null);
  const [iss, setIss] = useState<number>(0);
  const [pis, setPis] = useState<number>(0);
  const [cofins, setCofins] = useState<number>(0);
  
  // Carregar configurações da empresa
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        setIsLoading(true);
        const config = await buscarConfiguracaoEmpresa();
        setConfiguracao(config);
        
        // Definir valores iniciais
        if (config.configuracaoImpostosPadrao) {
          setIss(config.configuracaoImpostosPadrao.iss);
          setPis(config.configuracaoImpostosPadrao.pis);
          setCofins(config.configuracaoImpostosPadrao.cofins);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações de impostos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarConfiguracoes();
  }, [toast]);
  
  const handleSave = async () => {
    if (!configuracao) return;
    
    setIsLoading(true);
    
    try {
      // Atualizar configurações de impostos
      const updatedConfig: ConfiguracaoEmpresa = {
        ...configuracao,
        configuracaoImpostosPadrao: {
          iss,
          pis,
          cofins
        }
      };
      
      await atualizarConfiguracaoEmpresa(updatedConfig);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de impostos foram atualizadas com sucesso.",
        variant: "default"
      });
      
      setConfiguracao(updatedConfig);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de impostos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para validar e formatar entrada numérica
  const handleNumericInput = (
    value: string, 
    setter: React.Dispatch<React.SetStateAction<number>>,
    min: number = 0,
    max: number = 100
  ) => {
    // Remover caracteres não numéricos, exceto ponto e vírgula
    const cleanValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
    
    // Converter para número
    let numValue = parseFloat(cleanValue);
    
    // Verificar se é um número válido
    if (!isNaN(numValue)) {
      // Limitar ao intervalo
      numValue = Math.min(Math.max(numValue, min), max);
      setter(numValue);
    } else if (value === '') {
      // Permitir campo vazio
      setter(0);
    }
  };
  
  return (
    <PageLayout title="Configuração de Impostos">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Impostos Padrão</CardTitle>
            <CardDescription>
              Configure os valores padrão de impostos para seus orçamentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="iss">ISS (%)</Label>
              <Input 
                id="iss" 
                type="text"
                value={iss.toString()} 
                onChange={(e) => handleNumericInput(e.target.value, setIss)}
                placeholder="Ex: 3"
              />
              <p className="text-xs text-gray-500">
                Imposto Sobre Serviços aplicado a serviços prestados.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pis">PIS (%)</Label>
              <Input 
                id="pis" 
                type="text"
                value={pis.toString()} 
                onChange={(e) => handleNumericInput(e.target.value, setPis)}
                placeholder="Ex: 0.65"
              />
              <p className="text-xs text-gray-500">
                Programa de Integração Social.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cofins">COFINS (%)</Label>
              <Input 
                id="cofins" 
                type="text"
                value={cofins.toString()} 
                onChange={(e) => handleNumericInput(e.target.value, setCofins)}
                placeholder="Ex: 3"
              />
              <p className="text-xs text-gray-500">
                Contribuição para o Financiamento da Seguridade Social.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar configurações"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações sobre Impostos</CardTitle>
            <CardDescription>
              Entenda como os impostos são aplicados nos seus orçamentos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">ISS (Imposto Sobre Serviços)</h4>
                <p className="text-sm text-gray-500">
                  O ISS é um imposto municipal que incide sobre a prestação de serviços. 
                  A alíquota varia de acordo com o município e o tipo de serviço, geralmente entre 2% e 5%.
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">PIS (Programa de Integração Social)</h4>
                <p className="text-sm text-gray-500">
                  O PIS é uma contribuição social que incide sobre o faturamento das empresas.
                  A alíquota padrão é de 0,65% para empresas no regime cumulativo e 1,65% no regime não-cumulativo.
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">COFINS (Contribuição para o Financiamento da Seguridade Social)</h4>
                <p className="text-sm text-gray-500">
                  A COFINS é uma contribuição federal que incide sobre o faturamento das empresas.
                  A alíquota padrão é de 3% para empresas no regime cumulativo e 7,6% no regime não-cumulativo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
