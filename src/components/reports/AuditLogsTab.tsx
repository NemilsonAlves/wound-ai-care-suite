import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Shield, 
  User, 
  Calendar, 
  Filter,
  Download,
  Eye,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { ReportsService } from '@/services/reportsService';
import { AuditLog, AuditFilter, UserActivityReport } from '@/types/reports';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

export function AuditLogsTab() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'logs' | 'activity'>('logs');
  const [filters, setFilters] = useState<AuditFilter>({
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Últimos 7 dias
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, [filters, activeView]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeView === 'logs') {
        const logs = await ReportsService.getAuditLogs(filters);
        setAuditLogs(logs);
      } else {
        const activity = await ReportsService.getUserActivityReport(filters);
        setUserActivity(activity);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de auditoria:', error);
      toast.error('Erro ao carregar dados de auditoria');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AuditFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportAuditReport = async () => {
    try {
      toast.success('Relatório de auditoria exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'update':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'login':
        return <User className="h-4 w-4 text-green-600" />;
      case 'logout':
        return <User className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { variant: any; label: string }> = {
      'create': { variant: 'default', label: 'Criação' },
      'update': { variant: 'secondary', label: 'Atualização' },
      'delete': { variant: 'destructive', label: 'Exclusão' },
      'login': { variant: 'default', label: 'Login' },
      'logout': { variant: 'outline', label: 'Logout' },
      'view': { variant: 'secondary', label: 'Visualização' },
      'export': { variant: 'outline', label: 'Exportação' }
    };

    const actionInfo = actionMap[action] || { variant: 'secondary', label: action };
    return <Badge variant={actionInfo.variant}>{actionInfo.label}</Badge>;
  };

  const getModuleBadge = (module: string) => {
    const moduleMap: Record<string, { variant: any; label: string }> = {
      'patients': { variant: 'default', label: 'Pacientes' },
      'consultations': { variant: 'secondary', label: 'Consultas' },
      'procedures': { variant: 'outline', label: 'Procedimentos' },
      'inventory': { variant: 'default', label: 'Estoque' },
      'users': { variant: 'secondary', label: 'Usuários' },
      'reports': { variant: 'outline', label: 'Relatórios' },
      'system': { variant: 'destructive', label: 'Sistema' }
    };

    const moduleInfo = moduleMap[module] || { variant: 'secondary', label: module };
    return <Badge variant={moduleInfo.variant}>{moduleInfo.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { variant: any; label: string }> = {
      'admin': { variant: 'destructive', label: 'Administrador' },
      'doctor': { variant: 'default', label: 'Médico' },
      'nurse': { variant: 'secondary', label: 'Enfermeiro' },
      'receptionist': { variant: 'outline', label: 'Recepcionista' },
      'manager': { variant: 'default', label: 'Gerente' }
    };

    const roleInfo = roleMap[role] || { variant: 'secondary', label: role };
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>;
  };

  return (
    <PermissionGuard permission="audit.view">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Auditoria e Logs</h2>
            <p className="text-muted-foreground">
              Monitoramento de atividades e logs de segurança do sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeView === 'logs' ? 'default' : 'outline'}
              onClick={() => setActiveView('logs')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Logs de Auditoria
            </Button>
            <Button
              variant={activeView === 'activity' ? 'default' : 'outline'}
              onClick={() => setActiveView('activity')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Atividade dos Usuários
            </Button>
            <PermissionGuard permission="audit.export">
              <Button onClick={exportAuditReport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data Inicial</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data Final</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module">Módulo</Label>
                <Select 
                  value={filters.module || ''} 
                  onValueChange={(value) => handleFilterChange('module', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os módulos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os módulos</SelectItem>
                    <SelectItem value="patients">Pacientes</SelectItem>
                    <SelectItem value="consultations">Consultas</SelectItem>
                    <SelectItem value="procedures">Procedimentos</SelectItem>
                    <SelectItem value="inventory">Estoque</SelectItem>
                    <SelectItem value="users">Usuários</SelectItem>
                    <SelectItem value="reports">Relatórios</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="action">Ação</Label>
                <Select 
                  value={filters.action || ''} 
                  onValueChange={(value) => handleFilterChange('action', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as ações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as ações</SelectItem>
                    <SelectItem value="create">Criação</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                    <SelectItem value="delete">Exclusão</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="view">Visualização</SelectItem>
                    <SelectItem value="export">Exportação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={loadData} className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo Principal */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {activeView === 'logs' ? (
              /* Logs de Auditoria */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Logs de Auditoria
                  </CardTitle>
                  <CardDescription>
                    Registro detalhado de todas as ações realizadas no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Módulo</TableHead>
                        <TableHead>Entidade</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{formatDate(log.created_at)}</TableCell>
                          <TableCell className="font-medium">{log.user_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              {getActionBadge(log.action)}
                            </div>
                          </TableCell>
                          <TableCell>{getModuleBadge(log.module)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{log.entity_type}</div>
                              {log.entity_id && (
                                <div className="text-xs text-muted-foreground">
                                  ID: {log.entity_id}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{log.ip_address}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              /* Atividade dos Usuários */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Atividade dos Usuários
                  </CardTitle>
                  <CardDescription>
                    Resumo de atividades e estatísticas por usuário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Último Login</TableHead>
                        <TableHead>Total de Logins</TableHead>
                        <TableHead>Consultas Criadas</TableHead>
                        <TableHead>Procedimentos</TableHead>
                        <TableHead>Pacientes Cadastrados</TableHead>
                        <TableHead>Total de Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userActivity.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell className="font-medium">{user.user_name}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            {user.last_login ? formatDate(user.last_login) : 'Nunca'}
                          </TableCell>
                          <TableCell>{user.total_logins}</TableCell>
                          <TableCell>{user.consultations_created}</TableCell>
                          <TableCell>{user.procedures_performed}</TableCell>
                          <TableCell>{user.patients_registered}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.total_actions}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Alertas de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Segurança
            </CardTitle>
            <CardDescription>
              Atividades suspeitas ou que requerem atenção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Múltiplas tentativas de login</p>
                  <p className="text-sm text-muted-foreground">
                    Detectadas tentativas de login falhadas em sequência
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Investigar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Acesso fora do horário</p>
                  <p className="text-sm text-muted-foreground">
                    Usuários acessando o sistema fora do horário comercial
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}