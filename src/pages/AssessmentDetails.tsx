import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Camera, ArrowLeft, MapPin, User, Clock } from "lucide-react";
import WoundPhotoViewer from "@/components/WoundPhotoViewer";
import { WoundSizeVisualizer } from "@/components/assessments/WoundSizeVisualizer";
import { AIAnalysisPanel } from "@/components/ai/AIAnalysisPanel";
import { AIAnalysisService, WoundAnalysis } from "@/services/aiAnalysisService";
import { supabase } from "@/lib/supabase";
import { EvolutionService } from "@/services/evolutionService";

type AssessmentStatus = 'critical' | 'warning' | 'stable' | 'improving';

interface AssessmentItem {
  id: string;
  patient: string;
  woundType: string;
  stage: string;
  location: string;
  date: string;
  status: AssessmentStatus;
  assessor: string;
}

export default function AssessmentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [analyses, setAnalyses] = useState<WoundAnalysis[]>([]);
  const [assessment, setAssessment] = useState<AssessmentItem | null>(null);
  const evolutionId = `avaliacao-${id ?? 'desconhecido'}`;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: evo, error } = await supabase
          .from('clinical_evolutions')
          .select('id, patient_id, professional_id, evolution_data, ai_analysis, created_at')
          .eq('id', id)
          .single();
        if (error) throw error;

        const [patientRes, profRes] = await Promise.all([
          supabase.from('patients').select('id, full_name').eq('id', evo.patient_id).single(),
          supabase.from('profiles').select('id, full_name').eq('id', evo.professional_id).maybeSingle(),
        ]);

        type EvolutionData = {
          wound_type?: string;
          wound_stage?: string;
          wound_location?: string;
          notes?: string;
        };
        const ed: EvolutionData = (evo as { evolution_data?: EvolutionData }).evolution_data || {};
        const woundTypeLabel = ed.wound_type ? EvolutionService.getWoundTypeLabel(ed.wound_type) : '-';
        const stageLabel = ed.wound_stage ? EvolutionService.getWoundStageLabel(ed.wound_stage) : '-';
        const status: AssessmentStatus = (() => {
          if (!evo.ai_analysis) return 'warning';
          try {
            const parsed = typeof evo.ai_analysis === 'string' ? JSON.parse(evo.ai_analysis) : evo.ai_analysis;
            const hp = parsed?.analysis_results?.healing_progress?.status;
            if (hp === 'deteriorating') return 'critical';
            if (hp === 'improving') return 'improving';
            return 'stable';
          } catch {
            return 'stable';
          }
        })();

        const item: AssessmentItem = {
          id: evo.id,
          patient: patientRes.data?.full_name || 'Paciente',
          woundType: woundTypeLabel,
          stage: stageLabel,
          location: ed.wound_location || '-',
          date: new Date(evo.created_at).toLocaleString('pt-BR'),
          status,
          assessor: profRes.data?.full_name || 'Profissional',
        };
        if (mounted) setAssessment(item);
      } catch (err) {
        console.error('Erro ao carregar avaliação do Supabase:', err);
        if (mounted) setAssessment(null);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await AIAnalysisService.getAnalysesByEvolution(evolutionId);
        if (mounted) setAnalyses(data);
      } catch (err) {
        console.error('Erro ao carregar análises para detalhes:', err);
      }
    })();
    return () => { mounted = false; };
  }, [evolutionId]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/avaliacoes')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Detalhes da Avaliação</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Exportar</Button>
          <Button size="sm" className="gap-2">
            <Camera className="w-4 h-4" />
            Nova Foto
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          {assessment ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{assessment.patient}</h2>
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
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {assessment.date}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> {assessment.assessor}
                  </p>
                </div>
                <StatusBadge status={assessment.status} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Avaliação não encontrada</h2>
                <p className="text-sm text-muted-foreground">ID: {id}</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/avaliacoes')}>Voltar para lista</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fotos e Medições</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Fotos derivadas das análises já realizadas */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photosFromAnalyses(analyses).map((photo, index) => (
                  <button
                    key={photo.id}
                    className="group rounded-lg overflow-hidden border hover:border-primary"
                    onClick={() => { setViewerIndex(index); setViewerOpen(true); }}
                    aria-label={`Abrir foto ${index + 1}`}
                  >
                    <img
                      src={photo.url}
                      alt={`${photo.location} - ${photo.date}`}
                      className="w-full h-24 object-cover group-hover:opacity-90"
                    />
                    <div className="p-2 text-xs text-muted-foreground flex items-center justify-between">
                      <span>{photo.location}</span>
                      <span>{photo.stage}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Visualização de tamanho baseada na foto selecionada */}
              {photosFromAnalyses(analyses)[viewerIndex]?.measurements && (
                <div className="mt-4">
                  <WoundSizeVisualizer
                    length={photosFromAnalyses(analyses)[viewerIndex]!.measurements!.length}
                    width={photosFromAnalyses(analyses)[viewerIndex]!.measurements!.width}
                    depth={photosFromAnalyses(analyses)[viewerIndex]!.measurements!.depth}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setViewerOpen(true)} className="gap-2" disabled={photosFromAnalyses(analyses).length === 0}>
                  <Camera className="w-4 h-4" /> Abrir Visualizador
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise por IA</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Painel real de análise por IA com upload e histórico */}
            <AIAnalysisPanel 
              evolutionId={evolutionId}
              onAnalysisComplete={(analysis) => {
                setAnalyses(prev => [analysis, ...prev]);
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Viewer Fullscreen */}
      {viewerOpen && (
        <WoundPhotoViewer
          photos={photosFromAnalyses(analyses)}
          initialPhotoIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}

// Converte análises em fotos para o viewer
function photosFromAnalyses(list: WoundAnalysis[]) {
  return list.map((a, idx) => ({
    id: a.id ?? `analysis-${idx}`,
    url: a.image_url ?? '/api/placeholder/400/300',
    date: new Date(a.created_at ?? Date.now()).toLocaleDateString('pt-BR'),
    location: 'Local não especificado',
    stage: a.analysis_results?.wound_stage ? AIAnalysisService.getStageLabel(a.analysis_results.wound_stage) : '-',
    size: `${a.analysis_results?.dimensions?.length ?? '-'} x ${a.analysis_results?.dimensions?.width ?? '-'} cm`,
    notes: 'Imagem analisada pela IA',
    measurements: a.analysis_results?.dimensions ? {
      length: a.analysis_results.dimensions.length,
      width: a.analysis_results.dimensions.width,
      depth: a.analysis_results.dimensions.depth,
      area: a.analysis_results.dimensions.area,
    } : undefined,
  }));
}
