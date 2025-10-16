import { useState } from "react";
import { Camera, Clock, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

const recentAssessments = [
  {
    id: 1,
    patient: "Maria Silva",
    woundType: "Úlcera por Pressão",
    stage: "Estágio III",
    location: "Sacral",
    date: "2025-01-15 14:30",
    status: "critical" as const,
    assessor: "Enf. Ana Santos"
  },
  {
    id: 2,
    patient: "João Costa",
    woundType: "Úlcera Venosa",
    stage: "Estágio II",
    location: "Perna Direita",
    date: "2025-01-15 13:15",
    status: "stable" as const,
    assessor: "Enf. Carlos Lima"
  },
  {
    id: 3,
    patient: "Ana Paula",
    woundType: "Lesão Cirúrgica",
    stage: "-",
    location: "Abdômen",
    date: "2025-01-15 11:45",
    status: "improving" as const,
    assessor: "Enf. Ana Santos"
  }
];

export default function Assessments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Avaliações de Feridas</h1>
          <p className="text-muted-foreground mt-1">Registre e acompanhe avaliações com análise por IA</p>
        </div>
        <Button size="lg" className="gap-2">
          <Camera className="w-5 h-5" />
          Nova Avaliação
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Camera className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <User className="w-8 h-8 text-status-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">IA Confiança</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-status-stable/20 flex items-center justify-center">
                <span className="text-status-stable">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por paciente, tipo de lesão..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="warning">Atenção</SelectItem>
                <SelectItem value="stable">Estável</SelectItem>
                <SelectItem value="improving">Melhorando</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Filtros Avançados</Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{assessment.patient}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>{assessment.woundType}</span>
                      <span>•</span>
                      <span>{assessment.stage}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {assessment.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{assessment.date}</p>
                    <p className="text-xs text-muted-foreground mt-1">{assessment.assessor}</p>
                  </div>
                  <StatusBadge status={assessment.status} />
                  <Button variant="ghost" size="sm">Ver Detalhes</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
