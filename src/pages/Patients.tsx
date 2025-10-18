import { Search, Filter, Plus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PatientTable } from "@/components/patients/PatientTable";
import { StatusType } from "@/components/dashboard/StatusBadge";

const mockPatients = [
  {
    id: "1",
    name: "Maria Silva",
    age: 68,
    room: "201-A",
    sector: "UTI",
    bradenScore: 11,
    woundsCount: 3,
    lastAssessment: "Hoje, 09:30",
    status: "critical" as StatusType,
  },
  {
    id: "2",
    name: "João Santos",
    age: 75,
    room: "305-B",
    sector: "Clínica Médica",
    bradenScore: 13,
    woundsCount: 2,
    lastAssessment: "Ontem, 14:20",
    status: "warning" as StatusType,
  },
  {
    id: "3",
    name: "Ana Costa",
    age: 62,
    room: "102-C",
    sector: "Ortopedia",
    bradenScore: 16,
    woundsCount: 1,
    lastAssessment: "Hoje, 11:15",
    status: "stable" as StatusType,
  },
  {
    id: "4",
    name: "Pedro Oliveira",
    age: 58,
    room: "410-A",
    sector: "Cirurgia Geral",
    bradenScore: 14,
    woundsCount: 2,
    lastAssessment: "Há 2 dias",
    status: "improving" as StatusType,
  },
  {
    id: "5",
    name: "Lucia Mendes",
    age: 81,
    room: "203-B",
    sector: "UTI",
    bradenScore: 10,
    woundsCount: 4,
    lastAssessment: "Hoje, 08:00",
    status: "critical" as StatusType,
  },
  {
    id: "6",
    name: "Roberto Lima",
    age: 70,
    room: "308-A",
    sector: "Clínica Médica",
    bradenScore: 17,
    woundsCount: 1,
    lastAssessment: "Ontem, 16:45",
    status: "stable" as StatusType,
  },
];

export default function Patients() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie todos os pacientes sob cuidado da Comissão de Pele</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/pacientes/novo')}>
          <Plus className="w-4 h-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, leito ou prontuário..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold text-foreground">{mockPatients.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Críticos</p>
          <p className="text-2xl font-bold text-status-critical">
            {mockPatients.filter((p) => p.status === "critical").length}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Atenção</p>
          <p className="text-2xl font-bold text-status-warning">
            {mockPatients.filter((p) => p.status === "warning").length}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Estáveis</p>
          <p className="text-2xl font-bold text-status-stable">
            {mockPatients.filter((p) => p.status === "stable" || p.status === "improving").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <PatientTable patients={mockPatients} />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Mostrando {mockPatients.length} de {mockPatients.length} pacientes</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
