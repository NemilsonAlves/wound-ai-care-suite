import { supabase } from '@/lib/supabase';
import { Patient, PatientFormData } from '@/types/patient';

// Função para verificar se o Supabase está configurado
const isSupabaseConfigured = () => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const isConfigured = url && key && 
                        url !== 'https://demo.supabase.co' && 
                        key !== 'demo_key' &&
                        url.includes('supabase.co');
    
    if (!isConfigured) {
      throw new Error('Supabase não está configurado corretamente. Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração do Supabase:', error);
    throw error;
  }
};

// Função para tratar erros do Supabase
const handleSupabaseError = (
  error: { code?: string; message?: string },
  operation: string = 'operação'
) => {
  console.error(`❌ Erro na operação ${operation}:`, error);
  
  if (error?.code === 'PGRST116') {
    throw new Error('Tabela não encontrada. Verifique se o schema do banco foi aplicado corretamente.');
  }
  
  if (error?.code === '42P01') {
    throw new Error('Tabela "patients" não existe. Execute o script SQL do schema primeiro.');
  }
  
  if (error?.code === '23505') {
    throw new Error('Já existe um paciente com este CPF.');
  }
  
  if (error?.code === '23503') {
    throw new Error('Erro de referência: dados relacionados não encontrados.');
  }
  
  if (error?.message?.includes('JWT')) {
    throw new Error('Erro de autenticação. Verifique as configurações do Supabase.');
  }
  
  if (error?.message?.includes('permission')) {
    throw new Error('Sem permissão para acessar os dados. Verifique as políticas RLS do Supabase.');
  }
  
  throw new Error(`Erro na operação ${operation}: ${error?.message || 'Erro desconhecido'}`);
};

export class PatientService {
  static async getAll(): Promise<Patient[]> {
    console.log('🔄 PatientService.getAll() - Buscando pacientes no Supabase');
    
    try {
      // Verificar configuração
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'buscar pacientes');
      }

