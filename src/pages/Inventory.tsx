import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Bell
} from 'lucide-react';
import { InventoryService } from '@/services/inventoryService';
import { InventoryReport, StockAlert } from '@/types/inventory';
import { InventoryItemsTab } from '@/components/inventory/InventoryItemsTab';
import { CategoriesTab } from '@/components/inventory/CategoriesTab';
import { MovementsTab } from '@/components/inventory/MovementsTab';
import { SuppliersTab } from '@/components/inventory/SuppliersTab';
import PurchaseOrdersTab from '@/components/inventory/PurchaseOrdersTab';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/common/PermissionGuard';

const Inventory: React.FC = () => {
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { canRead, canCreate } = usePermissions();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [reportData, alertsData] = await Promise.all([
        InventoryService.getInventoryReport(),
        InventoryService.getStockAlerts()
      ]);
      setReport(reportData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await InventoryService.markAlertAsRead(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard module="estoque" action="read">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estoque e Insumos</h1>
            <p className="text-gray-600">Gerencie seu inventário, fornecedores e movimentações</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <PermissionGuard module="estoque" action="create">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <Alert key={alert.id} className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="flex justify-between items-center">
                  <span>{alert.message}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAlertAsRead(alert.id)}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
            {alerts.length > 3 && (
              <p className="text-sm text-gray-600 text-center">
                +{alerts.length - 3} alertas adicionais
              </p>
            )}
          </div>
        )}

        {/* Dashboard Cards */}
        {report && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.total_items}</div>
                <p className="text-xs text-muted-foreground">
                  Itens ativos no estoque
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {report.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor do inventário
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {report.low_stock_items}
                </div>
                <p className="text-xs text-muted-foreground">
                  Itens abaixo do mínimo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencimentos</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {report.expired_items + report.expiring_soon_items}
                </div>
                <p className="text-xs text-muted-foreground">
                  {report.expired_items} vencidos, {report.expiring_soon_items} próximos
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resumo por Categorias */}
        {report && report.categories_summary.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Categorias</CardTitle>
              <CardDescription>
                Distribuição do estoque por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {report.categories_summary.map((category) => (
                  <div key={category.category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{category.category}</p>
                      <p className="text-sm text-gray-600">{category.items_count} itens</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        R$ {category.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs de Navegação */}
        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="items">Itens</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            <InventoryItemsTab onDataChange={loadDashboardData} />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTab onDataChange={loadDashboardData} />
          </TabsContent>

          <TabsContent value="movements">
            <MovementsTab onDataChange={loadDashboardData} />
          </TabsContent>

          <TabsContent value="suppliers">
            <SuppliersTab onDataChange={loadDashboardData} />
          </TabsContent>

          <TabsContent value="orders">
            <PurchaseOrdersTab onDataChange={loadDashboardData} />
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  );
};

export default Inventory;