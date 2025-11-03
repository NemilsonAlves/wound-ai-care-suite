import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Search, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { InventoryService } from '@/services/inventoryService';
import { InventoryItem, InventoryCategory } from '@/types/inventory';
import { InventoryItemForm } from './InventoryItemForm';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/common/PermissionGuard';

interface InventoryItemsTabProps {
  onDataChange: () => void;
}

export const InventoryItemsTab: React.FC<InventoryItemsTabProps> = ({ onDataChange }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { canCreate, canUpdate, canDelete } = usePermissions();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        InventoryService.getInventoryItems(),
        InventoryService.getCategories()
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (itemData: Partial<InventoryItem>) => {
    try {
      if (editingItem) {
        await InventoryService.updateInventoryItem(editingItem.id, itemData);
      } else {
        await InventoryService.createInventoryItem(itemData as Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>);
      }
      
      await loadData();
      onDataChange();
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Erro ao salvar item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    try {
      await InventoryService.deleteInventoryItem(id);
      await loadData();
      onDataChange();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock <= 0) {
      return { status: 'out', label: 'Sem estoque', color: 'bg-red-100 text-red-800' };
    } else if (item.current_stock <= item.minimum_stock) {
      return { status: 'low', label: 'Estoque baixo', color: 'bg-orange-100 text-orange-800' };
    } else {
      return { status: 'ok', label: 'Em estoque', color: 'bg-green-100 text-green-800' };
    }
  };

  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return null;
    
    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return { status: 'expired', label: 'Vencido', color: 'bg-red-100 text-red-800' };
    } else if (daysUntilExpiration <= 30) {
      return { status: 'expiring', label: `${daysUntilExpiration}d`, color: 'bg-orange-100 text-orange-800' };
    }
    return null;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.barcode?.includes(searchTerm);
    const matchesCategory = !selectedCategory || item.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando itens...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Itens do Estoque</CardTitle>
            <CardDescription>
              Gerencie todos os itens do seu inventário
            </CardDescription>
          </div>
          <PermissionGuard module="estoque" action="create">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingItem(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Editar Item' : 'Novo Item'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem ? 'Edite as informações do item' : 'Adicione um novo item ao estoque'}
                  </DialogDescription>
                </DialogHeader>
                <InventoryItemForm
                  item={editingItem}
                  categories={categories}
                  onSave={handleSaveItem}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingItem(null);
                  }}
                />
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
                placeholder="Buscar por nome, descrição ou código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tabela de Itens */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Estoque Mín.</TableHead>
                <TableHead>Valor Unit.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                const expirationStatus = getExpirationStatus(item.expiration_date);
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                        {item.barcode && (
                          <p className="text-xs text-gray-500">Código: {item.barcode}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {item.current_stock} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.minimum_stock} {item.unit}
                    </TableCell>
                    <TableCell>
                      R$ {item.unit_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge className={stockStatus.color}>
                        {stockStatus.status === 'out' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {stockStatus.status === 'low' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {stockStatus.status === 'ok' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {expirationStatus ? (
                        <Badge className={expirationStatus.color}>
                          {expirationStatus.label}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <PermissionGuard module="estoque" action="update">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingItem(item);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="estoque" action="delete">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || selectedCategory 
                ? 'Nenhum item encontrado com os filtros aplicados'
                : 'Nenhum item cadastrado ainda'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};