export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: InventoryCategory;
  brand?: string;
  supplier?: string;
  unit: string; // unidade de medida (un, ml, g, etc.)
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost: number;
  barcode?: string;
  expiration_date?: string;
  batch_number?: string;
  location?: string; // localização no estoque
  is_active: boolean;
  requires_prescription: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  item_id: string;
  movement_type: 'entrada' | 'saida' | 'ajuste' | 'transferencia';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reason: string;
  batch_number?: string;
  expiration_date?: string;
  supplier_id?: string;
  user_id: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  cnpj?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  order_number: string;
  status: 'pendente' | 'aprovado' | 'enviado' | 'recebido' | 'cancelado';
  order_date: string;
  expected_delivery?: string;
  actual_delivery?: string;
  total_amount: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  item_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface StockAlert {
  id: string;
  item_id: string;
  alert_type: 'estoque_baixo' | 'vencimento_proximo' | 'vencido';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface InventoryReport {
  total_items: number;
  total_value: number;
  low_stock_items: number;
  expired_items: number;
  expiring_soon_items: number;
  categories_summary: {
    category: string;
    items_count: number;
    total_value: number;
  }[];
}