import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Award, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const performance = [
  {
    id: 1,
    name: "Dr. Carlos Silva",
    role: "Médico Estomaterapeuta",
    assessments: 156,
    satisfaction: 98,
    responseTime: 12,
    protocols: 8,
  },
  {
    id: 2,
    name: "Enf. Maria Santos",
    role: "Enfermeira Especialista",
    assessments: 234,
    satisfaction: 96,
    responseTime: 15,
    protocols: 12,
  },
  {
    id: 3,
    name: "Enf. Ana Costa",
    role: "Enfermeira",
    assessments: 189,
    satisfaction: 94,
    responseTime: 18,
    protocols: 6,
  },
  {
    id: 4,
    name: "Enf. Pedro Alves",
    role: "Enfermeiro",
    assessments: 167,
    satisfaction: 95,
    responseTime: 16,
    protocols: 7,
  },
];

export default function TeamPerformance() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/equipe")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Performance da Equipe</h1>
            <p className="text-muted-foreground mt-1">Métricas e indicadores de desempenho</p>
          </div>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid gap-4">
        {performance.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                </div>
                <Badge variant="default" className="gap-2">
                  <Award className="w-4 h-4" />
                  Top Performer
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Avaliações</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{member.assessments}</p>
                  <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Satisfação</p>
                  <p className="text-2xl font-bold text-status-stable">{member.satisfaction}%</p>
                  <Progress value={member.satisfaction} className="mt-2 [&>div]:bg-status-stable" />
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Tempo Resposta</p>
                  <p className="text-2xl font-bold text-primary">{member.responseTime}min</p>
                  <p className="text-xs text-muted-foreground mt-1">Média de atendimento</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Protocolos</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{member.protocols}</p>
                  <p className="text-xs text-muted-foreground mt-1">Criados/revisados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
