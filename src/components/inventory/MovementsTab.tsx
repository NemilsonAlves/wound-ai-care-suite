import { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw,
  Search,
  Filter
} from 'lucide-react';
import { InventoryService } from '@/services/inventoryService';
import { StockMovement, InventoryItem } from '@/types/inventory';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useAuth } from '@/contexts/AuthContextBase';

interface MovementsTabProps {
  onDataChange: () => void;
}

const MovementsTab = ({ onDataChange }: MovementsTabProps) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({
    item_id: '',
    movement_type: 'entrada' as 'entrada' | 'saida' | 'ajuste' | 'transferencia',
    quantity: 0,
    unit_cost: 0,
    reason: '',
    batch_number: '',
    expiration_date: '',
    supplier_id: ''
  });
  const { canCreate } = usePermissions();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movementsData, itemsData] = await Promise.all([
        InventoryService.getStockMovements(),
        InventoryService.getInventoryItems()
      ]);
      setMovements(movementsData);
      setItems(itemsData);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const movementData = {
        ...formData,
        user_id: user?.id || '',
        total_cost: formData.quantity * formData.unit_cost,
        expiration_date: formData.expiration_date || undefined
      };

      await InventoryService.createStockMovement(movementData);
      
      await loadData();
      onDataChange();
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      item_id: '',
      movement_type: 'entrada',
      quantity: 0,
      unit_cost: 0,
      reason: '',
      batch_number: '',
      expiration_date: '',
      supplier_id: ''
    });
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'saida':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'ajuste':
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default:
        return <RotateCcw className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    const configs = {
      entrada: { label: 'Entrada', className: 'bg-green-100 text-green-800' },
      saida: { label: 'Saída', className: 'bg-red-100 text-red-800' },
      ajuste: { label: 'Ajuste', className: 'bg-blue-100 text-blue-800' },
      transferencia: { label: 'Transferência', className: 'bg-purple-100 text-purple-800' }
    };
    
    const config = configs[type as keyof typeof configs] || configs.ajuste;
    
    return (
      <Badge className={config.className}>
        {getMovementIcon(type)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.batch_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || movement.movement_type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando movimentações...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Movimentações de Estoque</CardTitle>
            <CardDescription>
              Histórico de entradas, saídas e ajustes de estoque
            </CardDescription>
          </div>
          <PermissionGuard module="estoque" action="create">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Movimentação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Movimentação</DialogTitle>
                  <DialogDescription>
                    Registre uma nova movimentação de estoque
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveMovement} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Item */}
                    <div className="md:col-span-2">
                      <Label htmlFor="item_id">Item *</Label>
                      <select
                        id="item_id"
                        value={formData.item_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, item_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione um item</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} - Estoque atual: {item.current_stock} {item.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tipo de Movimentação */}
                    <div>
                      <Label htmlFor="movement_type">Tipo de Movimentação *</Label>
                      <select
                        id="movement_type"
                        value={formData.movement_type}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
        movement_type: e.target.value as string
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="entrada">Entrada</option>
                        <option value="saida">Saída</option>
                        <option value="ajuste">Ajuste</option>
                        <option value="transferencia">Transferência</option>
                      </select>
                    </div>

                    {/* Quantidade */}
                    <div>
                      <Label htmlFor="quantity">
                        Quantidade * 
                        {formData.movement_type === 'ajuste' && ' (Novo total)'}
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          quantity: parseFloat(e.target.value) || 0 
                        }))}
                        required
                      />
                    </div>

                    {/* Custo Unitário */}
                    {(formData.movement_type === 'entrada' || formData.movement_type === 'ajuste') && (
                      <div>
                        <Label htmlFor="unit_cost">Custo Unitário (R$)</Label>
                        <Input
                          id="unit_cost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.unit_cost}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            unit_cost: parseFloat(e.target.value) || 0 
                          }))}
                        />
                      </div>
                    )}

                    {/* Número do Lote */}
                    <div>
                      <Label htmlFor="batch_number">Número do Lote</Label>
                      <Input
                        id="batch_number"
                        value={formData.batch_number}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          batch_number: e.target.value 
                        }))}
                        placeholder="Número do lote"
                      />
                    </div>

                    {/* Data de Vencimento */}
                    <div>
                      <Label htmlFor="expiration_date">Data de Vencimento</Label>
                      <Input
                        id="expiration_date"
                        type="date"
                        value={formData.expiration_date}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          expiration_date: e.target.value 
                        }))}
                      />
                    </div>

                    {/* Motivo */}
                    <div className="md:col-span-2">
                      <Label htmlFor="reason">Motivo/Observações *</Label>
                      <Textarea
                        id="reason"
                        value={formData.reason}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          reason: e.target.value 
                        }))}
                        placeholder="Descreva o motivo da movimentação"
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsFormOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Registrar Movimentação
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por motivo ou lote..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os tipos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
            <option value="ajuste">Ajuste</option>
            <option value="transferencia">Transferência</option>
          </select>
        </div>

        {/* Tabela de Movimentações */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Usuário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(movement.created_at).toLocaleDateString('pt-BR')}</div>
                      <div className="text-gray-500">
                        {new Date(movement.created_at).toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{movement.item?.name}</div>
                  </TableCell>
                  <TableCell>
                    {getMovementBadge(movement.movement_type)}
                  </TableCell>
                  <TableCell>
                    <span className={
                      movement.movement_type === 'entrada' ? 'text-green-600' :
                      movement.movement_type === 'saida' ? 'text-red-600' :
                      'text-blue-600'
                    }>
                      {movement.movement_type === 'entrada' ? '+' : 
                       movement.movement_type === 'saida' ? '-' : ''}
                      {movement.quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    {movement.total_cost ? (
                      <span>R$ {movement.total_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {movement.batch_number || <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={movement.reason}>
                      {movement.reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{movement.user?.full_name}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredMovements.length === 0 && (
          <div className="text-center py-8">
            <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || selectedType 
                ? 'Nenhuma movimentação encontrada com os filtros aplicados'
                : 'Nenhuma movimentação registrada ainda'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default memo(MovementsTab);
export { MovementsTab };