      console.log('✅ Pacientes encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar pacientes:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Patient | null> {
    console.log('🔄 PatientService.getById() - Buscando paciente:', id);
    
    try {
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        handleSupabaseError(error, 'buscar paciente por ID');
      }

      console.log('✅ Paciente encontrado:', data?.full_name);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar paciente por ID:', error);
      throw error;
    }
  }

  static async create(patient: Partial<Patient>): Promise<Patient> {
    console.log('🔄 PatientService.create() - Criando paciente:', patient.full_name);
    
    try {
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .insert([patient])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'criar paciente');
      }

      console.log('✅ Paciente criado com sucesso:', data?.full_name);
      return data;
    } catch (error) {
      console.error('❌ Erro ao criar paciente:', error);
      throw error;
    }
  }

  static async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    console.log('🔄 PatientService.update() - Atualizando paciente:', id);
    
    try {
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'atualizar paciente');
      }

      console.log('✅ Paciente atualizado com sucesso:', data?.full_name);
      return data;
    } catch (error) {
      console.error('❌ Erro ao atualizar paciente:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    console.log('🔄 PatientService.delete() - Removendo paciente:', id);
    
    try {
      isSupabaseConfigured();
      
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error, 'remover paciente');
      }

      console.log('✅ Paciente removido com sucesso');
    } catch (error) {
      console.error('❌ Erro ao remover paciente:', error);
      throw error;
    }
  }

  static async search(query: string): Promise<Patient[]> {
    console.log('🔄 PatientService.search() - Buscando:', query);
    
    try {
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`full_name.ilike.%${query}%,cpf.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'buscar pacientes');
      }

      console.log('✅ Pacientes encontrados na busca:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro na busca de pacientes:', error);
      throw error;
    }
  }

  static async getBySpecialty(specialty: string): Promise<Patient[]> {
    console.log('🔄 PatientService.getBySpecialty() - Especialidade:', specialty);
    
    try {
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .contains('specialties', [specialty])
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'buscar pacientes por especialidade');
      }

      console.log('✅ Pacientes encontrados por especialidade:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar pacientes por especialidade:', error);
      throw error;
    }
  }

  static async updateConsent(
    id: string,
    consentData: Pick<PatientFormData, 'consent_treatment' | 'consent_data_sharing' | 'consent_marketing'>
  ): Promise<Patient> {
    console.log('🔄 PatientService.updateConsent() - Atualizando consentimento:', id);
    
    try {
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .update({
          consent_treatment: consentData.consent_treatment,
          consent_data_sharing: consentData.consent_data_sharing,
          consent_marketing: consentData.consent_marketing,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'atualizar consentimento');
      }

      console.log('✅ Consentimento atualizado com sucesso');
      return data;
    } catch (error) {
      console.error('❌ Erro ao atualizar consentimento:', error);
      throw error;
    }
  }

  static async getRecentPatients(limit: number = 10): Promise<Patient[]> {
    console.log('🔄 PatientService.getRecentPatients() - Limite:', limit);
    
    try {
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        handleSupabaseError(error, 'buscar pacientes recentes');
      }

      console.log('✅ Pacientes recentes encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar pacientes recentes:', error);
      throw error;
    }
  }

  static async getPatientStats(): Promise<{ total: number; active: number; inactive: number; bySpecialty: Record<string, number> }> {
    console.log('🔄 PatientService.getPatientStats() - Buscando estatísticas');
    
    try {
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .select('status, specialties, created_at');

      if (error) {
        handleSupabaseError(error, 'buscar estatísticas de pacientes');
      }

      const stats = {
        total: data?.length || 0,
        active: data?.filter(p => p.status === 'active').length || 0,
        inactive: data?.filter(p => p.status === 'inactive').length || 0,
        bySpecialty: {}
      };

      console.log('✅ Estatísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      throw error;
    }
  }

  static async createPatient(formData: PatientFormData): Promise<Patient> {
    try {
      console.log('🔄 Criando paciente:', formData);

      const { data, error } = await supabase
        .from('patients')
        .insert([{
          ...formData,
          birth_date: formData.birth_date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase ao criar paciente:', error);
        throw handleSupabaseError(error, 'criar paciente');
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após criação do paciente');
      }

      console.log('✅ Paciente criado com sucesso:', data);
      return data as Patient;
    } catch (error) {
      console.error('❌ Erro ao criar paciente:', error);
      throw error;
    }
  }

  static async updatePatient(id: string, formData: PatientFormData): Promise<Patient> {
    try {
      console.log('🔄 Atualizando paciente:', { id, formData });

      const { data, error } = await supabase
        .from('patients')
        .update({
          ...formData,
          birth_date: formData.birth_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase ao atualizar paciente:', error);
        throw handleSupabaseError(error, 'atualizar paciente');
      }

      if (!data) {
        throw new Error('Paciente não encontrado ou nenhum dado retornado');
      }

      console.log('✅ Paciente atualizado com sucesso:', data);
      return data as Patient;
    } catch (error) {
      console.error('❌ Erro ao atualizar paciente:', error);
      throw error;
    }
  }

  static async getPatientById(id: string): Promise<Patient | null> {
    console.log('🔄 PatientService.getPatientById() - Buscando paciente:', id);
    
    try {
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        handleSupabaseError(error, 'buscar paciente por ID');
      }

      console.log('✅ Paciente encontrado:', data?.full_name);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar paciente por ID:', error);
      throw error;
    }
  }

  // Método para configurar real-time updates
  static subscribeToPatients(callback: () => void) {
    const subscription = supabase
      .channel('patients_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'patients' }, 
        () => {
          console.log('📡 Mudança detectada na tabela de pacientes');
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }

  static async testConnection() {
    try {
      const { error } = await supabase
        .from('patients')
        .select('count', { count: 'exact', head: true });

      if (error) {
        throw handleSupabaseError(error, 'testar conexão');
      }

      return { success: true, message: 'Conexão com Supabase estabelecida' };
    } catch (error) {
      console.error('Erro na conexão com Supabase:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}
