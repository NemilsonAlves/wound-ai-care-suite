import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Calendar,
  Zap,
  AlertCircle
} from 'lucide-react';
import { AIAnalysisService, WoundAnalysis } from '../../services/aiAnalysisService';
import { LoadingSpinner } from '../ui/loading-spinner';

interface AIComparisonChartProps {
  evolutionId: string;
  analyses?: WoundAnalysis[];
}

export const AIComparisonChart: React.FC<AIComparisonChartProps> = ({
  evolutionId,
  analyses: propAnalyses
}) => {
  const [analyses, setAnalyses] = useState<WoundAnalysis[]>(propAnalyses || []);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState('area');
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    if (!propAnalyses) {
      loadAnalyses();
    }
  }, [evolutionId, propAnalyses]);

  useEffect(() => {
    if (analyses.length >= 2) {
      generateComparison();
    }
  }, [analyses]);

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

  const generateComparison = async () => {
    if (analyses.length < 2) return;

    try {
      const analysisIds = analyses.map(a => a.id);
      const comparisonData = await AIAnalysisService.compareAnalyses(analysisIds);
      setComparison(comparisonData);
    } catch (error) {
      console.error('Erro ao gerar comparação:', error);
    }
  };

  const prepareChartData = () => {
    return analyses
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((analysis, index) => ({
        date: new Date(analysis.created_at).toLocaleDateString('pt-BR'),
        analysis_number: index + 1,
        area: analysis.analysis_results.dimensions.area,
        healing_percentage: analysis.analysis_results.healing_progress.percentage,
        confidence: analysis.analysis_results.confidence_score * 100,
        granulation: analysis.analysis_results.tissue_types.granulation,
        necrotic: analysis.analysis_results.tissue_types.necrotic,
        fibrin: analysis.analysis_results.tissue_types.fibrin,
        epithelial: analysis.analysis_results.tissue_types.epithelial
      }));
  };

  const prepareTissueData = () => {
    if (analyses.length === 0) return [];
    
    const latest = analyses[0];
    return [
      { name: 'Granulação', value: latest.analysis_results.tissue_types.granulation, color: '#10b981' },
      { name: 'Necrótico', value: latest.analysis_results.tissue_types.necrotic, color: '#ef4444' },
      { name: 'Fibrina', value: latest.analysis_results.tissue_types.fibrin, color: '#f59e0b' },
      { name: 'Epitelial', value: latest.analysis_results.tissue_types.epithelial, color: '#8b5cf6' }
    ].filter(item => item.value > 0);
  };

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      area: 'Área (cm²)',
      healing_percentage: 'Cicatrização (%)',
      confidence: 'Confiança (%)',
      granulation: 'Granulação (%)',
      necrotic: 'Necrótico (%)'
    };
    return labels[metric] || metric;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'deteriorating':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'deteriorating':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const renderChart = () => {
    const data = prepareChartData();
    
    if (data.length === 0) return null;

    const commonProps = {
      width: '100%',
      height: 300,
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey={selectedMetric} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  const renderTissueChart = () => {
    const data = prepareTissueData();
    
    if (data.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
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

  if (analyses.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Comparativa
          </CardTitle>
          <CardDescription>
            Comparação temporal das análises por IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>São necessárias pelo menos 2 análises para comparação</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo da evolução */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Resumo da Evolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${getTrendColor(comparison.progress_summary.overall_trend)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getTrendIcon(comparison.progress_summary.overall_trend)}
                  <span className="font-medium">Tendência Geral</span>
                </div>
                <p className="text-sm">
                  {comparison.progress_summary.overall_trend === 'improving' ? 'Melhorando' :
                   comparison.progress_summary.overall_trend === 'stable' ? 'Estável' : 'Piorando'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-600">Mudança na Área</span>
                </div>
                <p className="text-sm text-blue-600">
                  {comparison.progress_summary.area_change > 0 ? '+' : ''}
                  {comparison.progress_summary.area_change.toFixed(1)}%
                </p>
              </div>
              
              <div className="p-4 rounded-lg border bg-purple-50 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-600">Mudança na Cicatrização</span>
                </div>
                <p className="text-sm text-purple-600">
                  {comparison.progress_summary.healing_percentage_change > 0 ? '+' : ''}
                  {comparison.progress_summary.healing_percentage_change.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Principais Mudanças:</h4>
              <ul className="space-y-1">
                {comparison.progress_summary.key_changes.map((change: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Temporal
          </CardTitle>
          <CardDescription>
            Evolução das métricas ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="metrics">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="tissue">Composição Tecidual</TabsTrigger>
            </TabsList>
            
            <TabsContent value="metrics" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Selecionar métrica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="area">Área da Ferida</SelectItem>
                    <SelectItem value="healing_percentage">Cicatrização</SelectItem>
                    <SelectItem value="confidence">Confiança da IA</SelectItem>
                    <SelectItem value="granulation">Tecido de Granulação</SelectItem>
                    <SelectItem value="necrotic">Tecido Necrótico</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Tipo de gráfico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Linha</SelectItem>
                    <SelectItem value="area">Área</SelectItem>
                    <SelectItem value="bar">Barras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">{getMetricLabel(selectedMetric)}</h4>
                {renderChart()}
              </div>
            </TabsContent>
            
            <TabsContent value="tissue" className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Composição Tecidual Atual</h4>
                {renderTissueChart()}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIComparisonChart;