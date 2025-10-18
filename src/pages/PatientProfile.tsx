import { Camera, FileText, MessageSquare, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Progress } from "@/components/ui/progress";

const patient = {
  id: "1",
  name: "Maria Silva",
  age: 68,
  gender: "Feminino",
  room: "201-A",
  record: "12345678",
  sector: "UTI",
  bradenScore: 11,
  admissionDate: "15/10/2024",
  allergies: ["Penicilina", "Látex"],
  comorbidities: ["Diabetes Mellitus tipo 2", "Hipertensão", "Obesidade"],
};

const wounds = [
  {
    id: 1,
    type: "Úlcera por Pressão",
    location: "Sacral",
    stage: "III",
    size: "4.2 x 3.1 cm",
    area: "13.02 cm²",
    status: "critical" as const,
    lastAssessment: "Hoje, 09:30",
    evolution: -15,
  },
  {
    id: 2,
    type: "Úlcera por Pressão",
    location: "Calcanhar Direito",
    stage: "II",
    size: "2.8 x 2.1 cm",
    area: "5.88 cm²",
    status: "warning" as const,
    lastAssessment: "Ontem, 14:20",
    evolution: 8,
  },
  {
    id: 3,
    type: "Úlcera por Pressão",
    location: "Trocanter Esquerdo",
    stage: "II",
    size: "1.5 x 1.2 cm",
    area: "1.80 cm²",
    status: "improving" as const,
    lastAssessment: "Há 2 dias",
    evolution: 22,
  },
];

const timeline = [
  {
    date: "18/01/2025 09:30",
    event: "Avaliação de Ferida",
    description: "Lesão sacral apresenta deterioração - aumento de 15% na área",
    type: "critical" as const,
    user: "Enf. Ana Paula",
  },
  {
    date: "17/01/2025 14:20",
    event: "Troca de Curativo",
    description: "Realizada troca conforme protocolo. Exsudato moderado.",
    type: "stable" as const,
    user: "Enf. Carlos Silva",
  },
  {
    date: "16/01/2025 11:15",
    event: "Score Braden",
    description: "Score caiu para 11 - Risco muito alto",
    type: "warning" as const,
    user: "Enf. Maria Santos",
  },
  {
    date: "15/01/2025 08:00",
    event: "Prescrição Atualizada",
    description: "Alterado curativo para Hidrofibra com Prata",
    type: "stable" as const,
    user: "Dr. João Mendes",
  },
];

const protocols = [
  { name: "Mudança de Decúbito", frequency: "2/2h", status: "active" },
  { name: "Escala de Braden", frequency: "Diária", status: "active" },
  { name: "Protocolo TIME", frequency: "Conforme avaliação", status: "active" },
  { name: "Suporte Nutricional", frequency: "Contínuo", status: "active" },
];

const costs = {
  monthly: 1245.00,
  materials: [
    { name: "Hidrofibra com Prata", quantity: 12, unitCost: 45.00, total: 540.00 },
    { name: "Espuma com Silicone", quantity: 8, unitCost: 32.00, total: 256.00 },
    { name: "Hidrogel", quantity: 6, unitCost: 38.00, total: 228.00 },
    { name: "Filme Transparente", quantity: 15, unitCost: 14.70, total: 220.50 },
  ],
};

