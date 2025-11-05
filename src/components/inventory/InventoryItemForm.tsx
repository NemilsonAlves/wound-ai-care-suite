import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { InventoryItem, InventoryCategory } from '@/types/inventory';

interface InventoryItemFormProps {
  item?: InventoryItem | null;
  categories: InventoryCategory[];
  onSave: (data: Partial<InventoryItem>) => void;
  onCancel: () => void;
}

export const InventoryItemForm: React.FC<InventoryItemFormProps> = ({
  item,
  categories,
  onSave,
  onCancel
}) => {
  type InventoryFormData = {
    name: string;
    description: string;
    category_id: string;
    brand: string;
    supplier: string;
    unit: string;
    current_stock: number;
    minimum_stock: number;
    maximum_stock: number;
    unit_cost: number;
    barcode: string;
    expiration_date: string;
    batch_number: string;
    location: string;
    is_active: boolean;
    requires_prescription: boolean;
  };

  const [formData, setFormData] = useState<InventoryFormData>({
    name: '',
    description: '',
    category_id: '',
    brand: '',
    supplier: '',
    unit: 'un',
    current_stock: 0,
    minimum_stock: 0,
    maximum_stock: 0,
    unit_cost: 0,
    barcode: '',
    expiration_date: '',
    batch_number: '',
    location: '',
    is_active: true,
    requires_prescription: false
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category_id: item.category.id || '',
        brand: item.brand || '',
        supplier: item.supplier || '',
        unit: item.unit || 'un',
        current_stock: item.current_stock || 0,
        minimum_stock: item.minimum_stock || 0,
        maximum_stock: item.maximum_stock || 0,
        unit_cost: item.unit_cost || 0,
        barcode: item.barcode || '',
        expiration_date: item.expiration_date ? item.expiration_date.split('T')[0] : '',
        batch_number: item.batch_number || '',
        location: item.location || '',
        is_active: item.is_active ?? true,
        requires_prescription: item.requires_prescription ?? false
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      expiration_date: formData.expiration_date || undefined
    };
    
    onSave(submitData);
  };

  const handleChange = (field: keyof InventoryFormData, value: InventoryFormData[keyof InventoryFormData]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="md:col-span-2">
          <Label htmlFor="name">Nome do Item *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: Gaze estéril 10x10cm"
            required
          />
        </div>

        {/* Descrição */}
        <div className="md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descrição detalhada do item"
            rows={3}
          />
        </div>

        {/* Categoria */}
        <div>
          <Label htmlFor="category_id">Categoria *</Label>
          <select
            id="category_id"
            value={formData.category_id}
            onChange={(e) => handleChange('category_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Marca */}
        <div>
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="Ex: Johnson & Johnson"
          />
        </div>

        {/* Fornecedor */}
        <div>
          <Label htmlFor="supplier">Fornecedor</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => handleChange('supplier', e.target.value)}
            placeholder="Nome do fornecedor"
          />
        </div>

        {/* Unidade */}
        <div>
          <Label htmlFor="unit">Unidade de Medida *</Label>
          <select
            id="unit"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="un">Unidade (un)</option>
            <option value="cx">Caixa (cx)</option>
            <option value="pct">Pacote (pct)</option>
            <option value="ml">Mililitro (ml)</option>
            <option value="l">Litro (l)</option>
            <option value="g">Grama (g)</option>
            <option value="kg">Quilograma (kg)</option>
            <option value="m">Metro (m)</option>
            <option value="cm">Centímetro (cm)</option>
          </select>
        </div>

        {/* Estoque Atual */}
        <div>
          <Label htmlFor="current_stock">Estoque Atual *</Label>
          <Input
            id="current_stock"
            type="number"
            min="0"
            step="0.01"
            value={formData.current_stock}
            onChange={(e) => handleChange('current_stock', parseFloat(e.target.value) || 0)}
            required
          />
        </div>

        {/* Estoque Mínimo */}
        <div>
          <Label htmlFor="minimum_stock">Estoque Mínimo *</Label>
          <Input
            id="minimum_stock"
            type="number"
            min="0"
            step="0.01"
            value={formData.minimum_stock}
            onChange={(e) => handleChange('minimum_stock', parseFloat(e.target.value) || 0)}
            required
          />
        </div>

        {/* Estoque Máximo */}
        <div>
          <Label htmlFor="maximum_stock">Estoque Máximo</Label>
          <Input
            id="maximum_stock"
            type="number"
            min="0"
            step="0.01"
            value={formData.maximum_stock}
            onChange={(e) => handleChange('maximum_stock', parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Custo Unitário */}
        <div>
          <Label htmlFor="unit_cost">Custo Unitário (R$) *</Label>
          <Input
            id="unit_cost"
            type="number"
            min="0"
            step="0.01"
            value={formData.unit_cost}
            onChange={(e) => handleChange('unit_cost', parseFloat(e.target.value) || 0)}
            required
          />
        </div>

        {/* Código de Barras */}
        <div>
          <Label htmlFor="barcode">Código de Barras</Label>
          <Input
            id="barcode"
            value={formData.barcode}
            onChange={(e) => handleChange('barcode', e.target.value)}
            placeholder="Código de barras do produto"
          />
        </div>

        {/* Data de Vencimento */}
        <div>
          <Label htmlFor="expiration_date">Data de Vencimento</Label>
          <Input
            id="expiration_date"
            type="date"
            value={formData.expiration_date}
            onChange={(e) => handleChange('expiration_date', e.target.value)}
          />
        </div>

        {/* Número do Lote */}
        <div>
          <Label htmlFor="batch_number">Número do Lote</Label>
          <Input
            id="batch_number"
            value={formData.batch_number}
            onChange={(e) => handleChange('batch_number', e.target.value)}
            placeholder="Número do lote"
          />
        </div>

        {/* Localização */}
        <div>
          <Label htmlFor="location">Localização no Estoque</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Ex: Prateleira A, Gaveta 3"
          />
        </div>
      </div>

      {/* Switches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="is_active">Item Ativo</Label>
            <p className="text-sm text-gray-600">Item disponível para uso</p>
          </div>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleChange('is_active', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="requires_prescription">Requer Prescrição</Label>
            <p className="text-sm text-gray-600">Item controlado que requer prescrição médica</p>
          </div>
          <Switch
            id="requires_prescription"
            checked={formData.requires_prescription}
            onCheckedChange={(checked) => handleChange('requires_prescription', checked)}
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {item ? 'Atualizar' : 'Criar'} Item
        </Button>
      </div>
    </form>
  );
};
