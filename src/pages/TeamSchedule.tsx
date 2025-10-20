import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const schedules = [
  {
    id: 1,
    name: "Dr. Carlos Silva",
    role: "Médico Estomaterapeuta",
    shifts: [
      { day: "Segunda", hours: "08:00 - 16:00", type: "manhã-tarde" },
      { day: "Quarta", hours: "08:00 - 16:00", type: "manhã-tarde" },
      { day: "Sexta", hours: "08:00 - 16:00", type: "manhã-tarde" },
    ],
  },
  {
    id: 2,
    name: "Enf. Maria Santos",
    role: "Enfermeira Especialista",
    shifts: [
      { day: "Terça", hours: "14:00 - 22:00", type: "tarde-noite" },
      { day: "Quinta", hours: "14:00 - 22:00", type: "tarde-noite" },
      { day: "Sábado", hours: "08:00 - 16:00", type: "manhã-tarde" },
    ],
  },
  {
    id: 3,
    name: "Enf. Ana Costa",
    role: "Enfermeira",
    shifts: [
      { day: "Segunda", hours: "14:00 - 22:00", type: "tarde-noite" },
      { day: "Quarta", hours: "14:00 - 22:00", type: "tarde-noite" },
      { day: "Sexta", hours: "14:00 - 22:00", type: "tarde-noite" },
    ],
  },
];

export default function TeamSchedule() {
  const navigate = useNavigate();

  const getShiftColor = (type: string) => {
    switch (type) {
      case "manhã-tarde":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "tarde-noite":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/equipe")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Escalas de Trabalho</h1>
            <p className="text-muted-foreground mt-1">Visualize e gerencie as escalas da equipe</p>
          </div>
        </div>
        <Button className="gap-2">
          <Calendar className="w-5 h-5" />
          Editar Escalas
        </Button>
      </div>

      {/* Schedule Cards */}
      <div className="grid gap-6">
        {schedules.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{member.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                </div>
                <Badge variant="outline">{member.shifts.length} turnos/semana</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {member.shifts.map((shift, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getShiftColor(shift.type)}`}
                  >
                    <p className="font-semibold mb-2">{shift.day}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{shift.hours}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