export default function PatientProfile() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {patient.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <span>{patient.age} anos</span>
                    <span>•</span>
                    <span>{patient.gender}</span>
                    <span>•</span>
                    <span>Leito {patient.room}</span>
                    <span>•</span>
                    <span>Prontuário {patient.record}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {patient.allergies.map((allergy) => (
                      <Badge key={allergy} variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {allergy}
                      </Badge>
                    ))}
                    {patient.comorbidities.map((condition) => (
                      <Badge key={condition} variant="secondary">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="gap-2">
                    <Camera className="w-4 h-4" />
                    Nova Avaliação
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Prescrever
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Interconsulta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Setor</p>
                <p className="font-semibold text-foreground">{patient.sector}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Internação</p>
                <p className="font-semibold text-foreground">{patient.admissionDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Score Braden</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-status-critical">{patient.bradenScore}</span>
                  <Badge variant="destructive">Risco Alto</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alertas Ativos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-status-critical/10 border border-status-critical/20">
                <p className="text-sm font-medium text-status-critical">Lesão Deteriorando</p>
                <p className="text-xs text-muted-foreground mt-1">Área aumentou 15%</p>
              </div>
              <div className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/20">
                <p className="text-sm font-medium text-status-warning">Braden Crítico</p>
                <p className="text-xs text-muted-foreground mt-1">Score 11 - Risco alto</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="wounds">Lesões Ativas</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="protocols">Protocolos</TabsTrigger>
              <TabsTrigger value="costs">Custos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Lesões Ativas</p>
                    <p className="text-3xl font-bold text-foreground">{wounds.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Área Total</p>
                    <p className="text-3xl font-bold text-foreground">20.7 cm²</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Custo Mensal</p>
                    <p className="text-3xl font-bold text-foreground">R$ {costs.monthly.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Lesões em Tratamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {wounds.map((wound) => (
                    <div
                      key={wound.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🩹</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{wound.type}</h3>
                          <Badge variant="secondary">Estágio {wound.stage}</Badge>
                          <StatusBadge status={wound.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {wound.location} • {wound.size} • {wound.area}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          {wound.evolution >= 0 ? (
                            <div className="flex items-center gap-1 text-status-stable">
                              <TrendingUp className="w-4 h-4" />
                              <span>Melhorando {wound.evolution}%</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-status-critical">
                              <TrendingDown className="w-4 h-4" />
                              <span>Piorando {Math.abs(wound.evolution)}%</span>
                            </div>
                          )}
                          <span className="text-muted-foreground">• {wound.lastAssessment}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">Detalhes</Button>
                        <Button size="sm" variant="outline">
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wounds" className="space-y-4">
              {wounds.map((wound) => (
                <Card key={wound.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{wound.type} - {wound.location}</CardTitle>
                        <CardDescription>Estágio {wound.stage} • Última avaliação: {wound.lastAssessment}</CardDescription>
                      </div>
                      <StatusBadge status={wound.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Dimensões</p>
                          <p className="font-semibold text-foreground">{wound.size}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Área</p>
                          <p className="font-semibold text-foreground">{wound.area}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Evolução</p>
                          <div className="flex items-center gap-2">
                            {wound.evolution >= 0 ? (
                              <>
                                <TrendingUp className="w-5 h-5 text-status-stable" />
                                <Progress value={wound.evolution} className="flex-1 [&>div]:bg-status-stable" />
                                <span className="text-sm font-semibold text-status-stable">+{wound.evolution}%</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-5 h-5 text-status-critical" />
                                <Progress value={Math.abs(wound.evolution)} className="flex-1 [&>div]:bg-status-critical" />
                                <span className="text-sm font-semibold text-status-critical">{wound.evolution}%</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg flex items-center justify-center min-h-[200px]">
                        <span className="text-muted-foreground">Foto da lesão</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Linha do Tempo</CardTitle>
                  <CardDescription>Histórico completo de eventos clínicos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timeline.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            item.type === "critical" ? "bg-status-critical" :
                            item.type === "warning" ? "bg-status-warning" :
                            "bg-status-stable"
                          }`} />
                          {idx < timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{item.event}</h4>
                            <span className="text-xs text-muted-foreground">{item.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{item.description}</p>
                          <p className="text-xs text-muted-foreground">Por {item.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="protocols">
              <Card>
                <CardHeader>
                  <CardTitle>Protocolos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {protocols.map((protocol, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <h4 className="font-semibold text-foreground">{protocol.name}</h4>
                          <p className="text-sm text-muted-foreground">{protocol.frequency}</p>
                        </div>
                        <Badge variant="secondary">Ativo</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="costs">
              <Card>
                <CardHeader>
                  <CardTitle>Custos de Tratamento</CardTitle>
                  <CardDescription>Consumo mensal de materiais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costs.materials.map((material, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{material.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {material.quantity} unidades × R$ {material.unitCost.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-foreground">
                          R$ {material.total.toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border-2 border-primary">
                      <p className="font-semibold text-foreground">Total Mensal</p>
                      <p className="text-2xl font-bold text-primary">
                        R$ {costs.monthly.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
