import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  Brain, 
  Search, 
  Filter, 
  Eye, 
  BarChart3, 
  Camera, 
  Zap,
  TrendingUp,
  AlertTriangle,
  Calendar,
  User,
  FileImage
} from 'lucide-react';
import { PageHeader } from '../components/ui/page-header';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { EmptyState } from '../components/ui/empty-state';
import { StatusBadge } from '../components/ui/status-badge';
import { AIAnalysisPanel } from '../components/ai/AIAnalysisPanel';
import { AIComparisonChart } from '../components/ai/AIComparisonChart';
import { AIAnalysisService, WoundAnalysis } from '../services/aiAnalysisService';
import { EvolutionService, Evolution } from '../services/evolutionService';
import { PatientService, Patient } from '../services/patientService';

export const AIAnalysis: React.FC = () => {
  const [analyses, setAnalyses] = useState<WoundAnalysis[]>([]);
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedWoundType, setSelectedWoundType] = useState<string>('');
  const [selectedEvolution, setSelectedEvolution] = useState<Evolution | null>(null);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [evolutionsData, patientsData] = await Promise.all([
        EvolutionService.getAll(),
        PatientService.getAll()
      ]);
      
      setEvolutions(evolutionsData);
      setPatients(patientsData);
      
      // Carregar análises para todas as evoluções
      const allAnalyses: WoundAnalysis[] = [];
      for (const evolution of evolutionsData) {
        const evolutionAnalyses = await AIAnalysisService.getAnalysesByEvolution(evolution.id);
        allAnalyses.push(...evolutionAnalyses);
      }
      setAnalyses(allAnalyses);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvolutions = evolutions.filter(evolution => {
    const patient = patients.find(p => p.id === evolution.patient_id);
    const patientName = patient ? `${patient.name}` : '';
    
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evolution.wound_location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPatient = !selectedPatient || evolution.patient_id === selectedPatient;
    const matchesWoundType = !selectedWoundType || evolution.wound_type === selectedWoundType;
    
    return matchesSearch && matchesPatient && matchesWoundType;
  });

  const getEvolutionAnalyses = (evolutionId: string) => {
    return analyses.filter(analysis => analysis.evolution_id === evolutionId);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Paciente não encontrado';
  };

  const getLatestAnalysis = (evolutionId: string) => {
    const evolutionAnalyses = getEvolutionAnalyses(evolutionId);
    return evolutionAnalyses.length > 0 ? evolutionAnalyses[0] : null;
  };

  const handleAnalysisComplete = (analysis: WoundAnalysis) => {
    setAnalyses(prev => [analysis, ...prev]);
  };

  const renderEvolutionCard = (evolution: Evolution) => {
    const evolutionAnalyses = getEvolutionAnalyses(evolution.id);
    const latestAnalysis = getLatestAnalysis(evolution.id);
    const patientName = getPatientName(evolution.patient_id);

    return (
      <Card key={evolution.id} className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{patientName}</CardTitle>
            <div className="flex items-center gap-2">
              {evolutionAnalyses.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  {evolutionAnalyses.length} análise{evolutionAnalyses.length !== 1 ? 's' : ''}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {evolution.wound_type}
              </Badge>
            </div>
          </div>
          <CardDescription>
            {evolution.wound_location} • {new Date(evolution.created_at).toLocaleDateString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Informações da ferida */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Dimensões:</span>
                <p className="font-medium">{evolution.length} x {evolution.width} cm</p>
              </div>
              <div>
                <span className="text-gray-600">Estágio:</span>
                <p className="font-medium">{evolution.stage}</p>
              </div>
            </div>

            {/* Última análise por IA */}
            {latestAnalysis && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Última Análise por IA</span>
                  <Badge 
                    variant="secondary"
                    className={AIAnalysisService.getConfidenceColor(latestAnalysis.analysis_results.confidence_score)}
                  >
                    {(latestAnalysis.analysis_results.confidence_score * 100).toFixed(0)}% confiança
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-blue-600">Tipo:</span>
                    <p className="font-medium text-blue-800">
                      {AIAnalysisService.getWoundTypeLabel(latestAnalysis.analysis_results.wound_type)}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-600">Cicatrização:</span>
                    <p className="font-medium text-blue-800">
                      {latestAnalysis.analysis_results.healing_progress.percentage}%
                    </p>
                  </div>
                </div>
                {latestAnalysis.analysis_results.infection_signs.present && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                    <AlertTriangle className="h-3 w-3" />
                    Possíveis sinais de infecção
                  </div>
                )}
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedEvolution(evolution);
                  setShowAnalysisDialog(true);
                }}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Análises
              </Button>
              {evolutionAnalyses.length === 0 && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedEvolution(evolution);
                    setShowAnalysisDialog(true);
                  }}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Analisar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAnalysisStats = () => {
    const totalAnalyses = analyses.length;
    const analysesWithInfection = analyses.filter(a => a.analysis_results.infection_signs.present).length;
    const improvingAnalyses = analyses.filter(a => a.analysis_results.healing_progress.status === 'improving').length;
    const avgConfidence = analyses.length > 0 
      ? analyses.reduce((sum, a) => sum + a.analysis_results.confidence_score, 0) / analyses.length 
      : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Análises</p>
                <p className="text-2xl font-bold">{totalAnalyses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Melhorando</p>
                <p className="text-2xl font-bold text-green-600">{improvingAnalyses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Com Infecção</p>
                <p className="text-2xl font-bold text-red-600">{analysesWithInfection}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Confiança Média</p>
                <p className="text-2xl font-bold text-purple-600">{(avgConfidence * 100).toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Análise por IA"
          description="Análise inteligente de feridas com tecnologia de IA"
          icon={Brain}
        />
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Análise por IA"
        description="Análise inteligente de feridas com tecnologia de IA"
        icon={Brain}
      />

      {renderAnalysisStats()}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por paciente ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os pacientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os pacientes</SelectItem>
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedWoundType} onValueChange={setSelectedWoundType}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="pressure_ulcer">Úlcera por Pressão</SelectItem>
                <SelectItem value="diabetic_ulcer">Úlcera Diabética</SelectItem>
                <SelectItem value="venous_ulcer">Úlcera Venosa</SelectItem>
                <SelectItem value="arterial_ulcer">Úlcera Arterial</SelectItem>
                <SelectItem value="surgical_wound">Ferida Cirúrgica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de evoluções */}
      {filteredEvolutions.length === 0 ? (
        <EmptyState
          icon={FileImage}
          title="Nenhuma evolução encontrada"
          description="Não há evoluções que correspondam aos filtros selecionados."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvolutions.map(renderEvolutionCard)}
        </div>
      )}

      {/* Dialog de análise */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Análise por IA - {selectedEvolution && getPatientName(selectedEvolution.patient_id)}
            </DialogTitle>
            <DialogDescription>
              {selectedEvolution && (
                <>
                  {selectedEvolution.wound_location} • {selectedEvolution.wound_type}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvolution && (
            <Tabs defaultValue="analysis" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analysis">Análise</TabsTrigger>
                <TabsTrigger value="comparison">Comparação</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis" className="mt-6">
                <AIAnalysisPanel
                  evolutionId={selectedEvolution.id}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </TabsContent>
              
              <TabsContent value="comparison" className="mt-6">
                <AIComparisonChart
                  evolutionId={selectedEvolution.id}
                  analyses={getEvolutionAnalyses(selectedEvolution.id)}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIAnalysis;