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
  Edit, 
  Trash2, 
  Search,
  ShoppingCart,
  Package,
  Calendar,
  DollarSign,
  Eye,
  Check,
  X
} from 'lucide-react';
import { InventoryService } from '@/services/inventoryService';
import { PurchaseOrder, PurchaseOrderItem, Supplier, InventoryItem } from '@/types/inventory';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useAuth } from '@/contexts/AuthContextBase';

interface PurchaseOrdersTabProps {
  onDataChange: () => void;
}

const PurchaseOrdersTab = ({ onDataChange }: PurchaseOrdersTabProps) => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [formData, setFormData] = useState({
    supplier_id: '',
    expected_delivery_date: '',
    notes: '',
    status: 'pendente' as 'pendente' | 'aprovado' | 'enviado' | 'recebido' | 'cancelado'
  });
  const { canEdit, canDelete } = usePermissions();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, suppliersData, itemsData] = await Promise.all([
        InventoryService.getPurchaseOrders(),
        InventoryService.getSuppliers(),
        InventoryService.getInventoryItems()
      ]);
      setOrders(ordersData);
      setSuppliers(suppliersData);
      setItems(itemsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderItems.length === 0) {
      alert('Adicione pelo menos um item ao pedido');
      return;
    }

    try {
      const orderData = {
        ...formData,
        user_id: user?.id || '',
        total_amount: orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0)
      };

      let orderId: string;
      
      if (editingOrder) {
        await InventoryService.updatePurchaseOrder(editingOrder.id, orderData);
        orderId = editingOrder.id;
      } else {
        const newOrder = await InventoryService.createPurchaseOrder(orderData);
        orderId = newOrder.id;
      }

      // Salvar itens do pedido
      for (const item of orderItems) {
        if (item.id && editingOrder) {
          await InventoryService.updatePurchaseOrderItem(item.id, {
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.quantity * item.unit_cost
          });
        } else {
          await InventoryService.createPurchaseOrderItem({
            purchase_order_id: orderId,
            item_id: item.item_id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.quantity * item.unit_cost
          });
        }
      }
      
      await loadData();
      onDataChange();
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
    }
  };

  const handleEditOrder = async (order: PurchaseOrder) => {
    setEditingOrder(order);
    setFormData({
      supplier_id: order.supplier_id,
      expected_delivery_date: order.expected_delivery_date ? 
        new Date(order.expected_delivery_date).toISOString().split('T')[0] : '',
      notes: order.notes || '',
      status: order.status
    });

    // Carregar itens do pedido
    try {
      const orderItems = await InventoryService.getPurchaseOrderItems(order.id);
      setOrderItems(orderItems);
    } catch (error) {
      console.error('Erro ao carregar itens do pedido:', error);
      setOrderItems([]);
    }

    setIsFormOpen(true);
  };

  const handleViewOrder = async (order: PurchaseOrder) => {
    setViewingOrder(order);
    
    try {
      const orderItems = await InventoryService.getPurchaseOrderItems(order.id);
      setOrderItems(orderItems);
    } catch (error) {
      console.error('Erro ao carregar itens do pedido:', error);
      setOrderItems([]);
    }

    setIsViewOpen(true);
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await InventoryService.deletePurchaseOrder(id);
        await loadData();
        onDataChange();
      } catch (error) {
        console.error('Erro ao excluir pedido:', error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await InventoryService.updatePurchaseOrder(orderId, { status });
      await loadData();
      onDataChange();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const addOrderItem = () => {
    setOrderItems(prev => [...prev, {
      id: '',
      purchase_order_id: '',
      item_id: '',
      quantity: 1,
      unit_cost: 0,
      total_cost: 0,
      item: null
    }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: string, value: string | number | null) => {
    setOrderItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updated = { ...item, [field]: value };
        if (field === 'item_id') {
          const selectedItem = items.find(it => it.id === value);
          updated.item = selectedItem || null;
        }
        if (field === 'quantity' || field === 'unit_cost') {
          updated.total_cost = updated.quantity * updated.unit_cost;
        }
        return updated;
      }
      return item;
    }));
  };

  const resetForm = () => {
    setEditingOrder(null);
    setOrderItems([]);
    setFormData({
      supplier_id: '',
      expected_delivery_date: '',
      notes: '',
      status: 'pendente'
    });
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      aprovado: { label: 'Aprovado', className: 'bg-blue-100 text-blue-800' },
      enviado: { label: 'Enviado', className: 'bg-purple-100 text-purple-800' },
      recebido: { label: 'Recebido', className: 'bg-green-100 text-green-800' },
      cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-800' }
    };
    
    const config = configs[status as keyof typeof configs] || configs.pendente;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Pedidos de Compra</CardTitle>
            <CardDescription>
              Gerencie pedidos de compra de produtos e insumos
            </CardDescription>
          </div>
          <PermissionGuard module="estoque" action="create">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingOrder ? 'Editar Pedido' : 'Novo Pedido de Compra'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingOrder 
                      ? 'Atualize as informações do pedido'
                      : 'Crie um novo pedido de compra'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveOrder} className="space-y-6">
                  {/* Informações do Pedido */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supplier_id">Fornecedor *</Label>
                      <select
                        id="supplier_id"
                        value={formData.supplier_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, supplier_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione um fornecedor</option>
                        {suppliers.filter(s => s.is_active).map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="expected_delivery_date">Data Prevista de Entrega</Label>
                      <Input
                        id="expected_delivery_date"
                        type="date"
                        value={formData.expected_delivery_date}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          expected_delivery_date: e.target.value 
                        }))}
                      />
                    </div>

                    {editingOrder && (
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                          id="status"
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
        status: e.target.value as string
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="aprovado">Aprovado</option>
                          <option value="enviado">Enviado</option>
                          <option value="recebido">Recebido</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                    )}

                    <div className={editingOrder ? '' : 'md:col-span-2'}>
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Observações sobre o pedido"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Itens do Pedido</h3>
                      <Button type="button" onClick={addOrderItem} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Item
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {orderItems.map((orderItem, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="md:col-span-2">
                              <Label>Item *</Label>
                              <select
                                value={orderItem.item_id}
                                onChange={(e) => updateOrderItem(index, 'item_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              >
                                <option value="">Selecione um item</option>
                                {items.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} ({item.unit})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <Label>Quantidade *</Label>
                              <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={orderItem.quantity}
                                onChange={(e) => updateOrderItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                required
                              />
                            </div>

                            <div>
                              <Label>Custo Unitário (R$) *</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={orderItem.unit_cost}
                                onChange={(e) => updateOrderItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                                required
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Total</Label>
                                <div className="text-lg font-medium">
                                  R$ {orderItem.total_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOrderItem(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {orderItems.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-medium">Total do Pedido:</span>
                          <span className="text-xl font-bold text-blue-600">
                            R$ {orderItems.reduce((sum, item) => sum + item.total_cost, 0)
                              .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    )}
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
                      {editingOrder ? 'Atualizar' : 'Criar Pedido'}
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
                placeholder="Buscar por número do pedido ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="enviado">Enviado</option>
            <option value="recebido">Recebido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Tabela de Pedidos */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Data/Entrega</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{order.order_number}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.supplier?.name}</div>
                  </TableCell>
                  <TableCell>
                    {order.expected_delivery_date ? (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>{new Date(order.expected_delivery_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <span className="font-medium">
                        R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <PermissionGuard module="estoque" action="edit">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOrder(order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                      {order.status === 'pendente' && (
                        <PermissionGuard module="estoque" action="edit">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, 'aprovado')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      )}
                      <PermissionGuard module="estoque" action="delete">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || selectedStatus 
                ? 'Nenhum pedido encontrado com os filtros aplicados'
                : 'Nenhum pedido de compra criado ainda'
              }
            </p>
          </div>
        )}

        {/* Dialog de Visualização */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido</DialogTitle>
              <DialogDescription>
                Visualize os detalhes completos do pedido de compra
              </DialogDescription>
            </DialogHeader>
            {viewingOrder && (
              <div className="space-y-6">
                {/* Informações do Pedido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Número do Pedido</Label>
                    <div className="font-medium">{viewingOrder.order_number}</div>
                  </div>
                  <div>
                    <Label>Fornecedor</Label>
                    <div className="font-medium">{viewingOrder.supplier?.name}</div>
                  </div>
                  <div>
                    <Label>Data de Criação</Label>
                    <div>{new Date(viewingOrder.created_at).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div>
                    <Label>Data Prevista de Entrega</Label>
                    <div>
                      {viewingOrder.expected_delivery_date 
                        ? new Date(viewingOrder.expected_delivery_date).toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div>{getStatusBadge(viewingOrder.status)}</div>
                  </div>
                  <div>
                    <Label>Total</Label>
                    <div className="text-lg font-bold text-blue-600">
                      R$ {viewingOrder.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {viewingOrder.notes && (
                  <div>
                    <Label>Observações</Label>
                    <div className="p-3 bg-gray-50 rounded-md">{viewingOrder.notes}</div>
                  </div>
                )}

                {/* Itens do Pedido */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Itens do Pedido</h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Custo Unitário</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="font-medium">{item.item?.name}</div>
                              <div className="text-sm text-gray-500">Unidade: {item.item?.unit}</div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              R$ {item.unit_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              R$ {item.total_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default memo(PurchaseOrdersTab);
