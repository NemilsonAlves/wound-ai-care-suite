import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { InventoryService } from '@/services/inventoryService';
import { InventoryCategory } from '@/types/inventory';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/common/PermissionGuard';

interface CategoriesTabProps {
  onDataChange: () => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({ onDataChange }) => {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const { canCreate, canUpdate, canDelete } = usePermissions();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await InventoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (category?: InventoryCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#3B82F6'
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6'
      });
    }
    setIsFormOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const categoryData = {
        ...formData,
        is_active: true
      };

      if (editingCategory) {
        // Atualizar categoria existente (implementar quando necessário)
        console.log('Atualizar categoria:', editingCategory.id, categoryData);
      } else {
        await InventoryService.createCategory(categoryData);
      }
      
      await loadCategories();
      onDataChange();
      setIsFormOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      // Implementar exclusão quando necessário
      console.log('Excluir categoria:', id);
      await loadCategories();
      onDataChange();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    }
  };

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Categorias de Estoque</CardTitle>
            <CardDescription>
              Organize seus itens em categorias para melhor controle
            </CardDescription>
          </div>
          <PermissionGuard module="estoque" action="create">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory 
                      ? 'Edite as informações da categoria' 
                      : 'Crie uma nova categoria para organizar seus itens'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Categoria *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Curativos, Medicamentos, Equipamentos"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da categoria"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Cor da Categoria</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <div 
                        className="w-8 h-8 rounded border-2 border-gray-300"
                        style={{ backgroundColor: formData.color }}
                      />
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-16 h-8 p-1 border rounded"
                      />
                    </div>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                        />
                      ))}
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
                      {editingCategory ? 'Atualizar' : 'Criar'} Categoria
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </PermissionGuard>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma categoria cadastrada ainda</p>
            <p className="text-sm text-gray-500 mt-2">
              Crie categorias para organizar melhor seus itens de estoque
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: category.color || '#3B82F6' }}
                    />
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  <div className="flex space-x-1">
                    <PermissionGuard module="estoque" action="update">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenForm(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard module="estoque" action="delete">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {category.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <Badge variant="outline">
                    Ativa
                  </Badge>
                  <span className="text-gray-500">
                    {new Date(category.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};