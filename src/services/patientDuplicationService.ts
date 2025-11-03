import { supabase } from '@/lib/supabase';
import { PatientService } from './patientService';
import { sanitizePatientData as sanitizeData } from '@/lib/validations';
import type { Patient } from '@/types/patient';
import type { PatientFormData } from '@/types/patient';

export class PatientDuplicationService {
  static async findSimilarPatients(formData: PatientFormData): Promise<Patient[]> {
    const ors = [
      formData.cpf?.trim() ? `cpf.eq.${formData.cpf.trim()}` : '',
      formData.email?.trim() ? `email.eq.${formData.email.trim().toLowerCase()}` : '',
      formData.full_name?.trim() ? `full_name.ilike.%${formData.full_name.trim()}%` : '',
    ].filter(Boolean).join(',');
    if (!ors) return [];
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(ors);
    if (error) {
      console.warn('Erro ao buscar pacientes semelhantes:', error);
      return [];
    }
    return (data || []) as Patient[];
  }

  static async mergeInto(targetPatientId: string, formData: PatientFormData): Promise<Patient> {
    if (!targetPatientId?.trim()) throw new Error('Paciente alvo não informado');
    const existing = await PatientService.getById(targetPatientId);
    if (!existing) throw new Error('Paciente alvo não encontrado');

    const sanitized = sanitizeData(formData);
    const merged: Record<string, unknown> = { ...existing };
    Object.entries(sanitized).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (!['mrn', 'status', 'created_at', 'updated_at', 'id'].includes(key)) {
          merged[key] = value;
        }
      }
    });

    const { data, error } = await supabase
      .from('patients')
      .update({ ...merged, updated_at: new Date().toISOString() })
      .eq('id', targetPatientId)
      .select()
      .single();

    if (error) throw new Error(error.message || 'Erro ao mesclar paciente');

    await PatientService.createAuditLog(targetPatientId, 'patient_merged', {
      targetPatientId,
      merged_fields: Object.keys(sanitized).filter(k => !['mrn', 'status', 'created_at', 'updated_at', 'id'].includes(k)),
    });

    return data as Patient;
  }

  static async createAllowDuplicate(formData: PatientFormData): Promise<Patient> {
    // Reutiliza sanitização e geração de MRN
    const sanitized = sanitizeData(formData);
    const mrn = await PatientService.generateMRN();

    const { data, error } = await supabase
      .from('patients')
      .insert([{ ...sanitized, mrn, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw new Error(error.message || 'Erro ao criar paciente (duplicidade permitida)');

    await PatientService.createAuditLog(data.id, 'patient_created', { mrn, full_name: data.full_name, specialty: data.specialty });
    return data as Patient;
  }
}
