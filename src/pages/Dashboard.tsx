import { 
  Users, 
  Activity, 
  Eye,
  RefreshCw,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PatientService } from "@/services/patientService";
import { Patient } from "@/types/patient";
import { toast } from "sonner";



interface DashboardStats {
  total: number;
  bySpecialty?: {
    Curativos?: number;
    Dermatologia?: number;
    Cirurgias?: number;
  };
  recentRegistrations: number;
}

interface MonthlyData {
  month: string;
  patients: number;
  newPatients: number;
}

interface RecentPatient {
  id: string;
  full_name: string;
  specialty: string;
  created_at: string;
  phone?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas dos pacientes
      const patientStats = await PatientService.getPatientStats();
      setStats(patientStats);
      
      // Carregar pacientes recentes
      const allPatients = await PatientService.getAll();
      const sortedPatients = allPatients
        .sort((a: Patient, b: Patient) => {
          const dateA = new Date(a.created_at || '').getTime();
          const dateB = new Date(b.created_at || '').getTime();
          return dateB - dateA;
        })
        .slice(0, 5);
      setRecentPatients(sortedPatients);
      
      // Gerar dados mensais
      const monthlyStats = generateMonthlyData(allPatients);
      setMonthlyData(monthlyStats);
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateMonthlyData = (patients: Patient[]): MonthlyData[] => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthPatients = patients.filter(p => {
        const createdAt = new Date(p.created_at);
        return createdAt >= monthStart && createdAt <= monthEnd;
      });
      
      months.push({
        month: monthName,
        patients: monthPatients.length,
        newPatients: monthPatients.length
      });
    }
    
    return months;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard atualizado com sucesso!');
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema de gestão de pacientes</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={Users}
          label="Total de Pacientes"
          value={stats?.total || 0}
          change={stats?.recentRegistrations || 0}
          changeLabel="novos este mês"
          iconBgClass="bg-primary/10"
        />
        <KPICard
          icon={Activity}
          label="Curativos"
          value={stats?.bySpecialty?.Curativos || 0}
          change={Math.round(((stats?.bySpecialty?.Curativos || 0) / (stats?.total || 1)) * 100)}
          changeLabel="% do total"
          iconBgClass="bg-status-warning/10"
        />
        <KPICard
          icon={TrendingUp}
          label="Dermatologia"
          value={stats?.bySpecialty?.Dermatologia || 0}
          change={Math.round(((stats?.bySpecialty?.Dermatologia || 0) / (stats?.total || 1)) * 100)}
          changeLabel="% do total"
          iconBgClass="bg-status-stable/10"
        />
        <KPICard
          icon={DollarSign}
          label="Cirurgia Plástica"
          value={stats?.bySpecialty?.Cirurgias || 0}
          change={Math.round(((stats?.bySpecialty?.Cirurgias || 0) / (stats?.total || 1)) * 100)}
          changeLabel="% do total"
          iconBgClass="bg-status-improving/10"
        />
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground mb-1">Evolução dos Registros</h3>
            <p className="text-sm text-muted-foreground">Novos pacientes registrados (últimos 6 meses)</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="patients"
                fill="hsl(var(--primary))"
                name="Novos Pacientes"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Specialty Distribution */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground mb-1">Distribuição por Especialidade</h3>
            <p className="text-sm text-muted-foreground">Pacientes por área médica</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Curativos</span>
                <span className="font-medium">{stats?.bySpecialty?.Curativos || 0}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-status-warning h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${stats?.total ? ((stats.bySpecialty?.Curativos || 0) / stats.total) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dermatologia</span>
                <span className="font-medium">{stats?.bySpecialty?.Dermatologia || 0}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-status-stable h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${stats?.total ? ((stats.bySpecialty?.Dermatologia || 0) / stats.total) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cirurgia Plástica</span>
                <span className="font-medium">{stats?.bySpecialty?.Cirurgias || 0}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-status-improving h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${stats?.total ? ((stats.bySpecialty?.Cirurgias || 0) / stats.total) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground text-xl">Pacientes Recentes</h3>
          <Button variant="outline" size="sm" onClick={() => navigate('/pacientes')}>
            Ver Todos
          </Button>
        </div>
        <div className="space-y-3">
          {recentPatients.map((patient) => (
            <div
              key={patient.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/pacientes/${patient.id}`)}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {patient.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{patient.full_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {patient.specialty} {patient.phone && `• ${patient.phone}`}
                    </p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-sm text-muted-foreground">
                      {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(patient.created_at).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline">
                    {patient.specialty}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => navigate(`/pacientes/${patient.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {recentPatients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum paciente registrado ainda</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
              <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/pacientes/novo')}
            >
              <Users className="w-4 h-4 mr-2" />
              Novo Paciente
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/pacientes')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Pacientes
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/reports')}
            >
              <Activity className="w-4 h-4 mr-2" />
              Relatórios
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Resumo Rápido</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total de Pacientes</span>
              <span className="font-semibold">{stats?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Novos este Mês</span>
              <span className="font-semibold text-green-600">+{stats?.recentRegistrations || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Especialidade Principal</span>
              <span className="font-semibold">
                {(() => {
                  const curativos = stats?.bySpecialty?.Curativos || 0;
                  const dermatologia = stats?.bySpecialty?.Dermatologia || 0;
                  const cirurgias = stats?.bySpecialty?.Cirurgias || 0;
                  
                  if (curativos >= dermatologia && curativos >= cirurgias) {
                    return 'Curativos';
                  } else if (dermatologia >= cirurgias) {
                    return 'Dermatologia';
                  } else {
                    return 'Cirurgia Plástica';
                  }
                })()}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm">Sistema Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm">Banco de Dados Conectado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm">Última Atualização: Agora</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
