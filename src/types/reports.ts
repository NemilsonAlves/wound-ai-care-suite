export interface ReportFilter {
  start_date?: string;
  end_date?: string;
  patient_id?: string;
  user_id?: string;
  specialty?: string;
  status?: string;
  category?: string;
}

export interface PatientReport {
  id: string;
  full_name: string;
  birth_date: string;
  gender: string;
  phone: string;
  email?: string;
  total_consultations: number;
  last_consultation: string;
  total_procedures: number;
  total_spent: number;
  created_at: string;
}

export interface ConsultationReport {
  id: string;
  patient_name: string;
  patient_id: string;
  consultation_date: string;
  specialty: string;
  doctor_name: string;
  status: string;
  total_cost: number;
  procedures_count: number;
  created_at: string;
}

export interface ProcedureReport {
  id: string;
  name: string;
  patient_name: string;
  patient_id: string;
  consultation_id: string;
  date: string;
  specialty: string;
  doctor_name: string;
  cost: number;
  status: string;
  created_at: string;
}

export interface FinancialReport {
  period: string;
  total_revenue: number;
  total_consultations: number;
  total_procedures: number;
  average_consultation_value: number;
  revenue_by_specialty: SpecialtyRevenue[];
  revenue_by_month: MonthlyRevenue[];
  top_procedures: TopProcedure[];
}

export interface SpecialtyRevenue {
  specialty: string;
  revenue: number;
  consultations_count: number;
  procedures_count: number;
  percentage: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  consultations: number;
  procedures: number;
}

export interface TopProcedure {
  name: string;
  count: number;
  total_revenue: number;
  average_cost: number;
}

export interface InventoryReport {
  total_items: number;
  total_value: number;
  low_stock_items: number;
  expired_items: number;
  items_by_category: CategoryStock[];
  recent_movements: StockMovementSummary[];
  top_suppliers: SupplierSummary[];
  cost_analysis: CostAnalysis;
}

export interface CategoryStock {
  category: string;
  items_count: number;
  total_value: number;
  low_stock_count: number;
  percentage: number;
}

export interface StockMovementSummary {
  date: string;
  movement_type: string;
  item_name: string;
  quantity: number;
  cost: number;
  user_name: string;
}

export interface SupplierSummary {
  supplier_name: string;
  total_orders: number;
  total_value: number;
  last_order_date: string;
}

export interface CostAnalysis {
  period: string;
  total_purchases: number;
  total_consumption: number;
  average_monthly_cost: number;
  cost_by_category: CategoryCost[];
}

export interface CategoryCost {
  category: string;
  cost: number;
  percentage: number;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  module: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditFilter {
  start_date?: string;
  end_date?: string;
  user_id?: string;
  module?: string;
  action?: string;
  entity_type?: string;
}

export interface SystemMetrics {
  total_users: number;
  active_users_today: number;
  total_patients: number;
  new_patients_this_month: number;
  total_consultations: number;
  consultations_this_month: number;
  total_procedures: number;
  procedures_this_month: number;
  system_uptime: string;
  database_size: string;
  storage_used: string;
}

export interface UserActivityReport {
  user_id: string;
  user_name: string;
  role: string;
  last_login: string;
  total_logins: number;
  consultations_created: number;
  procedures_performed: number;
  patients_registered: number;
  total_actions: number;
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  include_charts: boolean;
  date_range: {
    start: string;
    end: string;
  };
  filters: ReportFilter;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface DashboardMetrics {
  patients: {
    total: number;
    new_this_month: number;
    growth_percentage: number;
  };
  consultations: {
    total: number;
    this_month: number;
    growth_percentage: number;
  };
  revenue: {
    total: number;
    this_month: number;
    growth_percentage: number;
  };
  procedures: {
    total: number;
    this_month: number;
    growth_percentage: number;
  };
}
