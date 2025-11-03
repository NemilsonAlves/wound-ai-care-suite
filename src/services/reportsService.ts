import { supabase } from '@/lib/supabase';
import {
  ReportFilter,
  PatientReport,
  ConsultationReport,
  ProcedureReport,
  FinancialReport,
  InventoryReport,
  AuditLog,
  AuditFilter,
  SystemMetrics,
  UserActivityReport,
  DashboardMetrics,
  SpecialtyRevenue,
  MonthlyRevenue,
  TopProcedure,
  CategoryStock
} from '@/types/reports';

export class ReportsService {
  // Relatórios de Pacientes
  static async getPatientsReport(filters: ReportFilter = {}): Promise<PatientReport[]> {
    let query = supabase
      .from('patients')
      .select(`
        id,
        full_name,
        birth_date,
        gender,
        phone,
        email,
        created_at,
        consultations:consultations(count),
        procedures:procedures(count)
      `);

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Processar dados para incluir estatísticas
    const processedData = await Promise.all(
      data.map(async (patient) => {
        // Buscar última consulta
        const { data: lastConsultation } = await supabase
          .from('consultations')
          .select('consultation_date')
          .eq('patient_id', patient.id)
          .order('consultation_date', { ascending: false })
          .limit(1);

        // Buscar total gasto
        const { data: procedures } = await supabase
          .from('procedures')
          .select('cost')
          .eq('patient_id', patient.id);

        const totalSpent = procedures?.reduce((sum, proc) => sum + (proc.cost || 0), 0) || 0;

        return {
          ...patient,
          total_consultations: patient.consultations?.[0]?.count || 0,
          total_procedures: patient.procedures?.[0]?.count || 0,
          last_consultation: lastConsultation?.[0]?.consultation_date || '',
          total_spent: totalSpent
        };
      })
    );

    return processedData;
  }

