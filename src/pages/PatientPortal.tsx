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
import { usePatientAuth } from '../contexts/PatientAuthContext';
import { formatDate, formatPhone } from '../lib/utils';

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  status: 'scheduled' | 'completed' | 'cancelled';
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
  const [selectedPhotos, setSelectedPhotos] = useState<any[] | null>(null);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);

  useEffect(() => {
    // Simular carregamento de dados do paciente
    const loadPatientData = async () => {
      setLoading(true);
      
      // Dados simulados
      setAppointments([
        {
          id: '1',
          date: '2024-01-15',
          time: '14:30',
          doctor: 'Dr. João Silva',
          specialty: 'Dermatologia',
          status: 'scheduled',
          type: 'Consulta de Rotina'
        },
        {
          id: '2',
          date: '2024-01-08',
          time: '10:00',
          doctor: 'Enfª Maria Santos',
          specialty: 'Enfermagem',
          status: 'completed',
          type: 'Curativo'
        }
      ]);

      setReports([
        {
          id: '1',
          title: 'Relatório de Consulta - Dermatologia',
          date: '2024-01-08',
          doctor: 'Dr. João Silva',
          specialty: 'Dermatologia',
          type: 'consultation',
          status: 'available',
          summary: 'Avaliação de ferida em processo de cicatrização. Evolução positiva observada.',
          patient: {
            name: profile?.full_name || 'Paciente Demo',
            age: 45,
            gender: 'Masculino',
            id: 'PAC001'
          },
          content: {
            complaint: 'Paciente relata ferida na perna direita há 3 semanas, com dor moderada e dificuldade de cicatrização.',
            examination: 'Ferida de aproximadamente 3x2 cm na região anterior da perna direita, com bordas regulares, presença de tecido de granulação e ausência de sinais de infecção.',
            diagnosis: 'Úlcera venosa crônica em processo de cicatrização - Estágio II',
            treatment: 'Limpeza diária com soro fisiológico, aplicação de hidrogel e curativo com filme transparente. Repouso com elevação do membro.',
            observations: 'Paciente orientado sobre cuidados domiciliares e sinais de alerta. Retorno em 7 dias para reavaliação.',
            medications: [
              {
                name: 'Diosmin + Hesperidina 450mg + 50mg',
                dosage: '1 comprimido',
                frequency: '2x ao dia',
                duration: '30 dias'
              }
            ]
          }
        },
        {
          id: '2',
          title: 'Exame Laboratorial',
          date: '2024-01-05',
          doctor: 'Lab. Central',
          specialty: 'Laboratório',
          type: 'exam',
          status: 'available',
          summary: 'Hemograma completo e marcadores inflamatórios dentro da normalidade.',
          patient: {
            name: profile?.full_name || 'Paciente Demo',
            age: 45,
            gender: 'Masculino',
            id: 'PAC001'
          },
          content: {
            complaint: 'Exames de rotina para acompanhamento do tratamento',
            examination: 'Coleta de sangue venoso em jejum',
            diagnosis: 'Exames laboratoriais dentro dos parâmetros normais',
            treatment: 'Manter tratamento atual',
            observations: 'Resultados satisfatórios, sem alterações significativas',
            exams: [
              {
                name: 'Hemoglobina',
                result: '14.2 g/dL',
                reference: '12.0 - 16.0 g/dL',
                status: 'normal'
              },
              {
                name: 'Leucócitos',
                result: '7.800 /mm³',
                reference: '4.000 - 11.000 /mm³',
                status: 'normal'
              },
              {
                name: 'PCR',
                result: '2.1 mg/L',
                reference: '< 3.0 mg/L',
                status: 'normal'
              }
            ]
          }
        }
      ]);

      setEvolutions([
        {
          id: '1',
          date: '2024-01-08',
          location: 'Perna direita',
          stage: 'Estágio II',
          size: '3.2 x 2.1 cm',
          healing_progress: 75,
          notes: 'Boa evolução, tecido de granulação presente',
          photos: [
            {
              id: 'photo1',
              url: '/api/placeholder/600/400',
              date: '2024-01-08',
              location: 'Perna direita',
              stage: 'Estágio II',
              size: '3.2 x 2.1 cm',
              notes: 'Foto após limpeza e aplicação do curativo',
              measurements: {
                length: 3.2,
                width: 2.1,
                depth: 0.8,
                area: 6.72
              }
            },
            {
              id: 'photo2',
              url: '/api/placeholder/600/400',
              date: '2024-01-08',
              location: 'Perna direita',
              stage: 'Estágio II',
              size: '3.2 x 2.1 cm',
              notes: 'Vista lateral da ferida',
              measurements: {
                length: 3.2,
                width: 2.1,
                area: 6.72
              }
            }
          ]
        },
        {
          id: '2',
          date: '2024-01-01',
          location: 'Perna direita',
          stage: 'Estágio II',
          size: '4.1 x 2.8 cm',
          healing_progress: 45,
          notes: 'Início do tratamento, limpeza da ferida realizada',
          photos: [
            {
              id: 'photo3',
              url: '/api/placeholder/600/400',
              date: '2024-01-01',
              location: 'Perna direita',
              stage: 'Estágio II',
              size: '4.1 x 2.8 cm',
              notes: 'Estado inicial da ferida',
              measurements: {
                length: 4.1,
                width: 2.8,
                depth: 1.2,
                area: 11.48
              }
            }
          ]
        }
      ]);

      setLoading(false);
    };

    loadPatientData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
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
                      <p className="text-2xl font-bold text-gray-900">15/01</p>
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
                      <p className="text-2xl font-bold text-gray-900">75%</p>
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
                    {appointments.filter(apt => apt.status === 'scheduled').map((appointment) => (
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
                            <span>{evolution.healing_progress}%</span>
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
                <div className="space-y-4">
                  {appointments.map((appointment) => (
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
                            <span className="text-sm font-medium">{evolution.healing_progress}%</span>
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