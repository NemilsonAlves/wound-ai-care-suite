import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import ReportViewer from '../components/ReportViewer';
import WoundPhotoViewer from '../components/WoundPhotoViewer';
import { 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  Heart, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  TrendingUp,
  AlertCircle,
  Download,
  Eye,
  Camera,
  Bell
} from 'lucide-react';
import { usePatientAuth } from '@/contexts/PatientAuthContextBase';
import { formatDate, formatPhone } from '../lib/utils';
import { supabase } from '@/lib/supabase';
import { EvolutionService } from '@/services/evolutionService';

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  type: string;
}

interface MedicalReport {
  id: string;
  title: string;
  date: string;
  doctor: string;
  specialty: string;
  type: 'consultation' | 'exam' | 'prescription' | 'surgery';
  status: 'available' | 'pending' | 'draft';
  summary: string;
  patient: {
    name: string;
    age: number;
    gender: string;
    id: string;
  };
  content: {
    complaint: string;
    examination: string;
    diagnosis: string;
    treatment: string;
    observations: string;
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    exams?: Array<{
      name: string;
      result: string;
      reference: string;
      status: 'normal' | 'altered' | 'critical';
    }>;
  };
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

interface WoundEvolution {
  id: string;
  date: string;
  location: string;
  stage: string;
  size: string;
  healing_progress: number;
  notes: string;
  photos: Array<{
    id: string;
    url: string;
    date: string;
    location: string;
    stage: string;
    size: string;
    notes: string;
    measurements?: {
      length: number;
      width: number;
      depth?: number;
      area: number;
    };
  }>;
}

const PatientPortal = () => {
  const { patient, signOut } = usePatientAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [evolutions, setEvolutions] = useState<WoundEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<WoundEvolution['photos'] | null>(null);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);
  const [aptStatusFilter, setAptStatusFilter] = useState<'all' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        setLoading(true);
        if (!patient?.id) {
          setAppointments([]);
          setReports([]);
          setEvolutions([]);
          return;
        }

        // Consultas do paciente
        const { data: apts, error: aptErr } = await supabase
          .from('appointments')          .select('id, patient_id, professional_id, specialty, date_time, status, notes, professional:profiles!appointments_professional_id_fkey(id, full_name)')
          .eq('patient_id', patient.id)
          .order('date_time', { ascending: true });
        if (aptErr) throw aptErr;

        const profIds = Array.from(new Set((apts || []).map(a => a.professional_id))).filter(Boolean);
        const profRes = profIds.length
          ? await supabase.from('profiles').select('id, full_name').in('id', profIds)
          : { data: [] as unknown[] };
        const profMap: Record<string, string> = Object.fromEntries((profRes.data || []).map(p => [p.id, p.full_name]));

        const mappedAppointments: Appointment[] = (apts || []).map(a => {
          const dt = new Date(a.date_time);
          const statusMap = (s: string): 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' => {            if (s === 'confirmed') return 'confirmed';            if (s === 'in_progress') return 'in_progress';            if (s === 'completed') return 'completed';            if (s === 'cancelled') return 'cancelled';            return 'scheduled';          };
          const specLabel = typeof a.specialty === 'string'
            ? (a.specialty.charAt(0).toUpperCase() + a.specialty.slice(1))
            : 'Especialidade';
          return {
            id: a.id,
            date: dt.toISOString().slice(0,10),
            time: dt.toTimeString().slice(0,5),
            doctor: (a as { professional?: { full_name?: string } }).professional?.full_name || profMap[a.professional_id] || 'Profissional',
            specialty: specLabel,
            status: statusMap(a.status),
            type: a.notes || 'Consulta'
          };
        });

