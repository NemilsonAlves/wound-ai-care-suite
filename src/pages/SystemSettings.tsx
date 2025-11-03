import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SuperAdminGuard } from '@/components/common/SuperAdminGuard';
import { 
  Settings, 
  Database, 
  Shield, 
  HardDrive, 
  Zap, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Lock,
  Key,
  Server,
  Wifi,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

interface SystemConfig {
  database: {
    url: string;
    maxConnections: number;
    timeout: number;
    backupEnabled: boolean;
    backupFrequency: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      requireUppercase: boolean;
    };
    twoFactorEnabled: boolean;
  };
  integrations: {
    whatsappEnabled: boolean;
    aiAnalysisEnabled: boolean;
    mercadoPagoEnabled: boolean;
    evolutionApiUrl: string;
    openaiApiKey: string;
  };
  system: {
    maintenanceMode: boolean;
    debugMode: boolean;
    logLevel: string;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
}

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    database: {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      maxConnections: 100,
      timeout: 30000,
      backupEnabled: true,
      backupFrequency: 'daily'
    },
    security: {
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true
      },
      twoFactorEnabled: false
    },
    integrations: {
      whatsappEnabled: true,
      aiAnalysisEnabled: true,
      mercadoPagoEnabled: true,
      evolutionApiUrl: import.meta.env.VITE_EVOLUTION_API_URL || '',
      openaiApiKey: '***************'
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
      maxFileSize: 10485760, // 10MB
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      // Simular backup
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('Backup realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao realizar backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (confirm('Tem certeza que deseja restaurar o backup? Esta ação não pode ser desfeita.')) {
      setIsLoading(true);
      try {
        // Simular restauração
        await new Promise(resolve => setTimeout(resolve, 5000));
        alert('Backup restaurado com sucesso!');
      } catch (error) {
        console.error('Erro ao restaurar backup:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SuperAdminGuard module="system.config">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="w-8 h-8 text-blue-600" />
              Configurações de Sistema
            </h1>
            <p className="text-gray-600 mt-2">
              Configurações críticas e avançadas do sistema - Acesso exclusivo para Super Administradores
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Salvo às {lastSaved.toLocaleTimeString()}
              </Badge>
            )}
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              Salvar Configurações
            </Button>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Estas configurações afetam todo o sistema. 
            Alterações incorretas podem causar instabilidade ou indisponibilidade do serviço.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="database" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Banco de Dados
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Configurações do Banco de Dados
                </CardTitle>
                <CardDescription>
                  Configurações de conexão e performance do Supabase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="db-url">URL do Banco</Label>
                    <Input
                      id="db-url"
                      value={config.database.url}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        database: { ...prev.database, url: e.target.value }
                      }))}
                      placeholder="https://xxx.supabase.co"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-connections">Máximo de Conexões</Label>
                    <Input
                      id="max-connections"
                      type="number"
                      value={config.database.maxConnections}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        database: { ...prev.database, maxConnections: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-gray-600">Realizar backup automático dos dados</p>
                  </div>
                  <Switch
                    checked={config.database.backupEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      database: { ...prev.database, backupEnabled: checked }
                    }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleBackup} variant="outline" disabled={isLoading}>
                    <Download className="w-4 h-4 mr-2" />
                    Fazer Backup Agora
                  </Button>
                  <Button onClick={handleRestore} variant="outline" disabled={isLoading}>
                    <Upload className="w-4 h-4 mr-2" />
                    Restaurar Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription>
                  Políticas de segurança e autenticação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="session-timeout">Timeout de Sessão (segundos)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={config.security.sessionTimeout}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-attempts">Máximo de Tentativas de Login</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      value={config.security.maxLoginAttempts}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Política de Senhas</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Caracteres especiais obrigatórios</span>
                      <Switch
                        checked={config.security.passwordPolicy.requireSpecialChars}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            passwordPolicy: { ...prev.security.passwordPolicy, requireSpecialChars: checked }
                          }
                        }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Números obrigatórios</span>
                      <Switch
                        checked={config.security.passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) => setConfig(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            passwordPolicy: { ...prev.security.passwordPolicy, requireNumbers: checked }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-gray-600">Exigir 2FA para todos os usuários</p>
                  </div>
                  <Switch
                    checked={config.security.twoFactorEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      security: { ...prev.security, twoFactorEnabled: checked }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Integrações Externas
                </CardTitle>
                <CardDescription>
                  Configurações de APIs e serviços externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>WhatsApp Business API</Label>
                      <p className="text-sm text-gray-600">Evolution API para mensagens</p>
                    </div>
                    <Switch
                      checked={config.integrations.whatsappEnabled}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, whatsappEnabled: checked }
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="evolution-url">URL da Evolution API</Label>
                    <Input
                      id="evolution-url"
                      value={config.integrations.evolutionApiUrl}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, evolutionApiUrl: e.target.value }
                      }))}
                      placeholder="https://api.evolution.com"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Análise de IA</Label>
                      <p className="text-sm text-gray-600">OpenAI para análise de imagens</p>
                    </div>
                    <Switch
                      checked={config.integrations.aiAnalysisEnabled}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, aiAnalysisEnabled: checked }
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="openai-key">Chave da API OpenAI</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      value={config.integrations.openaiApiKey}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, openaiApiKey: e.target.value }
                      }))}
                      placeholder="sk-..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>MercadoPago</Label>
                      <p className="text-sm text-gray-600">Gateway de pagamentos</p>
                    </div>
                    <Switch
                      checked={config.integrations.mercadoPagoEnabled}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        integrations: { ...prev.integrations, mercadoPagoEnabled: checked }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription>
                  Configurações gerais e de performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-gray-600">Bloquear acesso para manutenção</p>
                  </div>
                  <Switch
                    checked={config.system.maintenanceMode}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      system: { ...prev.system, maintenanceMode: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Debug</Label>
                    <p className="text-sm text-gray-600">Logs detalhados para desenvolvimento</p>
                  </div>
                  <Switch
                    checked={config.system.debugMode}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      system: { ...prev.system, debugMode: checked }
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="max-file-size">Tamanho Máximo de Arquivo (bytes)</Label>
                  <Input
                    id="max-file-size"
                    type="number"
                    value={config.system.maxFileSize}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      system: { ...prev.system, maxFileSize: parseInt(e.target.value) }
                    }))}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Atual: {(config.system.maxFileSize / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>

                <div>
                  <Label>Tipos de Arquivo Permitidos</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.system.allowedFileTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        .{type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminGuard>
  );
};

export default SystemSettings;