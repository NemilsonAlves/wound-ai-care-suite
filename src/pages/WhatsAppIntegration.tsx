import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { 
  MessageCircle, 
  Smartphone, 
  QrCode, 
  Send, 
  CheckCircle, 
  XCircle,
  Settings,
  Bell,
  Users,
  Activity,
  AlertTriangle
} from 'lucide-react';
import WhatsAppService from '../services/whatsappService';

interface NotificationSettings {
  appointmentReminders: boolean;
  woundUpdates: boolean;
  paymentConfirmations: boolean;
  emergencyAlerts: boolean;
  welcomeMessages: boolean;
}

const WhatsAppIntegration: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    appointmentReminders: true,
    woundUpdates: true,
    paymentConfirmations: true,
    emergencyAlerts: true,
    welcomeMessages: true
  });

  const [stats, setStats] = useState({
    messagesSent: 0,
    messagesDelivered: 0,
    activeContacts: 0,
    lastActivity: null as string | null
  });

  useEffect(() => {
    checkConnection();
    loadStats();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      const connected = await WhatsAppService.checkConnection();
      setIsConnected(connected);
      setConnectionStatus(connected ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      setConnectionStatus('disconnected');
    }
  };

  const loadStats = () => {
    // Simular carregamento de estatísticas
    setStats({
      messagesSent: 1247,
      messagesDelivered: 1198,
      activeContacts: 89,
      lastActivity: new Date().toISOString()
    });
  };

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const qr = await WhatsAppService.getQRCode();
      setQrCode(qr);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      alert('Erro ao gerar QR Code. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    setLoading(true);
    try {
      await WhatsAppService.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setQrCode(null);
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      alert('Erro ao desconectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      alert('Preencha o telefone e a mensagem de teste.');
      return;
    }

    setLoading(true);
    try {
      const success = await WhatsAppService.sendTextMessage(testPhone, testMessage);
      if (success) {
        alert('Mensagem enviada com sucesso!');
        setTestMessage('');
      } else {
        alert('Erro ao enviar mensagem. Verifique o número e tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem.');
    } finally {
      setLoading(false);
    }
  };

  const sendWelcomeMessage = async () => {
    if (!testPhone) {
      alert('Preencha o telefone para enviar mensagem de boas-vindas.');
      return;
    }

    setLoading(true);
    try {
      const success = await WhatsAppService.sendWelcomeMessage('Paciente Teste', testPhone);
      if (success) {
        alert('Mensagem de boas-vindas enviada!');
      } else {
        alert('Erro ao enviar mensagem de boas-vindas.');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem.');
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disconnected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-yellow-500 animate-pulse" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Integração WhatsApp</h1>
            <p className="text-muted-foreground">
              Configure e gerencie as notificações via WhatsApp
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {connectionStatus === 'checking' ? 'Verificando...' : 
               connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connection">Conexão</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="test">Teste</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Status da Conexão
                </CardTitle>
                <CardDescription>
                  Gerencie a conexão com o WhatsApp Business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-medium">WhatsApp Business</h3>
                      <p className="text-sm text-muted-foreground">
                        Evolution API Integration
                      </p>
                    </div>
                  </div>
                  <Badge variant={isConnected ? 'default' : 'secondary'}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={checkConnection}
                    variant="outline"
                    disabled={loading}
                  >
                    Verificar Conexão
                  </Button>
                  
                  {!isConnected && (
                    <Button 
                      onClick={generateQRCode}
                      disabled={loading}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Gerar QR Code
                    </Button>
                  )}
                  
                  {isConnected && (
                    <Button 
                      onClick={disconnect}
                      variant="destructive"
                      disabled={loading}
                    >
                      Desconectar
                    </Button>
                  )}
                </div>

                {qrCode && (
                  <div className="text-center p-6 border rounded-lg">
                    <h3 className="font-medium mb-4">Escaneie o QR Code</h3>
                    <div className="flex justify-center mb-4">
                      <img 
                        src={`data:image/png;base64,${qrCode}`} 
                        alt="QR Code WhatsApp"
                        className="w-64 h-64 border rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Abra o WhatsApp no seu celular e escaneie este código
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Configurações de Notificação
                </CardTitle>
                <CardDescription>
                  Configure quais tipos de notificação serão enviadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="appointment-reminders">Lembretes de Consulta</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar lembretes automáticos de consultas agendadas
                      </p>
                    </div>
                    <Switch
                      id="appointment-reminders"
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={(checked) => updateNotificationSetting('appointmentReminders', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="wound-updates">Atualizações de Feridas</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar sobre novas evoluções e fotos
                      </p>
                    </div>
                    <Switch
                      id="wound-updates"
                      checked={notificationSettings.woundUpdates}
                      onCheckedChange={(checked) => updateNotificationSetting('woundUpdates', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="payment-confirmations">Confirmações de Pagamento</Label>
                      <p className="text-sm text-muted-foreground">
                        Confirmar pagamentos processados
                      </p>
                    </div>
                    <Switch
                      id="payment-confirmations"
                      checked={notificationSettings.paymentConfirmations}
                      onCheckedChange={(checked) => updateNotificationSetting('paymentConfirmations', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emergency-alerts">Alertas de Emergência</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar alertas para situações críticas
                      </p>
                    </div>
                    <Switch
                      id="emergency-alerts"
                      checked={notificationSettings.emergencyAlerts}
                      onCheckedChange={(checked) => updateNotificationSetting('emergencyAlerts', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="welcome-messages">Mensagens de Boas-vindas</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar mensagem de boas-vindas para novos pacientes
                      </p>
                    </div>
                    <Switch
                      id="welcome-messages"
                      checked={notificationSettings.welcomeMessages}
                      onCheckedChange={(checked) => updateNotificationSetting('welcomeMessages', checked)}
                    />
                  </div>
                </div>

                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Teste de Mensagens
                </CardTitle>
                <CardDescription>
                  Envie mensagens de teste para verificar a integração
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="test-phone">Número de Telefone</Label>
                  <Input
                    id="test-phone"
                    placeholder="(11) 99999-9999"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="test-message">Mensagem de Teste</Label>
                  <Textarea
                    id="test-message"
                    placeholder="Digite sua mensagem de teste..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={sendTestMessage}
                    disabled={loading || !isConnected}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Teste
                  </Button>
                  
                  <Button 
                    onClick={sendWelcomeMessage}
                    disabled={loading || !isConnected}
                    variant="outline"
                    className="flex-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Boas-vindas
                  </Button>
                </div>

                {!isConnected && (
                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      WhatsApp não conectado. Conecte primeiro para enviar mensagens.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Mensagens Enviadas
                  </CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.messagesSent.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de mensagens enviadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Taxa de Entrega
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {((stats.messagesDelivered / stats.messagesSent) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.messagesDelivered} de {stats.messagesSent} entregues
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Contatos Ativos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeContacts}</div>
                  <p className="text-xs text-muted-foreground">
                    Pacientes com WhatsApp ativo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Última Atividade
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Agora</div>
                  <p className="text-xs text-muted-foreground">
                    Sistema ativo e funcionando
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Mensagens</CardTitle>
                <CardDescription>
                  Últimas mensagens enviadas pelo sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Lembrete', recipient: '(11) 99999-9999', time: '2 min atrás', status: 'Entregue' },
                    { type: 'Boas-vindas', recipient: '(11) 88888-8888', time: '15 min atrás', status: 'Entregue' },
                    { type: 'Atualização', recipient: '(11) 77777-7777', time: '1h atrás', status: 'Entregue' },
                    { type: 'Pagamento', recipient: '(11) 66666-6666', time: '2h atrás', status: 'Entregue' }
                  ].map((message, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{message.type}</Badge>
                        <span className="font-medium">{message.recipient}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{message.time}</span>
                        <Badge variant="default" className="text-xs">
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WhatsAppIntegration;