        // Evoluções clínicas do paciente
        const { data: evos, error: evoErr } = await supabase
          .from('clinical_evolutions')
          .select('id, patient_id, evolution_data, ai_analysis, created_at')
          .eq('patient_id', patient.id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (evoErr) throw evoErr;

        const mappedEvolutions: WoundEvolution[] = (evos || []).map(e => {
          type EvolutionData = {
            dimensions?: { length?: number; width?: number };
            size?: string;
            wound_location?: string;
            notes?: string;
            wound_stage?: string;
            photos?: string[];
          };
          const ed: EvolutionData = (e as { evolution_data?: EvolutionData }).evolution_data || {};
          const dims = ed?.dimensions;
          const size = dims ? `${dims.length ?? '-'} x ${dims.width ?? '-'} cm` : (ed.size || '-');
          let progress = 0;
          try {
            const ai = typeof e.ai_analysis === 'string' ? JSON.parse(e.ai_analysis) : e.ai_analysis;
            progress = ai?.analysis_results?.healing_progress?.percentage ?? 0;
          } catch (parseErr) {
            // JSON inválido em ai_analysis; manter progresso em 0
            progress = 0;
          }
          const stageLabel = ed.wound_stage ? EvolutionService.getWoundStageLabel(ed.wound_stage) : '-';
          return {
            id: e.id,
            date: new Date(e.created_at).toISOString().slice(0,10),
            location: ed.wound_location || 'Local não especificado',
            stage: stageLabel,
            size,
            healing_progress: progress,
            notes: ed.notes || '',
            photos: ((ed.photos as string[]) || []).map((url: string, idx: number) => ({
              id: `${e.id}-photo-${idx}`,
              url,
              date: new Date(e.created_at).toISOString().slice(0,10),
              location: ed.wound_location || '',
              stage: stageLabel,
              size,
              notes: 'Foto registrada na evolução clínica'
            }))
          };
        });

        // Laudos a partir das análises de IA (wound_analyses)
        const evoIds = (evos || []).map(e => e.id);
        let mappedReports: MedicalReport[] = [];
        if (evoIds.length) {
          const { data: analyses, error: anErr } = await supabase
            .from('wound_analyses')
            .select('*')
            .in('evolution_id', evoIds)
            .order('created_at', { ascending: false });
          if (anErr) throw anErr;

          // Considerar apenas a análise mais recente por evolução
          type AnalysisRow = {
            id: string;
            evolution_id: string;
            created_at: string;
            analysis_results?: {
              wound_type?: string;
              wound_stage?: string;
              healing_progress?: { percentage?: number; status?: string };
              exudate?: { type?: string; amount?: string };
              dimensions?: { length?: number; width?: number };
              infection_signs?: { present?: boolean; indicators?: string[] };
              edges?: { condition?: string; attachment?: string };
              recommendations?: string[];
              confidence_score?: number;
            };
            image_url?: string;
          };
          const latestByEvolution: Record<string, AnalysisRow> = {};
          for (const an of analyses || []) {
            if (!latestByEvolution[an.evolution_id]) {
              latestByEvolution[an.evolution_id] = an;
            }
          }

          mappedReports = Object.values(latestByEvolution).map((an: AnalysisRow) => {
            const ar = an.analysis_results;
            const woundType = ar?.wound_type || 'Ferida';
            const woundStage = ar?.wound_stage ? EvolutionService.getWoundStageLabel(ar.wound_stage) : '';
            const progressPct = ar?.healing_progress?.percentage ?? 0;
            const progressStatus = ar?.healing_progress?.status || 'stable';
            const exudateInfo = ar?.exudate ? `${ar.exudate.type} (${ar.exudate.amount})` : '';
            const dimensions = ar?.dimensions ? `${ar.dimensions.length} x ${ar.dimensions.width} cm` : '';
            const infection = ar?.infection_signs?.present ? (ar.infection_signs.indicators || []).join(', ') : 'Ausente';
            const edges = ar?.edges ? `${ar.edges.condition}, ${ar.edges.attachment}` : '';
            const recommendations = (ar?.recommendations || []).join(' | ');

            const evo = (evos || []).find(e => e.id === an.evolution_id);
            const location = (evo as { evolution_data?: { wound_location?: string } })?.evolution_data?.wound_location || '';

            return {
              id: an.id,
              title: `Laudo de Evolução  ${location}`,
              date: new Date(an.created_at).toISOString().slice(0,10),
              doctor: 'Equipe de Enfermagem',
              specialty: 'Curativos',
              type: 'exam',
              status: 'available',
              summary: `Tipo: ${woundType}  Estágio: ${woundStage}  Progresso: ${Math.round(progressPct)}% (${progressStatus})`,
              patient: {
                name: patient?.full_name || 'Paciente',
                age: 0,
                gender: 'N/A',
                id: patient?.id || ''
              },
              content: {
                complaint: (evo as { evolution_data?: { notes?: string } })?.evolution_data?.notes || '',
                examination: `Dimensões: ${dimensions}. Exsudato: ${exudateInfo}. Margens: ${edges}.`,
                diagnosis: `Sinais de infecção: ${infection}. Estágio: ${woundStage}.`,
                treatment: recommendations || 'Aguardando recomendações.',
                observations: `Confiança IA: ${ar?.confidence_score ?? 0}`
              },
              attachments: an.image_url ? [
                { name: 'Imagem da ferida', type: 'image/jpeg', url: an.image_url }
              ] : []
            } as MedicalReport;
          });
        }

        setAppointments(mappedAppointments);
        setReports(mappedReports);
        setEvolutions(mappedEvolutions);
      } catch (err) {
        console.error('Erro ao carregar dados do paciente (Supabase):', err);
        setAppointments([]);
        setReports([]);
        setEvolutions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';      case 'confirmed': return 'bg-indigo-100 text-indigo-800';      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';      case 'confirmed': return 'Confirmada';      case 'in_progress': return 'Em andamento';
      case 'available': return 'Disponível';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={patient?.avatar_url} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {patient?.full_name?.split(' ').map(n => n[0]).join('') || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Olá, {patient?.full_name || 'Paciente'}!
                </h1>
                <p className="text-gray-600">Portal do Paciente</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="appointments">Consultas</TabsTrigger>
            <TabsTrigger value="reports">Laudos</TabsTrigger>
            <TabsTrigger value="evolution">Evolução</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Próxima Consulta</p>
                      <p className="text-2xl font-bold text-gray-900">{appointments[0] ? formatDate(appointments[0].date) : '--'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Laudos</p>
                      <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Evoluções</p>
                      <p className="text-2xl font-bold text-gray-900">{evolutions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Progresso</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round((evolutions[0]?.healing_progress ?? 0))}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Próximas Consultas</CardTitle>
                  <CardDescription>Suas consultas agendadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments
                      .filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed')
                      .filter(apt => {
                        const dt = new Date(`${apt.date}T${apt.time}`);
                        return dt >= new Date();
                      })
                      .sort((a, b) => {
                        const da = new Date(`${a.date}T${a.time}`);
                        const db = new Date(`${b.date}T${b.time}`);
                        return da.getTime() - db.getTime();
                      })
                      .map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{appointment.type}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(appointment.date)} às {appointment.time}
                            </p>
                            <p className="text-sm text-gray-500">{appointment.doctor}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Evolução Recente</CardTitle>
                  <CardDescription>Progresso do seu tratamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {evolutions.slice(0, 2).map((evolution) => (
                      <div key={evolution.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{evolution.location}</h4>
                          <span className="text-sm text-gray-500">
                            {formatDate(evolution.date)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso de Cicatrização</span>
                            <span>{Math.round(evolution.healing_progress)}%</span>
                          </div>
                          <Progress value={evolution.healing_progress} className="h-2" />
                          <p className="text-sm text-gray-600">{evolution.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Consultas</CardTitle>
                <CardDescription>Histórico e agendamentos de consultas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">Filtrar por status</div>
                  <select
                    className="border rounded-md px-2 py-1 text-sm"
                    value={aptStatusFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAptStatusFilter(e.target.value as 'all' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled')}
                  >
                    <option value="all">Todos</option>
                    <option value="scheduled">Agendada</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="in_progress">Em andamento</option>
                    <option value="completed">Concluída</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                <div className="space-y-4">
                  {appointments
                    .filter(apt => aptStatusFilter === 'all' ? true : apt.status === aptStatusFilter)
                    .sort((a, b) => {
                      const da = new Date(`${a.date}T${a.time}`);
                      const db = new Date(`${b.date}T${b.time}`);
                      return da.getTime() - db.getTime();
                    })
                    .map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{appointment.type}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(appointment.date)} às {appointment.time}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.doctor} - {appointment.specialty}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusText(appointment.status)}
                        </Badge>
                        {appointment.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Meus Laudos</CardTitle>
                <CardDescription>Relatórios médicos e exames</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div>
                          <h4 className="font-medium">{report.title}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(report.date)} - {report.doctor}
                          </p>
                          <p className="text-sm text-gray-500">{report.summary}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusText(report.status)}
                        </Badge>
                        {report.status === 'available' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evolution Tab */}
          <TabsContent value="evolution">
            <Card>
              <CardHeader>
                <CardTitle>Evolução Clínica</CardTitle>
                <CardDescription>Acompanhamento da cicatrização</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {evolutions.map((evolution) => (
                    <div key={evolution.id} className="p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium">{evolution.location}</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(evolution.date)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Estágio</p>
                          <p className="text-lg">{evolution.stage}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Tamanho</p>
                          <p className="text-lg">{evolution.size}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Progresso</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={evolution.healing_progress} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{Math.round(evolution.healing_progress)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">Observações</p>
                        <p className="text-gray-700">{evolution.notes}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Camera className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {evolution.photos.length} foto(s) disponível(is)
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedPhotos(evolution.photos);
                            setPhotoViewerIndex(0);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Fotos
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {selectedReport && (
        <ReportViewer
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

      {selectedPhotos && (
        <WoundPhotoViewer
          photos={selectedPhotos}
          initialPhotoIndex={photoViewerIndex}
          onClose={() => setSelectedPhotos(null)}
        />
      )}
    </div>
  );
};

export default PatientPortal;



