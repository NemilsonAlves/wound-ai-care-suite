import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const evolutionData = [
  { month: "Jul", patients: 45, healed: 12, active: 33 },
  { month: "Ago", patients: 52, healed: 15, active: 37 },
  { month: "Set", patients: 48, healed: 18, active: 30 },
  { month: "Out", patients: 61, healed: 22, active: 39 },
  { month: "Nov", patients: 58, healed: 20, active: 38 },
  { month: "Dez", patients: 65, healed: 25, active: 40 },
  { month: "Jan", patients: 72, healed: 28, active: 44 }
];

const woundTypeData = [
  { name: "Úlcera Pressão", value: 35, color: "#E63946" },
  { name: "Úlcera Venosa", value: 28, color: "#F77F00" },
  { name: "Úlcera Diabética", value: 18, color: "#06D6A0" },
  { name: "Cirúrgica", value: 12, color: "#118AB2" },
  { name: "Outras", value: 7, color: "#4A5568" }
];

const stageDistribution = [
  { stage: "I", count: 15 },
  { stage: "II", count: 32 },
  { stage: "III", count: 28 },
  { stage: "IV", count: 18 },
  { stage: "Não Est.", count: 7 }
];

const costData = [
  { month: "Jul", cost: 12500 },
  { month: "Ago", cost: 14200 },
  { month: "Set", cost: 13800 },
  { month: "Out", cost: 15600 },
  { month: "Nov", cost: 14900 },
  { month: "Dez", cost: 16200 },
  { month: "Jan", cost: 17800 }
];

export default function Analytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1">Análise de dados e indicadores de performance</p>
        </div>
        <Select defaultValue="30days">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Últimos 7 dias</SelectItem>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
            <SelectItem value="90days">Últimos 90 dias</SelectItem>
            <SelectItem value="year">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Cicatrização</p>
                <p className="text-2xl font-bold">78.5%</p>
                <p className="text-xs text-status-stable mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +5.2% vs mês anterior
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-status-stable" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio Cura</p>
                <p className="text-2xl font-bold">24 dias</p>
                <p className="text-xs text-status-stable mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  -3 dias vs média
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
                <p className="text-2xl font-bold">44</p>
                <p className="text-xs text-status-warning mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +6 este mês
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Médio/Pac</p>
                <p className="text-2xl font-bold">R$ 405</p>
                <p className="text-xs text-status-stable mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  -8% vs média
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-status-stable" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="evolution" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="evolution">Evolução</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Pacientes</CardTitle>
              <CardDescription>Acompanhamento mensal de pacientes ativos e cicatrizados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={evolutionData}>
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHealed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--status-stable))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--status-stable))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="patients" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPatients)" name="Total Pacientes" />
                  <Area type="monotone" dataKey="healed" stroke="hsl(var(--status-stable))" fillOpacity={1} fill="url(#colorHealed)" name="Cicatrizados" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
                <CardDescription>Tipos de feridas em tratamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={woundTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {woundTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Estágio</CardTitle>
                <CardDescription>Estágios das úlceras por pressão</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Custos</CardTitle>
              <CardDescription>Custo mensal com tratamentos e materiais</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => `R$ ${value.toLocaleString()}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="hsl(var(--status-warning))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--status-warning))", r: 5 }}
                    name="Custo Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Performance</CardTitle>
              <CardDescription>Métricas de qualidade e eficiência</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Taxa de Adesão ao Protocolo</span>
                    <span className="text-sm font-bold">94%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-status-stable transition-all" style={{ width: "94%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Avaliações no Prazo</span>
                    <span className="text-sm font-bold">88%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-status-stable transition-all" style={{ width: "88%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Satisfação da Equipe</span>
                    <span className="text-sm font-bold">91%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-status-stable transition-all" style={{ width: "91%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Prevenção de Novas Lesões</span>
                    <span className="text-sm font-bold">85%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-status-stable transition-all" style={{ width: "85%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
