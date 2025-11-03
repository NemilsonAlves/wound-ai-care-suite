import { supabase } from '../lib/supabase';

export interface Evolution {
  id: string;
  patient_id: string;
  professional_id: string;
  date: string;
  wound_type: 'ulcera_venosa' | 'ulcera_arterial' | 'ulcera_diabetica' | 'lesao_pressao' | 'queimadura' | 'trauma' | 'cirurgica' | 'outras';
  wound_location: string;
  wound_size_length: number;
  wound_size_width: number;
  wound_size_depth?: number;
  wound_stage: '1' | '2' | '3' | '4' | 'nao_classificavel';
  exudate_amount: 'ausente' | 'escasso' | 'moderado' | 'abundante';
  exudate_type: 'seroso' | 'sanguinolento' | 'purulento' | 'fibrinoso';
  wound_bed: 'granulacao' | 'fibrina' | 'necrose' | 'epitelizacao' | 'misto';
  wound_edges: 'aderidas' | 'nao_aderidas' | 'maceradas' | 'hiperqueratosicas';
  periwound_skin: 'integra' | 'macerada' | 'ressecada' | 'hiperemiada' | 'descamativa';
  pain_scale: number; // 0-10
  odor: 'ausente' | 'leve' | 'moderado' | 'forte';
  infection_signs: string[];
  treatment_performed: string;
  dressing_used: string;
  observations: string;
  photos: string[];
  next_evaluation_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEvolutionData {
  patient_id: string;
  wound_type: Evolution['wound_type'];
  wound_location: string;
  wound_size_length: number;
  wound_size_width: number;
  wound_size_depth?: number;
  wound_stage: Evolution['wound_stage'];
  exudate_amount: Evolution['exudate_amount'];
  exudate_type: Evolution['exudate_type'];
  wound_bed: Evolution['wound_bed'];
  wound_edges: Evolution['wound_edges'];
  periwound_skin: Evolution['periwound_skin'];
  pain_scale: number;
  odor: Evolution['odor'];
  infection_signs: string[];
  treatment_performed: string;
  dressing_used: string;
  observations: string;
  next_evaluation_date?: string;
}

export class EvolutionService {
  static async createEvolution(data: CreateEvolutionData): Promise<Evolution> {
    const { data: evolution, error } = await supabase
      .from('evolutions')
      .insert([{
        ...data,
        professional_id: (await supabase.auth.getUser()).data.user?.id,
        date: new Date().toISOString(),
        photos: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return evolution;
  }

  static async getEvolutionsByPatient(patientId: string): Promise<Evolution[]> {
    const { data, error } = await supabase
      .from('evolutions')
      .select(`
        *,
        professional:professionals(name),
        patient:patients(name)
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getEvolutionById(id: string): Promise<Evolution | null> {
    const { data, error } = await supabase
      .from('evolutions')
      .select(`
        *,
        professional:professionals(name),
        patient:patients(name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateEvolution(id: string, data: Partial<Evolution>): Promise<Evolution> {
    const { data: evolution, error } = await supabase
      .from('evolutions')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return evolution;
  }

  static async deleteEvolution(id: string): Promise<void> {
    const { error } = await supabase
      .from('evolutions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async uploadPhoto(evolutionId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${evolutionId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('evolution-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('evolution-photos')
      .getPublicUrl(fileName);

    // Update evolution with new photo URL
    const evolution = await this.getEvolutionById(evolutionId);
    if (evolution) {
      const updatedPhotos = [...evolution.photos, publicUrl];
      await this.updateEvolution(evolutionId, { photos: updatedPhotos });
    }

    return publicUrl;
  }

  static async removePhoto(evolutionId: string, photoUrl: string): Promise<void> {
    // Extract file path from URL
    const urlParts = photoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `${evolutionId}/${fileName}`;

    // Remove from storage
    const { error: deleteError } = await supabase.storage
      .from('evolution-photos')
      .remove([filePath]);

    if (deleteError) throw deleteError;

    // Update evolution to remove photo URL
    const evolution = await this.getEvolutionById(evolutionId);
    if (evolution) {
      const updatedPhotos = evolution.photos.filter(url => url !== photoUrl);
      await this.updateEvolution(evolutionId, { photos: updatedPhotos });
    }
  }

  static getWoundTypeLabel(type: Evolution['wound_type']): string {
    const labels = {
      'ulcera_venosa': 'Úlcera Venosa',
      'ulcera_arterial': 'Úlcera Arterial',
      'ulcera_diabetica': 'Úlcera Diabética',
      'lesao_pressao': 'Lesão por Pressão',
      'queimadura': 'Queimadura',
      'trauma': 'Trauma',
      'cirurgica': 'Cirúrgica',
      'outras': 'Outras'
    };
    return labels[type] || type;
  }

  static getWoundStageLabel(stage: Evolution['wound_stage']): string {
    const labels = {
      '1': 'Estágio I',
      '2': 'Estágio II',
      '3': 'Estágio III',
      '4': 'Estágio IV',
      'nao_classificavel': 'Não Classificável'
    };
    return labels[stage] || stage;
  }

  static calculateWoundArea(length: number, width: number): number {
    return length * width;
  }

  static calculateWoundVolume(length: number, width: number, depth?: number): number {
    if (!depth) return 0;
    return length * width * depth;
  }
}
