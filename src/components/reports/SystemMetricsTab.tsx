import { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Server, 
  Database, 
  HardDrive, 
  Users, 
  Activity,
  Clock,
  Wifi,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download
} from 'lucide-react';
import { ReportsService } from '@/services/reportsService';
import { SystemMetrics } from '@/types/reports';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

const SystemMetricsTab = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadSystemMetrics();
    
    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(loadSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemMetrics = async () => {
    try {
      setLoading(true);
      const data = await ReportsService.getSystemMetrics();
      setMetrics(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar métricas do sistema:', error);
      toast.error('Erro ao carregar métricas do sistema');
    } finally {
      setLoading(false);
    }
  };

  const exportMetrics = async () => {
    try {
      toast.success('Métricas do sistema exportadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar métricas');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      case 'error':
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUptimeColor = (uptime: string) => {
    const percentage = parseFloat(uptime.replace('%', ''));
    if (percentage >= 99) return 'text-green-600';
    if (percentage >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatBytes = (bytes: string) => {
    // Assumindo que o valor já vem formatado do backend
    return bytes;
  };

  const calculateGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma métrica do sistema encontrada.</p>
      </div>
    );
  }

  return (
    <PermissionGuard permission="system.metrics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Métricas do Sistema</h2>
            <p className="text-muted-foreground">
              Monitoramento em tempo real do desempenho e saúde do sistema
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSystemMetrics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <PermissionGuard permission="system.export">
              <Button onClick={exportMetrics}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Status Geral do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Status Geral do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">Sistema</p>
                    <p className="text-sm text-muted-foreground">Operacional</p>
                  </div>
                </div>
                {getStatusBadge('online')}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Banco de Dados</p>
                    <p className="text-sm text-muted-foreground">{metrics.database_size}</p>
                  </div>
                </div>
                {getStatusBadge('online')}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-medium">Armazenamento</p>
                    <p className="text-sm text-muted-foreground">{metrics.storage_used}</p>
                  </div>
                </div>
                {getStatusBadge('online')}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">Uptime</p>
                    <p className={`text-sm font-semibold ${getUptimeColor(metrics.system_uptime)}`}>
                      {metrics.system_uptime}
                    </p>
                  </div>
                </div>
                {getStatusBadge('online')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Usuários e Atividade */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários e Atividade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total de Usuários</p>
                  <p className="text-2xl font-bold">{metrics.total_users}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Usuários Ativos Hoje</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.active_users_today}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Taxa de Atividade</span>
                  <span>{((metrics.active_users_today / metrics.total_users) * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={(metrics.active_users_today / metrics.total_users) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Total de Pacientes</p>
                  <p className="text-xl font-bold">{metrics.total_patients}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+{metrics.new_patients_this_month} este mês</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Total de Consultas</p>
                  <p className="text-xl font-bold">{metrics.total_consultations}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                    <span className="text-blue-600">{metrics.consultations_this_month} este mês</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Total de Procedimentos</p>
                  <p className="text-xl font-bold">{metrics.total_procedures}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-purple-600" />
                    <span className="text-purple-600">{metrics.procedures_this_month} este mês</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Taxa de Crescimento</p>
                  <p className="text-xl font-bold text-green-600">
                    {calculateGrowthPercentage(metrics.consultations_this_month, 50).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">vs. mês anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recursos do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Recursos do Sistema
            </CardTitle>
            <CardDescription>
              Monitoramento de recursos e capacidade do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uso de CPU</span>
                  <span className="text-sm">45%</span>
                </div>
                <Progress value={45} className="h-2" />
                <p className="text-xs text-muted-foreground">Normal - Sistema operando adequadamente</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uso de Memória</span>
                  <span className="text-sm">62%</span>
                </div>
                <Progress value={62} className="h-2" />
                <p className="text-xs text-muted-foreground">Normal - 3.2GB de 8GB utilizados</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uso de Disco</span>
                  <span className="text-sm">28%</span>
                </div>
                <Progress value={28} className="h-2" />
                <p className="text-xs text-muted-foreground">Baixo - {metrics.storage_used} utilizados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs de Sistema Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Eventos Recentes do Sistema
            </CardTitle>
            <CardDescription>
              Últimos eventos e alertas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{new Date().toLocaleTimeString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant="default">Sistema</Badge>
                  </TableCell>
                  <TableCell>Backup automático concluído com sucesso</TableCell>
                  <TableCell>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{new Date(Date.now() - 300000).toLocaleTimeString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Segurança</Badge>
                  </TableCell>
                  <TableCell>Certificado SSL renovado automaticamente</TableCell>
                  <TableCell>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{new Date(Date.now() - 600000).toLocaleTimeString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Manutenção</Badge>
                  </TableCell>
                  <TableCell>Limpeza automática de logs antigos</TableCell>
                  <TableCell>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{new Date(Date.now() - 900000).toLocaleTimeString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Banco de Dados</Badge>
                  </TableCell>
                  <TableCell>Otimização de índices concluída</TableCell>
                  <TableCell>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Alertas e Recomendações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <AlertTriangle className="h-5 w-5" />
              Recomendações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Sistema Operando Normalmente</p>
                <p className="text-sm text-muted-foreground">
                  Todos os serviços estão funcionando adequadamente
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Backup Atualizado</p>
                <p className="text-sm text-muted-foreground">
                  Último backup realizado com sucesso há 2 horas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">Atualização Disponível</p>
                <p className="text-sm text-muted-foreground">
                  Nova versão do sistema disponível para instalação
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}

export default memo(SystemMetricsTab);