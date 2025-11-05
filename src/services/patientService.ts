import { supabase } from '@/lib/supabase';
import { Patient, PatientFormData } from '@/types/patient';
import { 
  createPatientSchema, 
  editPatientSchema, 
  errorMessages,
  SPECIALTIES
} from '@/lib/validations';
import { z } from 'zod';
import { detectMissingPatientColumns, ensureSchemaAndInsertAtomically, REQUIRED_PATIENT_COLUMNS } from '@/services/schemaGuard';

// ValidaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de configuraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o do Supabase
const isSupabaseConfigured = (): void => {
  if (!supabase) {
    throw new Error('Supabase nÃƒÆ’Ã‚Â£o estÃƒÆ’Ã‚Â¡ configurado. Verifique as variÃƒÆ’Ã‚Â¡veis de ambiente.');
  }
};

// ValidaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o robusta de dados do paciente usando Zod
const validatePatientData = (data: PatientFormData, isEdit: boolean = false): string[] => {
  try {
    const schema = isEdit ? editPatientSchema : createPatientSchema;
    schema.parse(data);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(err => err.message);
    }
    return ['Erro de validaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o desconhecido'];
  }
};

// ValidaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o adicional de regras de negÃƒÆ’Ã‚Â³cio
const validateBusinessRules = async (data: PatientFormData, excludeId?: string): Promise<string[]> => {
  const errors: string[] = [];
  
  // Verificar CPF ÃƒÆ’Ã‚Âºnico
  if (data.cpf) {
    const cpfExists = await PatientService.checkCpfExists(data.cpf, excludeId);
    if (cpfExists) {
      errors.push(errorMessages.duplicateCPF);
    }
  }
  
  // Verificar email ÃƒÆ’Ã‚Âºnico se fornecido
  if (data.email) {
    // Implementar verificaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de email ÃƒÆ’Ã‚Âºnico quando necessÃƒÆ’Ã‚Â¡rio
  }
  
  return errors;
};

// Tratamento de erros do Supabase melhorado
const handleSupabaseError = (error: { code?: string; message?: string }, operation: string = 'operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o'): never => {
  console.error(`ÃƒÂ¢Ã‚ÂÃ…â€™ Erro do Supabase na ${operation}:`, error);
  
  // Erros especÃƒÆ’Ã‚Â­ficos do Supabase
  if (error.code === 'PGRST301') {
    throw new Error('Dados invÃƒÆ’Ã‚Â¡lidos fornecidos. Verifique os campos obrigatÃƒÆ’Ã‚Â³rios.');
  }
  
  if (error.code === 'PGRST116') {
    throw new Error('Registro nÃƒÆ’Ã‚Â£o encontrado.');
  }
  
  if (error.code === '23505') {
    throw new Error('JÃƒÆ’Ã‚Â¡ existe um paciente com este CPF.');
  }
  
  if (error.code === '42501') {
    throw new Error('Sem permissÃƒÆ’Ã‚Â£o para realizar esta operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o. Verifique as polÃƒÆ’Ã‚Â­ticas RLS.');
  }
  
  if (error.code === '42P17') {
    throw new Error('Erro de configuraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o do banco de dados. Verifique as polÃƒÆ’Ã‚Â­ticas RLS.');
  }

  // Coluna inexistente (comum quando o schema nÃƒÆ’Ã‚Â£o tem 'mrn' ainda)
  if (error.code === '42703' || /column .* does not exist/i.test(error.message || '') || /does not exist/i.test(error.message || '')) {
    throw new Error(`Erro na ${operation}: coluna requerida inexistente no schema (ex.: patients.mrn). Execute o script de correÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o do schema.`);
  }
  
  // Erro genÃƒÆ’Ã‚Â©rico
  throw new Error(`Erro na ${operation}: ${error?.message || 'Erro desconhecido'}`);
};

// Sanitização de dados do formulário de paciente (tipado para PatientFormData)
const sanitizePatientFormData = (data: PatientFormData): PatientFormData => {
  type SpecialtyLiteral = PatientFormData['specialty'];
  const SPECIALTY_MAP: Record<string, SpecialtyLiteral> = SPECIALTIES.reduce((acc, item) => {
    acc[item.toLowerCase()] = item as SpecialtyLiteral;
    return acc;
  }, {} as Record<string, SpecialtyLiteral>);

  const normalizedSpecialty: SpecialtyLiteral = (() => {
    const raw = data.specialty;
    const key = raw.trim().toLowerCase();
    return SPECIALTY_MAP[key] ?? raw;
  })();

  return {
    ...data,
    full_name: data.full_name?.trim(),
    cpf: data.cpf?.replace(/\D/g, ''),
    phone: data.phone?.replace(/\D/g, ''),
    email: data.email?.trim().toLowerCase(),
    address: data.address?.trim(),
    city: data.city?.trim(),
    state: data.state?.trim()?.toUpperCase(),
    zip_code: data.zip_code?.replace(/\D/g, ''),
    emergency_contact_name: data.emergency_contact_name?.trim(),
    emergency_contact_phone: data.emergency_contact_phone?.replace(/\D/g, ''),
    medical_history: data.medical_history?.trim(),
    allergies: data.allergies?.trim(),
    current_medications: data.current_medications?.trim(),
    specialty: normalizedSpecialty
  };
};

