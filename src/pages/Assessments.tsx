import { useEffect, useMemo, useState } from "react";
import { Camera, Clock, User, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { supabase } from "@/lib/supabase";
import { EvolutionService } from "@/services/evolutionService";

type AssessmentStatus = 'critical' | 'warning' | 'stable' | 'improving';
interface AssessmentListItem {
  id: string;
  patient: string;
  woundType: string;
  stage: string;
  location: string;
  date: string;
  status: AssessmentStatus;
  assessor: string;
}

export default function Assessments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [assessments, setAssessments] = useState<AssessmentListItem[]>([]);
  const [stats, setStats] = useState({ today: 0, week: 0, pending: 0, aiConfidence: 0 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Buscar evoluções clínicas recentes
        const { data: evols, error } = await supabase
          .from('clinical_evolutions')
          .select('id, patient_id, professional_id, evolution_data, ai_analysis, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        const patientIds = Array.from(new Set((evols || []).map(e => e.patient_id))).filter(Boolean);
        const profIds = Array.from(new Set((evols || []).map(e => e.professional_id))).filter(Boolean);

        const [patientsRes, profsRes] = await Promise.all([
          patientIds.length ? supabase.from('patients').select('id, full_name').in('id', patientIds) : Promise.resolve({ data: [], error: null }),
          profIds.length ? supabase.from('profiles').select('id, full_name').in('id', profIds) : Promise.resolve({ data: [], error: null }),
        ]);

        const patientsMap = Object.fromEntries((patientsRes.data || []).map(p => [p.id, p.full_name]));
        const profsMap = Object.fromEntries((profsRes.data || []).map(p => [p.id, p.full_name]));

        const items: AssessmentListItem[] = (evols || []).map(e => {
          type EvolutionData = {
            wound_type?: string;
            wound_stage?: string;
            wound_location?: string;
            notes?: string;
          };
          const ed: EvolutionData = (e as { evolution_data?: EvolutionData }).evolution_data || {};
          const woundTypeLabel = ed.wound_type ? EvolutionService.getWoundTypeLabel(ed.wound_type) : '-';
          const stageLabel = ed.wound_stage ? EvolutionService.getWoundStageLabel(ed.wound_stage) : '-';
          const status: AssessmentStatus = (() => {
            if (!e.ai_analysis) return 'warning';
            try {
              const parsed = typeof e.ai_analysis === 'string' ? JSON.parse(e.ai_analysis) : e.ai_analysis;
              const hp = parsed?.analysis_results?.healing_progress?.status;
              if (hp === 'deteriorating') return 'critical';
              if (hp === 'improving') return 'improving';
              return 'stable';
            } catch {
              return 'stable';
            }
          })();
          return {
            id: e.id,
            patient: patientsMap[e.patient_id] || 'Paciente',
            woundType: woundTypeLabel,
            stage: stageLabel,
            location: ed.wound_location || '-',
            date: new Date(e.created_at).toLocaleString('pt-BR'),
            status,
            assessor: profsMap[e.professional_id] || 'Profissional',
          };
        });

        if (mounted) setAssessments(items);

        // Métricas
        const todayStart = new Date(); todayStart.setHours(0,0,0,0);
        const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);

        const [{ count: today }, { count: week }, { count: pending }, { count: total }] = await Promise.all([
          supabase.from('clinical_evolutions').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
          supabase.from('clinical_evolutions').select('*', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
          supabase.from('clinical_evolutions').select('ai_analysis', { count: 'exact', head: true }).is('ai_analysis', null),
          supabase.from('clinical_evolutions').select('*', { count: 'exact', head: true }),
        ]);

        const aiConfidence = total ? Math.round(((total - (pending || 0)) / total) * 100) : 0;
        if (mounted) setStats({ today: today || 0, week: week || 0, pending: pending || 0, aiConfidence });
      } catch (err) {
        console.error('Erro ao carregar avaliações do Supabase:', err);
        if (mounted) {
          setAssessments([]);
          setStats({ today: 0, week: 0, pending: 0, aiConfidence: 0 });
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesStatus = filterStatus === 'all' || assessment.status === (filterStatus as AssessmentStatus);
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch = !term || (
        assessment.patient.toLowerCase().includes(term) ||
        assessment.woundType.toLowerCase().includes(term) ||
        assessment.location.toLowerCase().includes(term)
      );
      return matchesStatus && matchesSearch;
    });
  }, [assessments, filterStatus, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Avaliações de Feridas</h1>
          <p className="text-muted-foreground mt-1">Registre e acompanhe avaliações com análise por IA</p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => navigate('/avaliacoes/nova')}>
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
                <p className="text-2xl font-bold">{stats.today}</p>
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
                <p className="text-2xl font-bold">{stats.week}</p>
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
                <p className="text-2xl font-bold">{stats.pending}</p>
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
                <p className="text-2xl font-bold">{stats.aiConfidence}%</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-status-stable/20 flex items-center justify-center">
                <span className="text-status-stable"></span>
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
            {filteredAssessments.map((assessment) => (
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
                      <span></span>
                      <span>{assessment.stage}</span>
                      <span></span>
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
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/avaliacoes/${assessment.id}`)}>Ver Detalhes</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
