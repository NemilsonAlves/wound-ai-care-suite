import { Users, Activity, TrendingUp, DollarSign } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const evolutionData = [
  { date: "01/10", cicatrizacao: 68, novos: 12 },
  { date: "08/10", cicatrizacao: 71, novos: 8 },
  { date: "15/10", cicatrizacao: 73, novos: 10 },
  { date: "22/10", cicatrizacao: 76, novos: 6 },
  { date: "29/10", cicatrizacao: 78, novos: 9 },
  { date: "05/11", cicatrizacao: 81, novos: 5 },
  { date: "12/11", cicatrizacao: 84, novos: 7 },
];

const alerts = [
  {
    id: "1",
    patientName: "Maria Silva",
    room: "201-A",
    message: "Lesão sacral apresenta sinais de deterioração - tecido necrótico aumentou 15%",
    status: "critical" as const,
    time: "há 15 min",
  },
  {
    id: "2",
    patientName: "João Santos",
    room: "305-B",
    message: "Score Braden caiu para 11 - risco alto para novas lesões por pressão",
    status: "warning" as const,
    time: "há 1 hora",
  },
  {
    id: "3",
    patientName: "Ana Costa",
    room: "102-C",
    message: "Sinais clínicos de infecção em lesão calcânea - exsudato purulento",
    status: "critical" as const,
    time: "há 2 horas",
  },
];

const priorityPatients = [
  { name: "Maria Silva", room: "201-A", wounds: 3, status: "critical" as const },
  { name: "João Santos", room: "305-B", wounds: 2, status: "warning" as const },
  { name: "Ana Costa", room: "102-C", wounds: 1, status: "critical" as const },
  { name: "Pedro Oliveira", room: "410-A", wounds: 2, status: "warning" as const },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema WoundCare AI</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={Users}
          label="Total de Pacientes"
          value={124}
          change={8}
          changeLabel="vs mês anterior"
          iconBgClass="bg-primary/10"
        />
        <KPICard
          icon={Activity}
          label="Lesões em Tratamento"
          value={87}
          change={-5}
          changeLabel="vs mês anterior"
          iconBgClass="bg-status-warning/10"
        />
        <KPICard
          icon={TrendingUp}
          label="Taxa de Cicatrização"
          value="84%"
          change={6}
          changeLabel="últimos 30 dias"
          iconBgClass="bg-status-stable/10"
        />
        <KPICard
          icon={DollarSign}
          label="Custo Médio/Paciente"
          value="R$ 342"
          change={-12}
          changeLabel="vs mês anterior"
          iconBgClass="bg-status-improving/10"
        />
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground mb-1">Evolução do Tratamento</h3>
            <p className="text-sm text-muted-foreground">Taxa de cicatrização e novos casos (últimas 7 semanas)</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={evolutionData}>
              <defs>
                <linearGradient id="colorCicatrizacao" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--stable))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--stable))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNovos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="cicatrizacao"
                stroke="hsl(var(--stable))"
                strokeWidth={2}
                fill="url(#colorCicatrizacao)"
                name="Taxa Cicatrização (%)"
              />
              <Area
                type="monotone"
                dataKey="novos"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                fill="url(#colorNovos)"
                name="Novos Casos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Critical Alerts */}
        <AlertCard alerts={alerts} />
      </div>

      {/* Priority Patients and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Patients */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Pacientes Prioritários</h3>
          <div className="space-y-3">
            {priorityPatients.map((patient, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Leito {patient.room} • {patient.wounds} lesão(ões)
                    </p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  patient.status === "critical" ? "bg-status-critical" : "bg-status-warning"
                }`} />
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-status-stable mt-2 shrink-0" />
              <div>
                <p className="text-sm text-foreground">
                  <span className="font-medium">Dr. Carlos Silva</span> registrou evolução positiva para{" "}
                  <span className="font-medium">Pedro Oliveira</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">há 5 minutos</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
              <div>
                <p className="text-sm text-foreground">
                  Nova avaliação de ferida cadastrada por <span className="font-medium">Enf. Ana Paula</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">há 22 minutos</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-status-warning mt-2 shrink-0" />
              <div>
                <p className="text-sm text-foreground">
                  Material <span className="font-medium">Hidrofibra com Prata</span> atingiu estoque mínimo
                </p>
                <p className="text-xs text-muted-foreground mt-1">há 1 hora</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-status-improving mt-2 shrink-0" />
              <div>
                <p className="text-sm text-foreground">
                  <span className="font-medium">Maria Silva</span> apresentou melhora de 25% na lesão sacral
                </p>
                <p className="text-xs text-muted-foreground mt-1">há 3 horas</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