  // Relatórios de Consultas
  static async getConsultationsReport(filters: ReportFilter = {}): Promise<ConsultationReport[]> {
    let query = supabase
      .from('consultations')
      .select(`
        id,
        consultation_date,
        specialty,
        status,
        created_at,
        patient:patients(full_name),
        user:users(full_name),
        procedures:procedures(count, cost)
      `);

    if (filters.start_date) {
      query = query.gte('consultation_date', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('consultation_date', filters.end_date);
    }
    if (filters.specialty) {
      query = query.eq('specialty', filters.specialty);
    }
    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(consultation => ({
      id: consultation.id,
      patient_name: consultation.patient?.full_name || '',
      patient_id: consultation.patient_id,
      consultation_date: consultation.consultation_date,
      specialty: consultation.specialty,
      doctor_name: consultation.user?.full_name || '',
      status: consultation.status,
      total_cost: consultation.procedures?.reduce((sum: number, proc: { cost?: number }) => sum + (proc.cost || 0), 0) || 0,
      procedures_count: consultation.procedures?.[0]?.count || 0,
      created_at: consultation.created_at
    }));
  }

  // Relatórios de Procedimentos
  static async getProceduresReport(filters: ReportFilter = {}): Promise<ProcedureReport[]> {
    let query = supabase
      .from('procedures')
      .select(`
        id,
        name,
        date,
        cost,
        status,
        created_at,
        patient:patients(full_name),
        consultation:consultations(specialty, user:users(full_name))
      `);

    if (filters.start_date) {
      query = query.gte('date', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('date', filters.end_date);
    }
    if (filters.patient_id) {
      query = query.eq('patient_id', filters.patient_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(procedure => ({
      id: procedure.id,
      name: procedure.name,
      patient_name: procedure.patient?.full_name || '',
      patient_id: procedure.patient_id,
      consultation_id: procedure.consultation_id,
      date: procedure.date,
      specialty: procedure.consultation?.specialty || '',
      doctor_name: procedure.consultation?.user?.full_name || '',
      cost: procedure.cost || 0,
      status: procedure.status,
      created_at: procedure.created_at
    }));
  }

  // Relatório Financeiro
  static async getFinancialReport(filters: ReportFilter = {}): Promise<FinancialReport> {
    const startDate = filters.start_date || new Date(new Date().getFullYear(), 0, 1).toISOString();
    const endDate = filters.end_date || new Date().toISOString();

    // Receita total
    const { data: procedures } = await supabase
      .from('procedures')
      .select('cost, date, consultation:consultations(specialty)')
      .gte('date', startDate)
      .lte('date', endDate);

    const totalRevenue = procedures?.reduce((sum, proc) => sum + (proc.cost || 0), 0) || 0;

    // Consultas no período
    const { data: consultations } = await supabase
      .from('consultations')
      .select('id, specialty, consultation_date')
      .gte('consultation_date', startDate)
      .lte('consultation_date', endDate);

    const totalConsultations = consultations?.length || 0;
    const totalProcedures = procedures?.length || 0;
    const averageConsultationValue = totalConsultations > 0 ? totalRevenue / totalConsultations : 0;

    // Receita por especialidade
    const revenueBySpecialty = consultations?.reduce((acc: SpecialtyRevenue[], consultation) => {
      const specialty = consultation.specialty;
      const proceduresForConsultation = procedures?.filter(p => 
        p.consultation?.specialty === specialty
      ) || [];
      
      const revenue = proceduresForConsultation.reduce((sum, proc) => sum + (proc.cost || 0), 0);
      
      const existing = acc.find(item => item.specialty === specialty);
      if (existing) {
        existing.revenue += revenue;
        existing.consultations_count += 1;
        existing.procedures_count += proceduresForConsultation.length;
      } else {
        acc.push({
          specialty,
          revenue,
          consultations_count: 1,
          procedures_count: proceduresForConsultation.length,
          percentage: 0
        });
      }
      return acc;
    }, [] as SpecialtyRevenue[]) || [];

    // Calcular percentuais
    revenueBySpecialty.forEach(item => {
      item.percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
    });

    // Receita por mês
    const revenueByMonth = procedures?.reduce((acc: MonthlyRevenue[], procedure) => {
      const month = new Date(procedure.date).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.revenue += procedure.cost || 0;
        existing.procedures += 1;
      } else {
        acc.push({
          month,
          revenue: procedure.cost || 0,
          consultations: 0,
          procedures: 1
        });
      }
      return acc;
    }, [] as MonthlyRevenue[]) || [];

    // Top procedimentos
    const procedureStats = procedures?.reduce((acc: TopProcedure[], procedure) => {
      const existing = acc.find(item => item.name === procedure.name);
      if (existing) {
        existing.count += 1;
        existing.total_revenue += procedure.cost || 0;
      } else {
        acc.push({
          name: procedure.name,
          count: 1,
          total_revenue: procedure.cost || 0,
          average_cost: procedure.cost || 0
        });
      }
      return acc;
    }, [] as TopProcedure[]) || [];

    procedureStats.forEach(proc => {
      proc.average_cost = proc.count > 0 ? proc.total_revenue / proc.count : 0;
    });

    const topProcedures = procedureStats
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);

    return {
      period: `${new Date(startDate).toLocaleDateString('pt-BR')} - ${new Date(endDate).toLocaleDateString('pt-BR')}`,
      total_revenue: totalRevenue,
      total_consultations: totalConsultations,
      total_procedures: totalProcedures,
      average_consultation_value: averageConsultationValue,
      revenue_by_specialty: revenueBySpecialty,
      revenue_by_month: revenueByMonth,
      top_procedures: topProcedures
    };
  }

  // Relatório de Estoque
  static async getInventoryReport(): Promise<InventoryReport> {
    // Itens de estoque
    const { data: items } = await supabase
      .from('inventory_items')
      .select(`
        id,
        name,
        current_stock,
        min_stock,
        unit_cost,
        expiration_date,
        category:inventory_categories(name)
      `);

    const totalItems = items?.length || 0;
    const totalValue = items?.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0) || 0;
    const lowStockItems = items?.filter(item => item.current_stock <= item.min_stock).length || 0;
    const expiredItems = items?.filter(item => 
      item.expiration_date && new Date(item.expiration_date) < new Date()
    ).length || 0;

    // Itens por categoria
    const itemsByCategory = items?.reduce((acc: CategoryStock[], item) => {
      const category = item.category?.name || 'Sem categoria';
      const existing = acc.find(cat => cat.category === category);
      
      if (existing) {
        existing.items_count += 1;
        existing.total_value += item.current_stock * item.unit_cost;
        if (item.current_stock <= item.min_stock) {
          existing.low_stock_count += 1;
        }
      } else {
        acc.push({
          category,
          items_count: 1,
          total_value: item.current_stock * item.unit_cost,
          low_stock_count: item.current_stock <= item.min_stock ? 1 : 0,
          percentage: 0
        });
      }
      return acc;
    }, [] as CategoryStock[]) || [];

    itemsByCategory.forEach(cat => {
      cat.percentage = totalValue > 0 ? (cat.total_value / totalValue) * 100 : 0;
    });

    // Movimentações recentes
    const { data: movements } = await supabase
      .from('stock_movements')
      .select(`
        created_at,
        movement_type,
        quantity,
        total_cost,
        item:inventory_items(name),
        user:users(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    const recentMovements = movements?.map(movement => ({
      date: movement.created_at,
      movement_type: movement.movement_type,
      item_name: movement.item?.name || '',
      quantity: movement.quantity,
      cost: movement.total_cost || 0,
      user_name: movement.user?.full_name || ''
    })) || [];

    return {
      total_items: totalItems,
      total_value: totalValue,
      low_stock_items: lowStockItems,
      expired_items: expiredItems,
      items_by_category: itemsByCategory,
      recent_movements: recentMovements,
      top_suppliers: [], // Implementar se necessário
      cost_analysis: {
        period: 'Último mês',
        total_purchases: 0,
        total_consumption: 0,
        average_monthly_cost: 0,
        cost_by_category: []
      }
    };
  }

  // Logs de Auditoria
  static async getAuditLogs(filters: AuditFilter = {}): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        user_id,
        action,
        module,
        entity_type,
        entity_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
        created_at,
        user:users(full_name)
      `)
      .order('created_at', { ascending: false });

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.module) {
      query = query.eq('module', filters.module);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(log => ({
      ...log,
      user_name: log.user?.full_name || 'Sistema'
    }));
  }

  // Criar log de auditoria
  static async createAuditLog(logData: Omit<AuditLog, 'id' | 'created_at' | 'user_name'>): Promise<void> {
    const { error } = await supabase
      .from('audit_logs')
      .insert([logData]);

    if (error) throw error;
  }

  // Métricas do Sistema
  static async getSystemMetrics(): Promise<SystemMetrics> {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // Total de usuários
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Usuários ativos hoje
    const { count: activeUsersToday } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    // Total de pacientes
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    // Novos pacientes este mês
    const { count: newPatientsThisMonth } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisMonth);

    // Total de consultas
    const { count: totalConsultations } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true });

    // Consultas este mês
    const { count: consultationsThisMonth } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .gte('consultation_date', thisMonth);

    // Total de procedimentos
    const { count: totalProcedures } = await supabase
      .from('procedures')
      .select('*', { count: 'exact', head: true });

    // Procedimentos este mês
    const { count: proceduresThisMonth } = await supabase
      .from('procedures')
      .select('*', { count: 'exact', head: true })
      .gte('date', thisMonth);

    return {
      total_users: totalUsers || 0,
      active_users_today: activeUsersToday || 0,
      total_patients: totalPatients || 0,
      new_patients_this_month: newPatientsThisMonth || 0,
      total_consultations: totalConsultations || 0,
      consultations_this_month: consultationsThisMonth || 0,
      total_procedures: totalProcedures || 0,
      procedures_this_month: proceduresThisMonth || 0,
      system_uptime: '99.9%',
      database_size: '2.5 GB',
      storage_used: '1.2 GB'
    };
  }

  // Relatório de Atividade dos Usuários
  static async getUserActivityReport(filters: ReportFilter = {}): Promise<UserActivityReport[]> {
    const { data: users } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        role,
        last_login,
        consultations:consultations(count),
        procedures:procedures(count),
        patients:patients(count)
      `);

    if (!users) return [];

    const userActivities = await Promise.all(
      users.map(async (user) => {
        // Contar logins
        const { count: totalLogins } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('action', 'login');

        // Contar ações totais
        const { count: totalActions } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        return {
          user_id: user.id,
          user_name: user.full_name,
          role: user.role,
          last_login: user.last_login || '',
          total_logins: totalLogins || 0,
          consultations_created: user.consultations?.[0]?.count || 0,
          procedures_performed: user.procedures?.[0]?.count || 0,
          patients_registered: user.patients?.[0]?.count || 0,
          total_actions: totalActions || 0
        };
      })
    );

    return userActivities;
  }

  // Métricas do Dashboard
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString();

    // Pacientes
    const { count: totalPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    const { count: patientsThisMonth } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisMonth);

    const { count: patientsLastMonth } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonth)
      .lte('created_at', lastMonthEnd);

    // Consultas
    const { count: totalConsultations } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true });

    const { count: consultationsThisMonth } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .gte('consultation_date', thisMonth);

    const { count: consultationsLastMonth } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .gte('consultation_date', lastMonth)
      .lte('consultation_date', lastMonthEnd);

    // Procedimentos
    const { count: totalProcedures } = await supabase
      .from('procedures')
      .select('*', { count: 'exact', head: true });

    const { count: proceduresThisMonth } = await supabase
      .from('procedures')
      .select('*', { count: 'exact', head: true })
      .gte('date', thisMonth);

    const { count: proceduresLastMonth } = await supabase
      .from('procedures')
      .select('*', { count: 'exact', head: true })
      .gte('date', lastMonth)
      .lte('date', lastMonthEnd);

    // Receita
    const { data: revenueThisMonth } = await supabase
      .from('procedures')
      .select('cost')
      .gte('date', thisMonth);

    const { data: revenueLastMonth } = await supabase
      .from('procedures')
      .select('cost')
      .gte('date', lastMonth)
      .lte('date', lastMonthEnd);

    const { data: totalRevenue } = await supabase
      .from('procedures')
      .select('cost');

    const revenueThisMonthTotal = revenueThisMonth?.reduce((sum, proc) => sum + (proc.cost || 0), 0) || 0;
    const revenueLastMonthTotal = revenueLastMonth?.reduce((sum, proc) => sum + (proc.cost || 0), 0) || 0;
    const totalRevenueAmount = totalRevenue?.reduce((sum, proc) => sum + (proc.cost || 0), 0) || 0;

    // Calcular crescimento
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      patients: {
        total: totalPatients || 0,
        new_this_month: patientsThisMonth || 0,
        growth_percentage: calculateGrowth(patientsThisMonth || 0, patientsLastMonth || 0)
      },
      consultations: {
        total: totalConsultations || 0,
        this_month: consultationsThisMonth || 0,
        growth_percentage: calculateGrowth(consultationsThisMonth || 0, consultationsLastMonth || 0)
      },
      revenue: {
        total: totalRevenueAmount,
        this_month: revenueThisMonthTotal,
        growth_percentage: calculateGrowth(revenueThisMonthTotal, revenueLastMonthTotal)
      },
      procedures: {
        total: totalProcedures || 0,
        this_month: proceduresThisMonth || 0,
        growth_percentage: calculateGrowth(proceduresThisMonth || 0, proceduresLastMonth || 0)
      }
    };
  }
}