export class PatientService {
  static async ensureAuthenticatedProd(): Promise<void> {
    if (!import.meta.env.PROD) return;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(`Falha ao verificar sessÃƒÆ’Ã‚Â£o de autenticaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: ${error.message || 'erro desconhecido'}`);
    }
    const session = data?.session;
    if (!session || !session.user) {
      throw new Error('AutenticaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o obrigatÃƒÆ’Ã‚Â³ria em produÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o. FaÃƒÆ’Ã‚Â§a login para continuar.');
    }
  }
  // Buscar todos os pacientes com retry
  static async getAll(): Promise<Patient[]> {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ PatientService.getAll() - Buscando pacientes');
    
    return this.retryOperation(
      async () => {
        isSupabaseConfigured();
        
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          handleSupabaseError(error, 'buscar pacientes');
        }

        console.log(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ ${data?.length || 0} pacientes encontrados`);
        return data || [];
      },
      'buscar todos os pacientes',
      3,
      1000
    );
  }

  // Buscar paciente por ID
  static async getById(id: string): Promise<Patient | null> {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ PatientService.getById() - ID:', id);
    
    try {
      if (!id?.trim()) {
        throw new Error('ID do paciente ÃƒÆ’Ã‚Â© obrigatÃƒÆ’Ã‚Â³rio');
      }
      
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

      console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Paciente encontrado:', data?.full_name);
      return data;
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao buscar paciente por ID:', error);
      throw error;
    }
  }

  // Criar novo paciente
  static async create(formData: PatientFormData): Promise<Patient> {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ PatientService.create() - Criando paciente:', formData.full_name);
    
    try {
      await this.ensureAuthenticatedProd();
      // Sanitizar dados primeiro para alinhar capitalizaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o e formatos
      const sanitizedData = sanitizePatientFormData(formData);

      // Validar dados com Zod usando os dados jÃƒÆ’Ã‚Â¡ sanitizados
      const validationErrors = validatePatientData(sanitizedData, false);
      if (validationErrors.length > 0) {
        throw new Error(`Dados invÃƒÆ’Ã‚Â¡lidos: ${validationErrors.join(', ')}`);
      }
      
      // Validar regras de negÃƒÆ’Ã‚Â³cio (CPF ÃƒÆ’Ã‚Âºnico, etc.)
      const businessErrors = await validateBusinessRules(sanitizedData);
      if (businessErrors.length > 0) {
        throw new Error(`Erro de validaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: ${businessErrors.join(', ')}`);
      }
      
      // Gerar MRN ÃƒÆ’Ã‚Âºnico
      const mrn = await this.generateMRN();
      
      isSupabaseConfigured();
      
      // 1) Verificar colunas obrigatÃƒÆ’Ã‚Â³rias na tabela antes de inserir
      const schemaCheck = await detectMissingPatientColumns(REQUIRED_PATIENT_COLUMNS);
      if (schemaCheck.missing.length > 0) {
        console.warn('ÃƒÂ¢Ã…Â¡Ã‚Â� ÃƒÂ¯Ã‚Â¸Ã‚Â Colunas ausentes detectadas em patients:', schemaCheck.missing);

        // 2) Tentar correÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o atÃƒÆ’Ã‚Â´mica via funÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o RPC (se instalada)
        const payload = {
          ...sanitizedData,
          mrn,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: rpcData, error: rpcError } = await ensureSchemaAndInsertAtomically(payload);
        if (rpcError) {
          // 4) Tratamento de erro claro quando a criaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de campos falha
          const missingList = schemaCheck.missing.join(', ');
          throw new Error(
            `Erro na verificaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o/criaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de colunas: faltam [${missingList}]. ` +
            `A funÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o RPC ensure_patients_schema_and_insert nÃƒÆ’Ã‚Â£o pÃƒÆ’Ã‚Â´de corrigir automaticamente (${rpcError.message || rpcError}). ` +
            `Execute o script SQL fix-rls-and-structure-complete.sql no Supabase para alinhar o schema.`
          );
        }

        if (!rpcData || !rpcData.id) {
          throw new Error('Falha na operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o atÃƒÆ’Ã‚Â´mica de schema+insert: nenhum dado retornado.');
        }

        // InserÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o efetuada com sucesso pela funÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o RPC
        await this.createAuditLog(rpcData.id, 'patient_created', { mrn, full_name: rpcData.full_name, specialty: rpcData.specialty });
        console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Paciente criado (RPC atÃƒÆ’Ã‚Â´mica) com sucesso:', rpcData.full_name, 'MRN:', mrn);
        return rpcData as Patient;
      }

      // 3) Se nÃƒÆ’Ã‚Â£o houver colunas faltantes, seguir com insert normal
      const { data, error } = await supabase
        .from('patients')
        .insert([{   
          ...sanitizedData,
          mrn,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'criar paciente');
      }

      if (!data) {
        throw new Error('Nenhum dado retornado apÃƒÆ’Ã‚Â³s criaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o do paciente');
      }

      // Registrar no audit log
      await this.createAuditLog(data.id, 'patient_created', {
        mrn,
        full_name: data.full_name,
        specialty: data.specialty
      });

      console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Paciente criado com sucesso:', data.full_name, 'MRN:', mrn);
      return data as Patient;
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao criar paciente:', error);
      throw error;
    }
  }

  // Atualizar paciente
// Atualizar paciente
  static async update(id: string, formData: PatientFormData): Promise<Patient> {
    console.log('PatientService.update() - Atualizando paciente:', id);
    try {
      if (!id?.trim()) {
        throw new Error('ID do paciente é obrigatório');
      }
      await this.ensureAuthenticatedProd();

      // 1) Sanitizar dados primeiro (normaliza estado, especialidade, telefones, etc.)
      const sanitizedData = sanitizePatientFormData(formData);

      // 2) Validar dados com Zod usando dados sanitizados (modo edição)
      const validationErrors = validatePatientData(sanitizedData, true);
      if (validationErrors.length > 0) {
        throw new Error(`Dados inválidos: ${validationErrors.join(', ')}`);
      }

      // 3) Validar regras de negócio com dados sanitizados (excluindo o próprio paciente)
      const businessErrors = await validateBusinessRules(sanitizedData, id);
      if (businessErrors.length > 0) {
        throw new Error(`Erro de validação: ${businessErrors.join(', ')}`);
      }

      isSupabaseConfigured();

      const { data, error } = await supabase
        .from('patients')
        .update({
          ...sanitizedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'atualizar paciente');
      }

      if (!data) {
        throw new Error('Paciente não encontrado');
      }

      console.log('Paciente atualizado com sucesso:', data.full_name);
      return data as Patient;
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      throw error;
    }
  }

// Excluir paciente
  static async delete(id: string): Promise<void> {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ PatientService.delete() - Excluindo paciente:', id);
    
    try {
      if (!id?.trim()) {
        throw new Error('ID do paciente ÃƒÆ’Ã‚Â© obrigatÃƒÆ’Ã‚Â³rio');
      }
      await this.ensureAuthenticatedProd();
      
      isSupabaseConfigured();
      
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        // Fallback: se a polÃƒÆ’Ã‚Â­tica RLS bloquear DELETE, realizar soft-delete (status = 'inactive')
        if (error.code === '42501' || /permission|rls/i.test(error.message || '')) {
          console.warn('ÃƒÂ¢Ã…Â¡Ã‚Â� ÃƒÂ¯Ã‚Â¸Ã‚Â Sem permissÃƒÆ’Ã‚Â£o para DELETE. Aplicando soft-delete (status = inactive).');
          const { error: softError } = await supabase
            .from('patients')
            .update({ status: 'inactive', updated_at: new Date().toISOString() })
            .eq('id', id);
          if (softError) {
            handleSupabaseError(softError, 'soft-delete de paciente');
          }
          // Registrar auditoria do soft-delete
          await this.createAuditLog(id, 'patient_soft_deleted', { reason: 'RLS blocked hard delete' });
        } else {
          handleSupabaseError(error, 'excluir paciente');
        }
      }

      console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Paciente excluÃƒÆ’Ã‚Â­do com sucesso');
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao excluir paciente:', error);
      throw error;
    }
  }

  // Buscar pacientes por termo
  static async search(query: string): Promise<Patient[]> {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ PatientService.search() - Termo:', query);
    
    try {
      if (!query?.trim()) {
        return [];
      }
      
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`full_name.ilike.%${query}%,cpf.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'buscar pacientes');
      }

      console.log(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ ${data?.length || 0} pacientes encontrados na busca`);
      return data || [];
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao buscar pacientes:', error);
      throw error;
    }
  }

  // Sistema de retry com backoff exponencial
  private static async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ Tentativa ${attempt}/${maxRetries} - ${operationName}`);
        const result = await operation();
        
        if (attempt > 1) {
          console.log(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ ${operationName} bem-sucedida na tentativa ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`ÃƒÂ¢Ã…Â¡Ã‚Â� ÃƒÂ¯Ã‚Â¸Ã‚Â Tentativa ${attempt}/${maxRetries} falhou - ${operationName}:`, error);
        
        // Se nÃƒÆ’Ã‚Â£o ÃƒÆ’Ã‚Â© a ÃƒÆ’Ã‚Âºltima tentativa, aguarda antes de tentar novamente
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Backoff exponencial
          console.log(`ÃƒÂ¢Ã‚ÂÃ‚Â³ Aguardando ${delay}ms antes da prÃƒÆ’Ã‚Â³xima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`ÃƒÂ¢Ã‚ÂÃ…â€™ ${operationName} falhou apÃƒÆ’Ã‚Â³s ${maxRetries} tentativas`);
    throw lastError;
  }

  // Testar conexÃƒÆ’Ã‚Â£o com retry
  static async testConnection(): Promise<boolean> {
    try {
      const result = await this.retryOperation(
        async () => {
          isSupabaseConfigured();
          
          const { error } = await supabase
            .from('patients')
            .select('count')
            .limit(1);
          
          if (error) {
            throw new Error(`Erro de conexÃƒÆ’Ã‚Â£o: ${error.message}`);
          }
          
          return true;
        },
        'teste de conexÃƒÆ’Ã‚Â£o',
        3,
        1000
      );
      
      console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ ConexÃƒÆ’Ã‚Â£o com Supabase OK');
      return result;
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao testar conexÃƒÆ’Ã‚Â£o apÃƒÆ’Ã‚Â³s todas as tentativas:', error);
      return false;
    }
  }

  // Testar conexÃƒÆ’Ã‚Â£o detalhada com diagnÃƒÆ’Ã‚Â³stico
  static async testConnectionDetailed(): Promise<{
    success: boolean;
    message: string;
    details: Record<string, unknown>;
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    
    try {
      console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â Iniciando teste detalhado de conexÃƒÆ’Ã‚Â£o...');
      
      // Verificar configuraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o
      if (!supabase) {
        return {
          success: false,
          message: 'Supabase nÃƒÆ’Ã‚Â£o configurado',
          details: { error: 'Cliente Supabase nÃƒÆ’Ã‚Â£o inicializado' },
          timestamp
        };
      }
      
      // Implementar retry especÃƒÆ’Ã‚Â­fico para Failed to fetch
      return await this.retryOperation(
        async () => {
          // Testar conectividade bÃƒÆ’Ã‚Â¡sica com timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
          
          try {
            const { error, count } = await supabase
              .from('patients')
              .select('*', { count: 'exact', head: true })
              .abortSignal(controller.signal);
            
            clearTimeout(timeoutId);
            
            if (error) {
              // Tratar erros especÃƒÆ’Ã‚Â­ficos
              if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
                throw new Error(`Erro de rede: NÃƒÆ’Ã‚Â£o foi possÃƒÆ’Ã‚Â­vel conectar ao Supabase. Verifique sua conexÃƒÆ’Ã‚Â£o com a internet e tente novamente.`);
              }
              
              if (error.message.includes('CORS')) {
                throw new Error(`Erro de CORS: Problema de configuraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de seguranÃƒÆ’Ã‚Â§a. Tente recarregar a pÃƒÆ’Ã‚Â¡gina (Ctrl+F5).`);
              }
              
              throw new Error(`Erro de conexÃƒÆ’Ã‚Â£o: ${error.message}`);
            }
            
            return {
              success: true,
              message: `ConexÃƒÆ’Ã‚Â£o estabelecida com sucesso. ${count || 0} registros na tabela.`,
              details: { 
                count: count || 0,
                timestamp,
                connectionTest: 'passed'
              },
              timestamp
            };
          } catch (fetchError: unknown) {
            clearTimeout(timeoutId);
            
            // Tratar erros especÃƒÆ’Ã‚Â­ficos de fetch
            const fe = fetchError as { name?: string; message?: string };
            if (fe.name === 'AbortError') {
              throw new Error('Timeout: A conexÃƒÆ’Ã‚Â£o demorou muito para responder. Verifique sua internet.');
            }
            
            if (fe.message && fe.message.includes('Failed to fetch')) {
              throw new Error('Erro de rede: NÃƒÆ’Ã‚Â£o foi possÃƒÆ’Ã‚Â­vel conectar ao servidor. Verifique sua conexÃƒÆ’Ã‚Â£o com a internet e tente novamente.');
            }
            
            if (fe.message && fe.message.includes('NetworkError')) {
              throw new Error('Erro de rede: Problema de conectividade. Verifique sua internet ou firewall.');
            }
            
            throw fetchError;
          }
        },
        'teste de conexÃƒÆ’Ã‚Â£o detalhado',
        3,
        2000
      );
      
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro no teste de conexÃƒÆ’Ã‚Â£o detalhado:', error);
      
      // AnÃƒÆ’Ã‚Â¡lise detalhada do erro
      let errorMessage = 'Erro desconhecido de conexÃƒÆ’Ã‚Â£o';
      const errObj = error as { message?: string };
      let errorDetails: Record<string, unknown> = { originalError: errObj.message };
      
      if (errObj.message && errObj.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de rede: NÃƒÆ’Ã‚Â£o foi possÃƒÆ’Ã‚Â­vel conectar ao Supabase';
        errorDetails = {
          ...errorDetails,
          possibleCauses: [
            'ConexÃƒÆ’Ã‚Â£o com a internet instÃƒÆ’Ã‚Â¡vel',
            'Firewall ou antivÃƒÆ’Ã‚Â­rus bloqueando a conexÃƒÆ’Ã‚Â£o',
            'Projeto Supabase pausado ou inativo',
            'Problema temporÃƒÆ’Ã‚Â¡rio do servidor'
          ],
          solutions: [
            'Verifique sua conexÃƒÆ’Ã‚Â£o com a internet',
            'Tente recarregar a pÃƒÆ’Ã‚Â¡gina (Ctrl+F5)',
            'Desative temporariamente antivÃƒÆ’Ã‚Â­rus/firewall',
            'Tente novamente em alguns minutos',
            'Teste em uma aba anÃƒÆ’Ã‚Â´nima do navegador'
          ]
        };
      } else if (errObj.message && errObj.message.includes('CORS')) {
        errorMessage = 'Erro de CORS: Problema de configuraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de seguranÃƒÆ’Ã‚Â§a';
        errorDetails = {
          ...errorDetails,
          possibleCauses: [
            'Cache do navegador desatualizado',
            'ConfiguraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de CORS no Supabase',
            'Problema de desenvolvimento local'
          ],
          solutions: [
            'Recarregue a pÃƒÆ’Ã‚Â¡gina com Ctrl+Shift+R',
            'Teste em uma aba anÃƒÆ’Ã‚Â´nima',
            'Limpe o cache do navegador'
          ]
        };
      } else if (errObj.message && (errObj.message.includes('Timeout') || errObj.message.includes('timeout'))) {
        errorMessage = 'Timeout: ConexÃƒÆ’Ã‚Â£o muito lenta';
        errorDetails = {
          ...errorDetails,
          possibleCauses: [
            'ConexÃƒÆ’Ã‚Â£o com a internet lenta',
            'Servidor sobrecarregado',
            'Problema de rede temporÃƒÆ’Ã‚Â¡rio'
          ],
          solutions: [
            'Verifique a velocidade da sua internet',
            'Tente novamente em alguns minutos',
            'Use uma conexÃƒÆ’Ã‚Â£o de rede diferente'
          ]
        };
      }
      
      return {
        success: false,
        message: errorMessage,
        details: errorDetails,
        timestamp
      };
    }
  }

  // MÃƒÆ’Ã‚Â©todo auxiliar para diagnÃƒÆ’Ã‚Â³stico de rede
  static async diagnoseNetworkIssue(): Promise<{
    networkStatus: string;
    supabaseReachable: boolean;
    suggestions: string[];
  }> {
    const suggestions: string[] = [];
    let networkStatus = 'unknown';
    let supabaseReachable = false;
    
    try {
      // Teste bÃƒÆ’Ã‚Â¡sico de conectividade
    await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      });
      networkStatus = 'connected';
    } catch (error) {
      networkStatus = 'disconnected';
      suggestions.push('Verifique sua conexÃƒÆ’Ã‚Â£o com a internet');
    }
    
    try {
      // Teste especÃƒÆ’Ã‚Â­fico do Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
    await fetch(supabaseUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        supabaseReachable = true;
      }
    } catch (error) {
      suggestions.push('Servidor Supabase pode estar indisponÃƒÆ’Ã‚Â­vel');
      suggestions.push('Verifique se o projeto Supabase estÃƒÆ’Ã‚Â¡ ativo');
    }
    
    if (!supabaseReachable) {
      suggestions.push('Tente recarregar a pÃƒÆ’Ã‚Â¡gina');
      suggestions.push('Verifique as configuraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes de firewall');
      suggestions.push('Teste em uma aba anÃƒÆ’Ã‚Â´nima do navegador');
    }
    
    return {
      networkStatus,
      supabaseReachable,
      suggestions
    };
  }

  // MÃƒÆ’Ã‚Â©todo para tentar recuperaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o automÃƒÆ’Ã‚Â¡tica com diferentes estratÃƒÆ’Ã‚Â©gias
  static async attemptRecovery(): Promise<{ success: boolean; message: string; strategy?: string }> {
    const strategies = [
      {
        name: 'ReconexÃƒÆ’Ã‚Â£o simples',
        action: async () => {
          // Aguarda um pouco e tenta novamente
          await new Promise(resolve => setTimeout(resolve, 2000));
          return await this.testConnection();
        }
      },
      {
        name: 'Limpeza de cache',
        action: async () => {
          // Simula limpeza de cache do navegador
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            );
          }
          return await this.testConnection();
        }
      },
      {
        name: 'ReconexÃƒÆ’Ã‚Â£o com timeout estendido',
        action: async () => {
          // Tenta com timeout maior
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos
          
          try {
            const { error } = await supabase
              .from('patients')
              .select('count', { count: 'exact', head: true })
              .abortSignal(controller.signal);
            
            clearTimeout(timeoutId);
            return !error;
          } catch (error) {
            clearTimeout(timeoutId);
            return false;
          }
        }
      }
    ];

    for (const strategy of strategies) {
      try {
        console.log(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ Tentando estratÃƒÆ’Ã‚Â©gia: ${strategy.name}`);
        const result = await strategy.action();
        
        if (result) {
          return {
            success: true,
            message: `RecuperaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o bem-sucedida usando: ${strategy.name}`,
            strategy: strategy.name
          };
        }
      } catch (error) {
        console.log(`ÃƒÂ¢Ã‚ÂÃ…â€™ EstratÃƒÆ’Ã‚Â©gia ${strategy.name} falhou:`, error);
        continue;
      }
    }

    return {
      success: false,
      message: 'Todas as estratÃƒÆ’Ã‚Â©gias de recuperaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o falharam'
    };
  }

  // Continuar com o mÃƒÆ’Ã‚Â©todo original...
