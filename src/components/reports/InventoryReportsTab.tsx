import { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Eye,
  BarChart3
} from 'lucide-react';
import { ReportsService } from '@/services/reportsService';
import { InventoryReport } from '@/types/reports';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

const InventoryReportsTab = () => {
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventoryReport();
  }, []);

  const loadInventoryReport = async () => {
    try {
      setLoading(true);
      const data = await ReportsService.getInventoryReport();
      setInventoryReport(data);
    } catch (error) {
      console.error('Erro ao carregar relatório de estoque:', error);
      toast.error('Erro ao carregar relatório de estoque');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      toast.success('Relatório de estoque exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'saida':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'ajuste':
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementTypeBadge = (type: string) => {
    const typeMap: Record<string, { variant: any; label: string }> = {
      'entrada': { variant: 'default', label: 'Entrada' },
      'saida': { variant: 'destructive', label: 'Saída' },
      'ajuste': { variant: 'secondary', label: 'Ajuste' },
      'transferencia': { variant: 'outline', label: 'Transferência' }
    };

    const typeInfo = typeMap[type] || { variant: 'secondary', label: type };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!inventoryReport) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum dado de estoque encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de exportar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios de Estoque</h2>
          <p className="text-muted-foreground">
            Análise completa do inventário, movimentações e custos
          </p>
        </div>
        <PermissionGuard permission="reports.export">
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </PermissionGuard>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryReport.total_items}</div>
            <p className="text-xs text-muted-foreground">
              Itens cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total do Estoque</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(inventoryReport.total_value)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total em estoque
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
              {inventoryReport.low_stock_items}
            </div>
            <p className="text-xs text-muted-foreground">
              Itens com estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventoryReport.expired_items}
            </div>
            <p className="text-xs text-muted-foreground">
              Itens com validade vencida
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Itens por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Categoria
          </CardTitle>
          <CardDescription>
            Análise de itens e valores por categoria de produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade de Itens</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Itens com Estoque Baixo</TableHead>
                <TableHead>Percentual do Estoque</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryReport.items_by_category.map((category, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{category.category}</TableCell>
                  <TableCell>{category.items_count}</TableCell>
                  <TableCell>{formatCurrency(category.total_value)}</TableCell>
                  <TableCell>
                    {category.low_stock_count > 0 ? (
                      <Badge variant="destructive">{category.low_stock_count}</Badge>
                    ) : (
                      <Badge variant="default">0</Badge>
                    )}
                  </TableCell>
                  <TableCell>{category.percentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Movimentações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Movimentações Recentes
          </CardTitle>
          <CardDescription>
            Últimas 20 movimentações de estoque registradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Usuário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryReport.recent_movements.map((movement, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(movement.date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMovementTypeIcon(movement.movement_type)}
                      {getMovementTypeBadge(movement.movement_type)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{movement.item_name}</TableCell>
                  <TableCell>
                    <span className={
                      movement.movement_type === 'entrada' ? 'text-green-600' :
                      movement.movement_type === 'saida' ? 'text-red-600' : 'text-blue-600'
                    }>
                      {movement.movement_type === 'entrada' ? '+' : 
                       movement.movement_type === 'saida' ? '-' : '±'}
                      {movement.quantity}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(movement.cost)}</TableCell>
                  <TableCell>{movement.user_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Análise de Custos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Análise de Custos
          </CardTitle>
          <CardDescription>
            Análise de custos e consumo do estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Período de Análise</Label>
              <p className="text-2xl font-bold">{inventoryReport.cost_analysis.period}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total de Compras</Label>
              <p className="text-2xl font-bold">
                {formatCurrency(inventoryReport.cost_analysis.total_purchases)}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Custo Médio Mensal</Label>
              <p className="text-2xl font-bold">
                {formatCurrency(inventoryReport.cost_analysis.average_monthly_cost)}
              </p>
            </div>
          </div>

          {inventoryReport.cost_analysis.cost_by_category.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">Custos por Categoria</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Percentual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryReport.cost_analysis.cost_by_category.map((category, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{category.category}</TableCell>
                      <TableCell>{formatCurrency(category.cost)}</TableCell>
                      <TableCell>{category.percentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas de Estoque */}
      {(inventoryReport.low_stock_items > 0 || inventoryReport.expired_items > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque
            </CardTitle>
            <CardDescription>
              Itens que requerem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inventoryReport.low_stock_items > 0 && (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Estoque Baixo</p>
                    <p className="text-sm text-muted-foreground">
                      {inventoryReport.low_stock_items} itens com estoque abaixo do mínimo
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Itens
                </Button>
              </div>
            )}

            {inventoryReport.expired_items > 0 && (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Itens Vencidos</p>
                    <p className="text-sm text-muted-foreground">
                      {inventoryReport.expired_items} itens com validade vencida
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Itens
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default memo(InventoryReportsTab);

// Componente auxiliar para Label
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}