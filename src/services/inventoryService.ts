import { supabase } from '@/lib/supabase';
import { 
  InventoryItem, 
  InventoryCategory, 
  StockMovement, 
  Supplier, 
  PurchaseOrder,
  StockAlert,
  InventoryReport 
} from '@/types/inventory';

export class InventoryService {
  // Itens de Estoque
  static async getInventoryItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        category:inventory_categories(*)
      `)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async getInventoryItem(id: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        category:inventory_categories(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // Categorias
  static async getCategories(): Promise<InventoryCategory[]> {
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async createCategory(category: Omit<InventoryCategory, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryCategory> {
    const { data, error } = await supabase
      .from('inventory_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Movimentações de Estoque
  static async getStockMovements(itemId?: string): Promise<StockMovement[]> {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        item:inventory_items(name),
        user:profiles(full_name)
      `)
      .order('created_at', { ascending: false });

    if (itemId) {
      query = query.eq('item_id', itemId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createStockMovement(movement: Omit<StockMovement, 'id' | 'created_at'>): Promise<StockMovement> {
    const { data, error } = await supabase
      .from('stock_movements')
      .insert(movement)
      .select()
      .single();

    if (error) throw error;

    // Atualizar estoque do item
    await this.updateItemStock(movement.item_id, movement.movement_type, movement.quantity);

    return data;
  }

  private static async updateItemStock(itemId: string, movementType: string, quantity: number): Promise<void> {
    const item = await this.getInventoryItem(itemId);
    if (!item) throw new Error('Item não encontrado');

    let newStock = item.current_stock;
    
    switch (movementType) {
      case 'entrada':
        newStock += quantity;
        break;
      case 'saida':
        newStock -= quantity;
        break;
      case 'ajuste':
        newStock = quantity; // Para ajustes, a quantidade é o novo valor total
        break;
    }

    await this.updateInventoryItem(itemId, { current_stock: newStock });
  }

  // Fornecedores
  static async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Pedidos de Compra
  static async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(name),
        items:purchase_order_items(
          *,
          item:inventory_items(name, unit)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createPurchaseOrder(order: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Alertas de Estoque
  static async getStockAlerts(): Promise<StockAlert[]> {
    const { data, error } = await supabase
      .from('stock_alerts')
      .select(`
        *,
        item:inventory_items(name, current_stock, minimum_stock)
      `)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async markAlertAsRead(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('stock_alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (error) throw error;
  }

  // Relatórios
  static async getInventoryReport(): Promise<InventoryReport> {
    // Total de itens e valor
    const { data: items } = await supabase
      .from('inventory_items')
      .select('current_stock, unit_cost, minimum_stock, expiration_date, category_id')
      .eq('is_active', true);

    // Categorias
    const { data: categories } = await supabase
      .from('inventory_categories')
      .select('id, name')
      .eq('is_active', true);

    if (!items || !categories) {
      throw new Error('Erro ao gerar relatório');
    }

    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0);
    const lowStockItems = items.filter(item => item.current_stock <= item.minimum_stock).length;
    
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const expiredItems = items.filter(item => 
      item.expiration_date && new Date(item.expiration_date) < now
    ).length;
    
    const expiringSoonItems = items.filter(item => 
      item.expiration_date && 
      new Date(item.expiration_date) > now && 
      new Date(item.expiration_date) <= thirtyDaysFromNow
    ).length;

    const categoriesSummary = categories.map(category => {
      const categoryItems = items.filter(item => item.category_id === category.id);
      return {
        category: category.name,
        items_count: categoryItems.length,
        total_value: categoryItems.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0)
      };
    });

    return {
      total_items: totalItems,
      total_value: totalValue,
      low_stock_items: lowStockItems,
      expired_items: expiredItems,
      expiring_soon_items: expiringSoonItems,
      categories_summary: categoriesSummary
    };
  }
}