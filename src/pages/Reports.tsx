import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Users, 
  Calendar, 
  DollarSign, 
  Package, 
  Activity,
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { ReportsService } from '@/services/reportsService';
import { DashboardMetrics } from '@/types/reports';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

// Importar componentes das abas (serão criados)
import { ClinicalReportsTab } from '@/components/reports/ClinicalReportsTab';
import { InventoryReportsTab } from '@/components/reports/InventoryReportsTab';
import { AuditLogsTab } from '@/components/reports/AuditLogsTab';
import { SystemMetricsTab } from '@/components/reports/SystemMetricsTab';

export function Reports() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadDashboardMetrics();
  }, []);

  const loadDashboardMetrics = async () => {
    try {
      setLoading(true);
      const data = await ReportsService.getDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      toast.error('Erro ao carregar métricas do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span>{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <PermissionGuard permission="reports.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios e Auditoria</h1>
            <p className="text-muted-foreground">
              Visualize relatórios clínicos, financeiros e de auditoria do sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadDashboardMetrics}>
              <Activity className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <PermissionGuard permission="reports.export">
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="clinical">Relatórios Clínicos</TabsTrigger>
            <TabsTrigger value="inventory">Relatórios de Estoque</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
            <TabsTrigger value="metrics">Métricas do Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Cards de Métricas Principais */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.patients.total || 0}</div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      +{metrics?.patients.new_this_month || 0} este mês
                    </p>
                    {metrics?.patients.growth_percentage !== undefined && 
                      formatPercentage(metrics.patients.growth_percentage)
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consultas</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.consultations.total || 0}</div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {metrics?.consultations.this_month || 0} este mês
                    </p>
                    {metrics?.consultations.growth_percentage !== undefined && 
                      formatPercentage(metrics.consultations.growth_percentage)
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics?.revenue.total || 0)}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(metrics?.revenue.this_month || 0)} este mês
                    </p>
                    {metrics?.revenue.growth_percentage !== undefined && 
                      formatPercentage(metrics.revenue.growth_percentage)
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Procedimentos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.procedures.total || 0}</div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {metrics?.procedures.this_month || 0} este mês
                    </p>
                    {metrics?.procedures.growth_percentage !== undefined && 
                      formatPercentage(metrics.procedures.growth_percentage)
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumo de Relatórios Disponíveis */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Relatórios Clínicos
                  </CardTitle>
                  <CardDescription>
                    Relatórios de pacientes, consultas e procedimentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Relatório de Pacientes</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('clinical')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Relatório de Consultas</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('clinical')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Relatório de Procedimentos</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('clinical')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Relatório Financeiro</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('clinical')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Relatórios de Estoque
                  </CardTitle>
                  <CardDescription>
                    Relatórios de inventário, movimentações e custos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Relatório de Inventário</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('inventory')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Movimentações de Estoque</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('inventory')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Análise de Custos</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('inventory')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1">
                      Alertas de Estoque
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('inventory')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas e Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Alertas do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Existem itens de estoque com quantidade baixa que precisam de reposição.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Alguns itens do estoque estão próximos do vencimento.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clinical">
            <ClinicalReportsTab />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryReportsTab />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogsTab />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <SystemMetricsTab />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}