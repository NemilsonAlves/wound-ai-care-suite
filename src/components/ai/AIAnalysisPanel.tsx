import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  Brain, 
  Camera, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Eye,
  Upload
} from 'lucide-react';
import { AIAnalysisService, WoundAnalysis } from '../../services/aiAnalysisService';
import { LoadingSpinner } from '../ui/loading-spinner';

interface AIAnalysisPanelProps {
  evolutionId: string;
  onAnalysisComplete?: (analysis: WoundAnalysis) => void;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  evolutionId,
  onAnalysisComplete
}) => {
  const [analyses, setAnalyses] = useState<WoundAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    loadAnalyses();
  }, [evolutionId]);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      const data = await AIAnalysisService.getAnalysesByEvolution(evolutionId);
      setAnalyses(data);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setAnalyzing(true);
      const analysis = await AIAnalysisService.analyzeWoundImage({
        image_file: selectedFile,
        evolution_id: evolutionId
      });
      
      setAnalyses(prev => [analysis, ...prev]);
      setSelectedFile(null);
      onAnalysisComplete?.(analysis);
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const renderCurrentAnalysis = (analysis: WoundAnalysis) => {
    const { analysis_results } = analysis;

    return (
      <div className="space-y-6">
        {/* Header com confiança */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Análise por IA</h3>
          </div>
          <Badge 
            variant={analysis_results.confidence_score >= 0.8 ? 'default' : 'secondary'}
            className={AIAnalysisService.getConfidenceColor(analysis_results.confidence_score)}
          >
            Confiança: {(analysis_results.confidence_score * 100).toFixed(0)}%
          </Badge>
        </div>

        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Tipo e Estágio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <p className="font-medium">{AIAnalysisService.getWoundTypeLabel(analysis_results.wound_type)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Estágio:</span>
                  <p className="font-medium">{AIAnalysisService.getStageLabel(analysis_results.wound_stage)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Dimensões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Comprimento:</span>
                  <span className="font-medium">{analysis_results.dimensions.length} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Largura:</span>
                  <span className="font-medium">{analysis_results.dimensions.width} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Área:</span>
                  <span className="font-medium">{analysis_results.dimensions.area} cm²</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Composição tecidual */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Composição Tecidual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analysis_results.tissue_types).map(([type, percentage]) => (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                    <span>{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status de cicatrização */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progresso de Cicatrização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge 
                  variant={analysis_results.healing_progress.status === 'improving' ? 'default' : 'secondary'}
                  className={AIAnalysisService.getHealingStatusColor(analysis_results.healing_progress.status)}
                >
                  {analysis_results.healing_progress.status === 'improving' && <TrendingUp className="h-3 w-3 mr-1" />}
                  {analysis_results.healing_progress.status === 'deteriorating' && <TrendingDown className="h-3 w-3 mr-1" />}
                  {analysis_results.healing_progress.status === 'stable' && <Minus className="h-3 w-3 mr-1" />}
                  {analysis_results.healing_progress.status === 'improving' ? 'Melhorando' : 
                   analysis_results.healing_progress.status === 'stable' ? 'Estável' : 'Piorando'}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{analysis_results.healing_progress.percentage}%</span>
                </div>
                <Progress value={analysis_results.healing_progress.percentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sinais de infecção */}
        {analysis_results.infection_signs.present && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Possíveis sinais de infecção detectados:</strong>
              <ul className="mt-1 ml-4 list-disc">
                {analysis_results.infection_signs.indicators.map((indicator, index) => (
                  <li key={index} className="text-sm">{indicator}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Recomendações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recomendações da IA</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis_results.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnalysisHistory = () => {
    if (analyses.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma análise disponível</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {analyses.map((analysis, index) => (
          <Card key={analysis.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Análise #{analyses.length - index}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <p className="font-medium">{AIAnalysisService.getWoundTypeLabel(analysis.analysis_results.wound_type)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Área:</span>
                  <p className="font-medium">{analysis.analysis_results.dimensions.area} cm²</p>
                </div>
                <div>
                  <span className="text-gray-600">Cicatrização:</span>
                  <p className="font-medium">{analysis.analysis_results.healing_progress.percentage}%</p>
                </div>
                <div>
                  <span className="text-gray-600">Confiança:</span>
                  <p className="font-medium">{(analysis.analysis_results.confidence_score * 100).toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload de nova imagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Nova Análise por IA
          </CardTitle>
          <CardDescription>
            Faça upload de uma imagem da ferida para análise automática
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="wound-image"
              />
              <label
                htmlFor="wound-image"
                className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Selecionar Imagem
              </label>
              {selectedFile && (
                <span className="text-sm text-gray-600">
                  {selectedFile.name}
                </span>
              )}
            </div>
            
            {selectedFile && (
              <Button 
                onClick={handleAnalyze} 
                disabled={analyzing}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Iniciar Análise por IA
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados das análises */}
      {analyses.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Análise Atual
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="mt-6">
            {analyses[0] && renderCurrentAnalysis(analyses[0])}
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            {renderAnalysisHistory()}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AIAnalysisPanel;