static async _originalTestConnectionDetailed_backup(): Promise<{
    success: boolean;
    message: string;
    details: Record<string, unknown>;
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    
    try {
      console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â Iniciando teste detalhado de conexÃƒÆ’Ã‚Â£o...');
      
      // Verificar configuraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o
      if (!supabase) {
        return {
          success: false,
          message: 'Supabase nÃƒÆ’Ã‚Â£o configurado',
          details: { error: 'Cliente Supabase nÃƒÆ’Ã‚Â£o inicializado' },
          timestamp
        };
      }
      
      // Testar conectividade bÃƒÆ’Ã‚Â¡sica
      const { error, count } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        return {
          success: false,
          message: `Erro de conexÃƒÆ’Ã‚Â£o: ${error.message}`,
          details: { 
            error: error,
            code: error.code,
            hint: error.hint,
            details: error.details
          },
          timestamp
        };
      }
      
      return {
        success: true,
        message: `ConexÃƒÆ’Ã‚Â£o estabelecida com sucesso. ${count || 0} registros na tabela.`,
        details: { 
          count: count || 0,
          status: 'connected',
          table: 'patients'
        },
        timestamp
      };
      
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro no teste detalhado:', error);
      return {
        success: false,
        message: `Erro inesperado: ${(error as { message?: string })?.message || 'Erro desconhecido'}`,
        details: { 
          error: error,
          stack: (error as { stack?: string })?.stack
        },
        timestamp
      };
    }
  }

  // Verificar se CPF jÃƒÆ’Ã‚Â¡ existe
  static async checkCpfExists(cpf: string, excludeId?: string): Promise<boolean> {
    try {
      const cleanCpf = cpf.replace(/\D/g, '');
      
      let query = supabase
        .from('patients')
        .select('id')
        .eq('cpf', cleanCpf);
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao verificar CPF:', error);
        return false;
      }
      
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao verificar CPF:', error);
      return false;
    }
  }

  // MÃƒÆ’Ã‚Â©todos adicionais para compatibilidade com o cÃƒÆ’Ã‚Â³digo existente
  static async createPatient(formData: PatientFormData): Promise<Patient> {
    return this.create(formData);
  }

  static async updatePatient(id: string, formData: PatientFormData): Promise<Patient> {
    return this.update(id, formData);
  }

  static async getPatientById(id: string): Promise<Patient | null> {
    return this.getById(id);
  }

  static async getRecentPatients(limit: number = 10): Promise<Patient[]> {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ PatientService.getRecentPatients() - Limite:', limit);
    
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

      console.log(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ ${data?.length || 0} pacientes recentes encontrados`);
      return data || [];
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao buscar pacientes recentes:', error);
      throw error;
    }
  }

  static async getBySpecialty(specialty: string): Promise<Patient[]> {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ PatientService.getBySpecialty() - Especialidade:', specialty);
    
    try {
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('specialty', specialty)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'buscar pacientes por especialidade');
      }

      console.log(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ ${data?.length || 0} pacientes encontrados para ${specialty}`);
      return data || [];
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao buscar pacientes por especialidade:', error);
      throw error;
    }
  }

  static async getPatientStats(): Promise<{ total: number; bySpecialty: { Curativos: number; Dermatologia: number; 'Cirurgia Plástica': number }; recentRegistrations: number }> {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ PatientService.getPatientStats() - Buscando estatÃƒÆ’Ã‚Â­sticas');
    
    try {
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .select('specialty, created_at');

      if (error) {
        handleSupabaseError(error, 'buscar estatÃƒÆ’Ã‚Â­sticas de pacientes');
      }

      const items = (data ?? []) as Array<{ specialty: Patient['specialty']; created_at: string }>;

      const stats = {
        total: items.length,
        bySpecialty: {
          Curativos: items.filter(p => p.specialty === 'Curativos').length || 0,
          Dermatologia: items.filter(p => p.specialty === 'Dermatologia').length || 0,
          'Cirurgia Plástica': items.filter(p => p.specialty === 'Cirurgia Plástica').length || 0,
        },
        recentRegistrations: items.filter(p => {
          const createdAt = new Date(p.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdAt >= thirtyDaysAgo;
        }).length || 0
      };

      console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ EstatÃƒÆ’Ã‚Â­sticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao calcular estatÃƒÆ’Ã‚Â­sticas:', error);
      throw error;
    }
  }

  static subscribeToPatients(callback: () => void) {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ PatientService.subscribeToPatients() - Configurando subscription');
    
    try {
      const subscription = supabase
        .channel('patients_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'patients' }, 
          () => {
            console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¡ MudanÃƒÆ’Ã‚Â§a detectada na tabela patients');
            callback();
          }
        )
        .subscribe();

      console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Subscription configurada');
      return subscription;
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao configurar subscription:', error);
      return null;
    }
  }

  static async updateConsent(id: string, consentData: Pick<PatientFormData, 'consent_data_processing' | 'consent_whatsapp' | 'consent_email'>): Promise<Patient> {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ PatientService.updateConsent() - ID:', id);
    
    try {
      if (!id?.trim()) {
        throw new Error('ID do paciente ÃƒÆ’Ã‚Â© obrigatÃƒÆ’Ã‚Â³rio');
      }
      
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .update({
          ...consentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'atualizar consentimento');
      }

      if (!data) {
        throw new Error('Paciente nÃƒÆ’Ã‚Â£o encontrado');
      }

      console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Consentimento atualizado com sucesso');
      return data as Patient;
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao atualizar consentimento:', error);
      throw error;
    }
  }

  // Gerar MRN ÃƒÆ’Ã‚Âºnico
  static async generateMRN(): Promise<string> {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ PatientService.generateMRN() - Gerando MRN ÃƒÆ’Ã‚Âºnico');
    
    try {
      isSupabaseConfigured();
      // Verificar se a coluna 'mrn' existe antes de tentar a checagem de unicidade
      let mrnColumnExists = true;
      try {
        const { missing } = await detectMissingPatientColumns(['mrn']);
        mrnColumnExists = !missing.includes('mrn');
      } catch (schemaCheckError) {
        // Em caso de qualquer falha inesperada na checagem, assume que existe para nÃƒÆ’Ã‚Â£o mascarar outros erros
        console.warn('ÃƒÂ¢Ã…Â¡Ã‚Â� ÃƒÂ¯Ã‚Â¸Ã‚Â Falha ao verificar existÃƒÆ’Ã‚Âªncia da coluna mrn. Prosseguindo com checagem padrÃƒÆ’Ã‚Â£o.', schemaCheckError);
        mrnColumnExists = true;
      }
      
      let mrn: string = '';
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      // Se a coluna mrn nÃƒÆ’Ã‚Â£o existir, gera um MRN e pula a checagem de unicidade para evitar erro 42703
      if (!mrnColumnExists) {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        mrn = `MRN${year}${randomNum}`;
        console.warn('ÃƒÂ¢Ã…Â¡Ã‚Â� ÃƒÂ¯Ã‚Â¸Ã‚Â Coluna mrn ausente na tabela patients. Pulando checagem de unicidade e usando MRN gerado:', mrn);
        return mrn;
      }

      while (!isUnique && attempts < maxAttempts) {
        // Gerar MRN no formato: MRN + ano + 6 dÃƒÆ’Ã‚Â­gitos aleatÃƒÆ’Ã‚Â³rios
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        mrn = `MRN${year}${randomNum}`;
        
        // Verificar se jÃƒÆ’Ã‚Â¡ existe
        const { data, error } = await supabase
          .from('patients')
          .select('id')
          .eq('mrn', mrn)
          .limit(1);
        
        if (error) {
          // Se a coluna 'mrn' nÃƒÆ’Ã‚Â£o existir, evitar falha e aceitar MRN gerado
          if (error.code === '42703' || /column .*mrn.* does not exist/i.test(error.message || '') || /does not exist/i.test(error.message || '')) {
            console.warn('ÃƒÂ¢Ã…Â¡Ã‚Â� ÃƒÂ¯Ã‚Â¸Ã‚Â Coluna mrn ausente ao verificar unicidade. Pulando checagem e usando MRN gerado:', mrn);
            isUnique = true;
            break;
          }
          handleSupabaseError(error, 'verificar MRN ÃƒÆ’Ã‚Âºnico');
        }
        
        isUnique = !data || data.length === 0;
        attempts++;
      }
      
      if (!isUnique) {
        throw new Error('NÃƒÆ’Ã‚Â£o foi possÃƒÆ’Ã‚Â­vel gerar um MRN ÃƒÆ’Ã‚Âºnico apÃƒÆ’Ã‚Â³s vÃƒÆ’Ã‚Â¡rias tentativas');
      }
      
      console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ MRN gerado com sucesso:', mrn);
      return mrn;
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao gerar MRN:', error);
      throw error;
    }
  }

  // Ativar paciente
  static async activatePatient(id: string): Promise<Patient> {
    console.log('ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¾ PatientService.activatePatient() - ID:', id);
    
    try {
      if (!id?.trim()) {
        throw new Error('ID do paciente ÃƒÆ’Ã‚Â© obrigatÃƒÆ’Ã‚Â³rio');
      }
      await this.ensureAuthenticatedProd();
      
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .update({
          status: 'active',
          activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'ativar paciente');
      }

      if (!data) {
        throw new Error('Paciente nÃƒÆ’Ã‚Â£o encontrado');
      }

      // Registrar no audit log
      await this.createAuditLog(id, 'patient_activated', {
        activated_at: new Date().toISOString()
      });

      console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Paciente ativado com sucesso');
      return data as Patient;
    } catch (error) {
      console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao ativar paciente:', error);
      throw error;
    }
  }

  // Adicionar documento ao paciente
  static async addDocument(patientId: string, document: {
    name: string;
    type: string;
    url: string;
    size?: number;
  }): Promise<Record<string, unknown>> {
    if (!import.meta.env.PROD) {
      console.log('PatientService.addDocument() - Paciente:', patientId);
    }
    await this.ensureAuthenticatedProd();
    
    try {
      if (!patientId?.trim()) {
        throw new Error('ID do paciente ÃƒÆ’Ã‚Â© obrigatÃƒÆ’Ã‚Â³rio');
      }
      
      if (!document.name || !document.type || !document.url) {
        throw new Error('Dados do documento sÃƒÆ’Ã‚Â£o obrigatÃƒÆ’Ã‚Â³rios');
      }
      
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patient_documents')
        .insert({
          patient_id: patientId,
          name: document.name,
          type: document.type,
          url: document.url,
          size: document.size || null,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'adicionar documento');
      }

      // Registrar no audit log
      await this.createAuditLog(patientId, 'document_added', {
        document_name: document.name,
        document_type: document.type
      });

      if (!import.meta.env.PROD) {
        console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Documento adicionado com sucesso');
      }
      return data as Record<string, unknown>;
    } catch (error) {
      if (!import.meta.env.PROD) {
        console.error('ÃƒÂ¢Ã‚ÂÃ…â€™ Erro ao adicionar documento:', error);
      }
      throw error;
    }
  }

  // Criar registro de auditoria
  static async createAuditLog(patientId: string, action: string, details: Record<string, unknown> = {}): Promise<void> {
    console.log('PatientService.createAuditLog() - Acao:', action);
    
    try {
      if (!patientId?.trim() || !action?.trim()) {
        throw new Error('ID do paciente e aÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o sÃƒÆ’Ã‚Â£o obrigatÃƒÆ’Ã‚Â³rios');
      }
      
      isSupabaseConfigured();
      
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          patient_id: patientId,
          action,
          details,
          // Campos adicionais para alinhar com relatÃƒÆ’Ã‚Â³rios
          module: 'patients',
          entity_type: 'patient',
          entity_id: patientId,
          old_values: null,
          new_values: null,
          ip_address: null,
          user_agent: null,
          created_at: new Date().toISOString(),
          user_id: null // TODO: Implementar autenticaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de usuÃƒÆ’Ã‚Â¡rio
        });

      if (error) {
        // Log do erro mas nÃƒÆ’Ã‚Â£o falha a operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o principal
        console.warn('ÃƒÂ¢Ã…Â¡Ã‚Â� ÃƒÂ¯Ã‚Â¸Ã‚Â Erro ao criar audit log (nÃƒÆ’Ã‚Â£o crÃƒÆ’Ã‚Â­tico):', error);
      } else {
        console.log('ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Audit log criado com sucesso');
      }
    } catch (error) {
      // Log do erro mas nÃƒÆ’Ã‚Â£o falha a operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o principal
      console.warn('ÃƒÂ¢Ã…Â¡Ã‚Â� ÃƒÂ¯Ã‚Â¸Ã‚Â Erro ao criar audit log (nÃƒÆ’Ã‚Â£o crÃƒÆ’Ã‚Â­tico):', error);
    }
  }
}









