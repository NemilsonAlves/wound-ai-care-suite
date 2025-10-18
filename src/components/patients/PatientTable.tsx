import { Eye, Edit, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge, StatusType } from "@/components/dashboard/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Patient {
  id: string;
  name: string;
  age: number;
  room: string;
  sector: string;
  bradenScore: number;
  woundsCount: number;
  lastAssessment: string;
  status: StatusType;
}

interface PatientTableProps {
  patients: Patient[];
}

export function PatientTable({ patients }: PatientTableProps) {
  const navigate = useNavigate();

  const getBradenRisk = (score: number): { label: string; className: string } => {
    if (score <= 12) return { label: "Alto Risco", className: "bg-status-critical/10 text-status-critical" };
    if (score <= 14) return { label: "Risco Moderado", className: "bg-status-warning/10 text-status-warning" };
    if (score <= 18) return { label: "Risco Baixo", className: "bg-status-stable/10 text-status-stable" };
    return { label: "Sem Risco", className: "bg-muted text-muted-foreground" };
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Paciente</TableHead>
            <TableHead className="font-semibold">Leito / Setor</TableHead>
            <TableHead className="font-semibold">Score Braden</TableHead>
            <TableHead className="font-semibold">Nº Lesões</TableHead>
            <TableHead className="font-semibold">Última Avaliação</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => {
            const bradenRisk = getBradenRisk(patient.bradenScore);
            return (
              <TableRow key={patient.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.age} anos</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{patient.room}</p>
                    <p className="text-sm text-muted-foreground">{patient.sector}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bradenRisk.className}`}>
                    {patient.bradenScore} - {bradenRisk.label}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-foreground">{patient.woundsCount}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{patient.lastAssessment}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={patient.status} size="sm" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/pacientes/${patient.id}`)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/avaliacoes/nova')}>
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
