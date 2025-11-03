import { supabase } from '../lib/supabase';

export interface WoundAnalysis {
  id: string;
  evolution_id: string;
  image_url: string;
  analysis_results: {
    wound_type: string;
    wound_stage: string;
    dimensions: {
      length: number;
      width: number;
      depth?: number;
      area: number;
    };
    tissue_types: {
      granulation: number;
      necrotic: number;
      fibrin: number;
      epithelial: number;
    };
    exudate: {
      amount: 'none' | 'minimal' | 'moderate' | 'heavy';
      type: 'serous' | 'sanguineous' | 'serosanguineous' | 'purulent';
    };
    edges: {
      condition: 'intact' | 'macerated' | 'rolled' | 'undermined';
      attachment: 'attached' | 'not_attached';
    };
    infection_signs: {
      present: boolean;
      indicators: string[];
    };
    healing_progress: {
      status: 'improving' | 'stable' | 'deteriorating';
      percentage: number;
    };
    recommendations: string[];
    confidence_score: number;
  };
  created_at: string;
  updated_at: string;
}

export interface AIAnalysisRequest {
  image_file: File;
  evolution_id: string;
  patient_context?: {
    age: number;
    diabetes: boolean;
    smoking: boolean;
    medications: string[];
  };
}

export class AIAnalysisService {
  // Simulated AI analysis - In production, this would call a real AI service
  static async analyzeWoundImage(request: AIAnalysisRequest): Promise<WoundAnalysis> {
    try {
      // Upload image to Supabase Storage
      const fileName = `analysis_${Date.now()}_${request.image_file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('wound-images')
        .upload(fileName, request.image_file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wound-images')
        .getPublicUrl(fileName);

      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock AI analysis results - In production, replace with actual AI service call
      const mockAnalysis = this.generateMockAnalysis(request.evolution_id, publicUrl);

      // Save analysis to database
      const { data, error } = await supabase
        .from('wound_analyses')
        .insert([mockAnalysis])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error analyzing wound image:', error);
      throw error;
    }
  }

  static async getAnalysesByEvolution(evolutionId: string): Promise<WoundAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('wound_analyses')
        .select('*')
        .eq('evolution_id', evolutionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching analyses:', error);
      throw error;
    }
  }

  static async getAnalysisById(id: string): Promise<WoundAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('wound_analyses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching analysis:', error);
      return null;
    }
  }

  static async deleteAnalysis(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wound_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting analysis:', error);
      throw error;
    }
  }

  static async compareAnalyses(analysisIds: string[]): Promise<{
    timeline: WoundAnalysis[];
    progress_summary: {
      overall_trend: 'improving' | 'stable' | 'deteriorating';
      area_change: number;
      healing_percentage_change: number;
      key_changes: string[];
    };
  }> {
    try {
      const analyses = await Promise.all(
        analysisIds.map(id => this.getAnalysisById(id))
      );

      const validAnalyses = analyses.filter(Boolean) as WoundAnalysis[];
      validAnalyses.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      const progressSummary = this.calculateProgressSummary(validAnalyses);

      return {
        timeline: validAnalyses,
        progress_summary: progressSummary
      };
    } catch (error) {
      console.error('Error comparing analyses:', error);
      throw error;
    }
  }

  // Mock AI analysis generator - Replace with actual AI service integration
  private static generateMockAnalysis(evolutionId: string, imageUrl: string): Omit<WoundAnalysis, 'id' | 'created_at' | 'updated_at'> {
    const woundTypes = ['pressure_ulcer', 'diabetic_ulcer', 'venous_ulcer', 'arterial_ulcer', 'surgical_wound'];
    const stages = ['stage_1', 'stage_2', 'stage_3', 'stage_4', 'unstageable'];
    const exudateAmounts = ['none', 'minimal', 'moderate', 'heavy'] as const;
    const exudateTypes = ['serous', 'sanguineous', 'serosanguineous', 'purulent'] as const;
    const edgeConditions = ['intact', 'macerated', 'rolled', 'undermined'] as const;
    const healingStatuses = ['improving', 'stable', 'deteriorating'] as const;
    
    return {
      evolution_id: evolutionId,
      image_url: imageUrl,
      analysis_results: {
        wound_type: woundTypes[Math.floor(Math.random() * woundTypes.length)],
        wound_stage: stages[Math.floor(Math.random() * stages.length)],
        dimensions: {
          length: Math.round((Math.random() * 10 + 1) * 100) / 100,
          width: Math.round((Math.random() * 8 + 1) * 100) / 100,
          depth: Math.round((Math.random() * 3 + 0.5) * 100) / 100,
          area: Math.round((Math.random() * 50 + 5) * 100) / 100
        },
        tissue_types: {
          granulation: Math.round(Math.random() * 60 + 20),
          necrotic: Math.round(Math.random() * 30),
          fibrin: Math.round(Math.random() * 25),
          epithelial: Math.round(Math.random() * 15)
        },
        exudate: {
          amount: exudateAmounts[Math.floor(Math.random() * exudateAmounts.length)],
          type: exudateTypes[Math.floor(Math.random() * exudateTypes.length)]
        },
        edges: {
          condition: edgeConditions[Math.floor(Math.random() * edgeConditions.length)],
          attachment: Math.random() > 0.5 ? 'attached' : 'not_attached'
        },
        infection_signs: {
          present: Math.random() > 0.7,
          indicators: Math.random() > 0.7 ? ['increased_warmth', 'erythema', 'purulent_drainage'] : []
        },
        healing_progress: {
          status: healingStatuses[Math.floor(Math.random() * healingStatuses.length)],
          percentage: Math.round(Math.random() * 100)
        },
        recommendations: [
          'Manter curativo atual',
          'Considerar desbridamento',
          'Avaliar sinais de infecção',
          'Monitorar evolução em 48h'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        confidence_score: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100
      }
    };
  }

  private static calculateProgressSummary(analyses: WoundAnalysis[]) {
    if (analyses.length < 2) {
      return {
        overall_trend: 'stable' as const,
        area_change: 0,
        healing_percentage_change: 0,
        key_changes: ['Análise insuficiente para comparação']
      };
    }

    const first = analyses[0];
    const last = analyses[analyses.length - 1];

    const areaChange = ((last.analysis_results.dimensions.area - first.analysis_results.dimensions.area) / first.analysis_results.dimensions.area) * 100;
    const healingChange = last.analysis_results.healing_progress.percentage - first.analysis_results.healing_progress.percentage;

    let overallTrend: 'improving' | 'stable' | 'deteriorating';
    if (areaChange < -10 && healingChange > 10) {
      overallTrend = 'improving';
    } else if (areaChange > 10 || healingChange < -10) {
      overallTrend = 'deteriorating';
    } else {
      overallTrend = 'stable';
    }

    const keyChanges = [];
    if (Math.abs(areaChange) > 15) {
      keyChanges.push(`Área da ferida ${areaChange > 0 ? 'aumentou' : 'diminuiu'} ${Math.abs(areaChange).toFixed(1)}%`);
    }
    if (Math.abs(healingChange) > 15) {
      keyChanges.push(`Cicatrização ${healingChange > 0 ? 'melhorou' : 'piorou'} ${Math.abs(healingChange).toFixed(1)}%`);
    }

    return {
      overall_trend: overallTrend,
      area_change: Math.round(areaChange * 100) / 100,
      healing_percentage_change: Math.round(healingChange * 100) / 100,
      key_changes: keyChanges.length > 0 ? keyChanges : ['Sem mudanças significativas detectadas']
    };
  }

  // Utility methods for wound analysis
  static getWoundTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      pressure_ulcer: 'Úlcera por Pressão',
      diabetic_ulcer: 'Úlcera Diabética',
      venous_ulcer: 'Úlcera Venosa',
      arterial_ulcer: 'Úlcera Arterial',
      surgical_wound: 'Ferida Cirúrgica'
    };
    return labels[type] || type;
  }

  static getStageLabel(stage: string): string {
    const labels: Record<string, string> = {
      stage_1: 'Estágio I',
      stage_2: 'Estágio II',
      stage_3: 'Estágio III',
      stage_4: 'Estágio IV',
      unstageable: 'Não Classificável'
    };
    return labels[stage] || stage;
  }

  static getHealingStatusColor(status: string): string {
    const colors: Record<string, string> = {
      improving: 'text-green-600',
      stable: 'text-yellow-600',
      deteriorating: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  }

  static getConfidenceColor(score: number): string {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  }
}
