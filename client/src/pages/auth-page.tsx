import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, CheckCircle2 } from 'lucide-react';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading, login, register } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('login');
  const [formLoading, setFormLoading] = useState(false);
  
  // Estado para o formulário de login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Estado para o formulário de registro
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);
  
  // Atualizar dados do formulário de login
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };
  
  // Atualizar dados do formulário de registro
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };
  
  // Enviar formulário de login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    setFormLoading(true);
    try {
      await login(loginData);
    } finally {
      setFormLoading(false);
    }
  };
  
  // Enviar formulário de registro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    // Validar se as senhas coincidem
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Senhas diferentes",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    
    setFormLoading(true);
    try {
      await register(registerData);
    } finally {
      setFormLoading(false);
    }
  };
  
  // Se estiver carregando a autenticação inicial, mostrar loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Seção de destaque */}
          <div className="hidden md:flex flex-col space-y-8 p-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">O</div>
              <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">OrçaFacil</h1>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Simplifique seus <span className="text-blue-600 dark:text-blue-400">orçamentos</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Gerencie seus projetos, clientes e orçamentos em um único lugar. 
                Economize tempo e aumente sua produtividade.
              </p>
              
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 shadow-lg space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tudo o que você precisa para gerenciar seu negócio
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Cadastro completo de clientes e serviços</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Cálculos automáticos de impostos e valores</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Exportação para PDF com layout profissional</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Sincronização em nuvem com acesso de qualquer dispositivo</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Formulário de autenticação */}
          <div className="w-full max-w-md mx-auto">
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-6">
                <div className="flex justify-center mb-2 md:hidden">
                  <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">O</div>
                </div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                  {activeTab === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
                </CardTitle>
                <CardDescription className="text-center text-gray-500 dark:text-gray-400">
                  {activeTab === 'login' 
                    ? 'Acesse sua conta para continuar' 
                    : 'Preencha os dados abaixo para começar'}
                </CardDescription>
              </CardHeader>
              
              <Tabs 
                defaultValue="login" 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login" className="text-sm">Entrar</TabsTrigger>
                  <TabsTrigger value="register" className="text-sm">Criar conta</TabsTrigger>
                </TabsList>
                
                {/* Formulário de Login */}
                <TabsContent value="login">
                  <form onSubmit={handleLoginSubmit}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-sm font-medium">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="login-email"
                            name="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password" className="text-sm font-medium">
                            Senha
                          </Label>
                          <a href="#" className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            Esqueceu a senha?
                          </a>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="login-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        disabled={formLoading}
                      >
                        {formLoading ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                          </span>
                        ) : (
                          'Entrar'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>
                
                {/* Formulário de Registro */}
                <TabsContent value="register">
                  <form onSubmit={handleRegisterSubmit}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name" className="text-sm font-medium">
                          Nome completo
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="register-name"
                            name="name"
                            placeholder="Seu nome completo"
                            value={registerData.name}
                            onChange={handleRegisterChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-sm font-medium">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="register-email"
                            name="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-sm font-medium">
                          Senha
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="register-password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password" className="text-sm font-medium">
                          Confirmar Senha
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="register-confirm-password"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={registerData.confirmPassword}
                            onChange={handleRegisterChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        disabled={formLoading}
                      >
                        {formLoading ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando conta...
                          </span>
                        ) : (
                          'Criar conta'
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </TabsContent>
              </Tabs>
              
              <div className="px-8 pb-8 pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                Ao continuar, você concorda com os{' '}
                <a href="#" className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800">
                  Termos de Serviço
                </a>{' '}
                e{' '}
                <a href="#" className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800">
                  Política de Privacidade
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
