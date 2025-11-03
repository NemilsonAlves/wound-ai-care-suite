import { supabase } from '@/lib/supabase';
import { Patient, PatientFormData } from '@/types/patient';
import { 
  createPatientSchema, 
  editPatientSchema, 
  sanitizePatientData as sanitizeData,
  validateCPF,
  validatePhone,
  validateEmail,
  errorMessages
} from '@/lib/validations';
import { z } from 'zod';
import { detectMissingPatientColumns, ensureSchemaAndInsertAtomically, REQUIRED_PATIENT_COLUMNS } from '@/services/schemaGuard';

// Validação de configuração do Supabase
const isSupabaseConfigured = (): void => {
  if (!supabase) {
    throw new Error('Supabase não está configurado. Verifique as variáveis de ambiente.');
  }
};

// Validação robusta de dados do paciente usando Zod
const validatePatientData = (data: PatientFormData, isEdit: boolean = false): string[] => {
  try {
    const schema = isEdit ? editPatientSchema : createPatientSchema;
    schema.parse(data);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(err => err.message);
    }
    return ['Erro de validação desconhecido'];
  }
};

// Validação adicional de regras de negócio
const validateBusinessRules = async (data: PatientFormData, excludeId?: string): Promise<string[]> => {
  const errors: string[] = [];
  
  // Verificar CPF único
  if (data.cpf) {
    const cpfExists = await PatientService.checkCpfExists(data.cpf, excludeId);
    if (cpfExists) {
      errors.push(errorMessages.duplicateCPF);
    }
  }
  
  // Verificar email único se fornecido
  if (data.email) {
    // Implementar verificação de email único quando necessário
  }
  
  return errors;
};

// Tratamento de erros do Supabase melhorado
const handleSupabaseError = (error: { code?: string; message?: string }, operation: string = 'operação'): never => {
  console.error(`❌ Erro do Supabase na ${operation}:`, error);
  
  // Erros específicos do Supabase
  if (error.code === 'PGRST301') {
    throw new Error('Dados inválidos fornecidos. Verifique os campos obrigatórios.');
  }
  
  if (error.code === 'PGRST116') {
    throw new Error('Registro não encontrado.');
  }
  
  if (error.code === '23505') {
    throw new Error('Já existe um paciente com este CPF.');
  }
  
  if (error.code === '42501') {
    throw new Error('Sem permissão para realizar esta operação. Verifique as políticas RLS.');
  }
  
  if (error.code === '42P17') {
    throw new Error('Erro de configuração do banco de dados. Verifique as políticas RLS.');
  }

  // Coluna inexistente (comum quando o schema não tem 'mrn' ainda)
  if (error.code === '42703' || /column .* does not exist/i.test(error.message) || /does not exist/i.test(error.message)) {
    throw new Error(`Erro na ${operation}: coluna requerida inexistente no schema (ex.: patients.mrn). Execute o script de correção do schema.`);
  }
  
  // Erro genérico
  throw new Error(`Erro na ${operation}: ${error?.message || 'Erro desconhecido'}`);
};

// Sanitização de dados usando função centralizada
const sanitizePatientData = (data: PatientFormData): PatientFormData => {
  return sanitizeData(data);
};

export class PatientService {
  static async ensureAuthenticatedProd(): Promise<void> {
    if (!import.meta.env.PROD) return;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(`Falha ao verificar sessão de autenticação: ${error.message || 'erro desconhecido'}`);
    }
    const session = data?.session;
    if (!session || !session.user) {
      throw new Error('Autenticação obrigatória em produção. Faça login para continuar.');
    }
  }
  // Buscar todos os pacientes com retry
  static async getAll(): Promise<Patient[]> {
    console.log('🔄 PatientService.getAll() - Buscando pacientes');
    
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

        console.log(`✅ ${data?.length || 0} pacientes encontrados`);
        return data || [];
      },
      'buscar todos os pacientes',
      3,
      1000
    );
  }

  // Buscar paciente por ID
  static async getById(id: string): Promise<Patient | null> {
    console.log('🔄 PatientService.getById() - ID:', id);
    
    try {
      if (!id?.trim()) {
        throw new Error('ID do paciente é obrigatório');
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

      console.log('✅ Paciente encontrado:', data?.full_name);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar paciente por ID:', error);
      throw error;
    }
  }

  // Criar novo paciente
  static async create(formData: PatientFormData): Promise<Patient> {
    console.log('🔄 PatientService.create() - Criando paciente:', formData.full_name);
    
    try {
      await this.ensureAuthenticatedProd();
      // Sanitizar dados primeiro para alinhar capitalização e formatos
      const sanitizedData = sanitizePatientData(formData);

      // Validar dados com Zod usando os dados já sanitizados
      const validationErrors = validatePatientData(sanitizedData, false);
      if (validationErrors.length > 0) {
        throw new Error(`Dados inválidos: ${validationErrors.join(', ')}`);
      }
      
      // Validar regras de negócio (CPF único, etc.)
      const businessErrors = await validateBusinessRules(sanitizedData);
      if (businessErrors.length > 0) {
        throw new Error(`Erro de validação: ${businessErrors.join(', ')}`);
      }
      
      // Gerar MRN único
      const mrn = await this.generateMRN();
      
      isSupabaseConfigured();
      
      // 1) Verificar colunas obrigatórias na tabela antes de inserir
      const schemaCheck = await detectMissingPatientColumns(REQUIRED_PATIENT_COLUMNS);
      if (schemaCheck.missing.length > 0) {
        console.warn('⚠️ Colunas ausentes detectadas em patients:', schemaCheck.missing);

        // 2) Tentar correção atômica via função RPC (se instalada)
        const payload = {
          ...sanitizedData,
          mrn,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: rpcData, error: rpcError } = await ensureSchemaAndInsertAtomically(payload);
        if (rpcError) {
          // 4) Tratamento de erro claro quando a criação de campos falha
          const missingList = schemaCheck.missing.join(', ');
          throw new Error(
            `Erro na verificação/criação de colunas: faltam [${missingList}]. ` +
            `A função RPC ensure_patients_schema_and_insert não pôde corrigir automaticamente (${rpcError.message || rpcError}). ` +
            `Execute o script SQL fix-rls-and-structure-complete.sql no Supabase para alinhar o schema.`
          );
        }

        if (!rpcData || !rpcData.id) {
          throw new Error('Falha na operação atômica de schema+insert: nenhum dado retornado.');
        }

        // Inserção efetuada com sucesso pela função RPC
        await this.createAuditLog(rpcData.id, 'patient_created', { mrn, full_name: rpcData.full_name, specialty: rpcData.specialty });
        console.log('✅ Paciente criado (RPC atômica) com sucesso:', rpcData.full_name, 'MRN:', mrn);
        return rpcData as Patient;
      }

      // 3) Se não houver colunas faltantes, seguir com insert normal
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
        throw new Error('Nenhum dado retornado após criação do paciente');
      }

      // Registrar no audit log
      await this.createAuditLog(data.id, 'patient_created', {
        mrn,
        full_name: data.full_name,
        specialty: data.specialty
      });

      console.log('✅ Paciente criado com sucesso:', data.full_name, 'MRN:', mrn);
      return data as Patient;
    } catch (error) {
      console.error('❌ Erro ao criar paciente:', error);
      throw error;
    }
  }

  // Atualizar paciente
  static async update(id: string, formData: PatientFormData): Promise<Patient> {
    console.log('🔄 PatientService.update() - Atualizando paciente:', id);
    
    try {
      if (!id?.trim()) {
        throw new Error('ID do paciente é obrigatório');
      }
      await this.ensureAuthenticatedProd();
      
      // Validar dados com Zod (modo edição)
      const validationErrors = validatePatientData(formData, true);
      if (validationErrors.length > 0) {
        throw new Error(`Dados inválidos: ${validationErrors.join(', ')}`);
      }
      
      // Validar regras de negócio (excluindo o próprio paciente)
      const businessErrors = await validateBusinessRules(formData, id);
      if (businessErrors.length > 0) {
        throw new Error(`Erro de validação: ${businessErrors.join(', ')}`);
      }
      
      // Sanitizar dados
      const sanitizedData = sanitizePatientData(formData);
      
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

      console.log('✅ Paciente atualizado com sucesso:', data.full_name);
      return data as Patient;
    } catch (error) {
      console.error('❌ Erro ao atualizar paciente:', error);
      throw error;
    }
  }

  // Excluir paciente
  static async delete(id: string): Promise<void> {
    console.log('🔄 PatientService.delete() - Excluindo paciente:', id);
    
    try {
      if (!id?.trim()) {
        throw new Error('ID do paciente é obrigatório');
      }
      await this.ensureAuthenticatedProd();
      
      isSupabaseConfigured();
      
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        // Fallback: se a política RLS bloquear DELETE, realizar soft-delete (status = 'inactive')
        if (error.code === '42501' || /permission|rls/i.test(error.message || '')) {
          console.warn('⚠️ Sem permissão para DELETE. Aplicando soft-delete (status = inactive).');
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

      console.log('✅ Paciente excluído com sucesso');
    } catch (error) {
      console.error('❌ Erro ao excluir paciente:', error);
      throw error;
    }
  }

  // Buscar pacientes por termo
  static async search(query: string): Promise<Patient[]> {
    console.log('🔄 PatientService.search() - Termo:', query);
    
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

      console.log(`✅ ${data?.length || 0} pacientes encontrados na busca`);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar pacientes:', error);
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
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} - ${operationName}`);
        const result = await operation();
        
        if (attempt > 1) {
          console.log(`✅ ${operationName} bem-sucedida na tentativa ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Tentativa ${attempt}/${maxRetries} falhou - ${operationName}:`, error);
        
        // Se não é a última tentativa, aguarda antes de tentar novamente
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Backoff exponencial
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`❌ ${operationName} falhou após ${maxRetries} tentativas`);
    throw lastError;
  }

  // Testar conexão com retry
  static async testConnection(): Promise<boolean> {
    try {
      const result = await this.retryOperation(
        async () => {
          isSupabaseConfigured();
          
          const { data, error } = await supabase
            .from('patients')
            .select('count')
            .limit(1);
          
          if (error) {
            throw new Error(`Erro de conexão: ${error.message}`);
          }
          
          return true;
        },
        'teste de conexão',
        3,
        1000
      );
      
      console.log('✅ Conexão com Supabase OK');
      return result;
    } catch (error) {
      console.error('❌ Erro ao testar conexão após todas as tentativas:', error);
      return false;
    }
  }

  // Testar conexão detalhada com diagnóstico
  static async testConnectionDetailed(): Promise<{
    success: boolean;
    message: string;
    details: Record<string, unknown>;
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    
    try {
      console.log('🔍 Iniciando teste detalhado de conexão...');
      
      // Verificar configuração
      if (!supabase) {
        return {
          success: false,
          message: 'Supabase não configurado',
          details: { error: 'Cliente Supabase não inicializado' },
          timestamp
        };
      }
      
      // Implementar retry específico para Failed to fetch
      return await this.retryOperation(
        async () => {
          // Testar conectividade básica com timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
          
          try {
            const { data, error, count } = await supabase
              .from('patients')
              .select('*', { count: 'exact', head: true })
              .abortSignal(controller.signal);
            
            clearTimeout(timeoutId);
            
            if (error) {
              // Tratar erros específicos
              if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
                throw new Error(`Erro de rede: Não foi possível conectar ao Supabase. Verifique sua conexão com a internet e tente novamente.`);
              }
              
              if (error.message.includes('CORS')) {
                throw new Error(`Erro de CORS: Problema de configuração de segurança. Tente recarregar a página (Ctrl+F5).`);
              }
              
              throw new Error(`Erro de conexão: ${error.message}`);
            }
            
            return {
              success: true,
              message: `Conexão estabelecida com sucesso. ${count || 0} registros na tabela.`,
              details: { 
                count: count || 0,
                timestamp,
                connectionTest: 'passed'
              },
              timestamp
            };
          } catch (fetchError: unknown) {
            clearTimeout(timeoutId);
            
            // Tratar erros específicos de fetch
            const fe = fetchError as { name?: string; message?: string };
            if (fe.name === 'AbortError') {
              throw new Error('Timeout: A conexão demorou muito para responder. Verifique sua internet.');
            }
            
            if (fe.message && fe.message.includes('Failed to fetch')) {
              throw new Error('Erro de rede: Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.');
            }
            
            if (fe.message && fe.message.includes('NetworkError')) {
              throw new Error('Erro de rede: Problema de conectividade. Verifique sua internet ou firewall.');
            }
            
            throw fetchError;
          }
        },
        'teste de conexão detalhado',
        3,
        2000
      );
      
    } catch (error) {
      console.error('❌ Erro no teste de conexão detalhado:', error);
      
      // Análise detalhada do erro
      let errorMessage = 'Erro desconhecido de conexão';
      const errObj = error as { message?: string };
      let errorDetails: Record<string, unknown> = { originalError: errObj.message };
      
      if (errObj.message && errObj.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de rede: Não foi possível conectar ao Supabase';
        errorDetails = {
          ...errorDetails,
          possibleCauses: [
            'Conexão com a internet instável',
            'Firewall ou antivírus bloqueando a conexão',
            'Projeto Supabase pausado ou inativo',
            'Problema temporário do servidor'
          ],
          solutions: [
            'Verifique sua conexão com a internet',
            'Tente recarregar a página (Ctrl+F5)',
            'Desative temporariamente antivírus/firewall',
            'Tente novamente em alguns minutos',
            'Teste em uma aba anônima do navegador'
          ]
        };
      } else if (errObj.message && errObj.message.includes('CORS')) {
        errorMessage = 'Erro de CORS: Problema de configuração de segurança';
        errorDetails = {
          ...errorDetails,
          possibleCauses: [
            'Cache do navegador desatualizado',
            'Configuração de CORS no Supabase',
            'Problema de desenvolvimento local'
          ],
          solutions: [
            'Recarregue a página com Ctrl+Shift+R',
            'Teste em uma aba anônima',
            'Limpe o cache do navegador'
          ]
        };
      } else if (errObj.message && (errObj.message.includes('Timeout') || errObj.message.includes('timeout'))) {
        errorMessage = 'Timeout: Conexão muito lenta';
        errorDetails = {
          ...errorDetails,
          possibleCauses: [
            'Conexão com a internet lenta',
            'Servidor sobrecarregado',
            'Problema de rede temporário'
          ],
          solutions: [
            'Verifique a velocidade da sua internet',
            'Tente novamente em alguns minutos',
            'Use uma conexão de rede diferente'
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

  // Método auxiliar para diagnóstico de rede
  static async diagnoseNetworkIssue(): Promise<{
    networkStatus: string;
    supabaseReachable: boolean;
    suggestions: string[];
  }> {
    const suggestions: string[] = [];
    let networkStatus = 'unknown';
    let supabaseReachable = false;
    
    try {
      // Teste básico de conectividade
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      });
      networkStatus = 'connected';
    } catch (error) {
      networkStatus = 'disconnected';
      suggestions.push('Verifique sua conexão com a internet');
    }
    
    try {
      // Teste específico do Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        const response = await fetch(supabaseUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        supabaseReachable = response.ok;
      }
    } catch (error) {
      suggestions.push('Servidor Supabase pode estar indisponível');
      suggestions.push('Verifique se o projeto Supabase está ativo');
    }
    
    if (!supabaseReachable) {
      suggestions.push('Tente recarregar a página');
      suggestions.push('Verifique as configurações de firewall');
      suggestions.push('Teste em uma aba anônima do navegador');
    }
    
    return {
      networkStatus,
      supabaseReachable,
      suggestions
    };
  }

  // Método para tentar recuperação automática com diferentes estratégias
  static async attemptRecovery(): Promise<{ success: boolean; message: string; strategy?: string }> {
    const strategies = [
      {
        name: 'Reconexão simples',
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
        name: 'Reconexão com timeout estendido',
        action: async () => {
          // Tenta com timeout maior
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos
          
          try {
            const { data, error } = await supabase
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
        console.log(`🔄 Tentando estratégia: ${strategy.name}`);
        const result = await strategy.action();
        
        if (result) {
          return {
            success: true,
            message: `Recuperação bem-sucedida usando: ${strategy.name}`,
            strategy: strategy.name
          };
        }
      } catch (error) {
        console.log(`❌ Estratégia ${strategy.name} falhou:`, error);
        continue;
      }
    }

    return {
      success: false,
      message: 'Todas as estratégias de recuperação falharam'
    };
  }

  // Continuar com o método original...
static async _originalTestConnectionDetailed_backup(): Promise<{
    success: boolean;
    message: string;
    details: Record<string, unknown>;
    timestamp: string;
  }> {
    const timestamp = new Date().toISOString();
    
    try {
      console.log('🔍 Iniciando teste detalhado de conexão...');
      
      // Verificar configuração
      if (!supabase) {
        return {
          success: false,
          message: 'Supabase não configurado',
          details: { error: 'Cliente Supabase não inicializado' },
          timestamp
        };
      }
      
      // Testar conectividade básica
      const { data, error, count } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        return {
          success: false,
          message: `Erro de conexão: ${error.message}`,
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
        message: `Conexão estabelecida com sucesso. ${count || 0} registros na tabela.`,
        details: { 
          count: count || 0,
          status: 'connected',
          table: 'patients'
        },
        timestamp
      };
      
    } catch (error) {
      console.error('❌ Erro no teste detalhado:', error);
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

  // Verificar se CPF já existe
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
        console.error('❌ Erro ao verificar CPF:', error);
        return false;
      }
      
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('❌ Erro ao verificar CPF:', error);
      return false;
    }
  }

  // Métodos adicionais para compatibilidade com o código existente
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

      console.log(`✅ ${data?.length || 0} pacientes recentes encontrados`);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar pacientes recentes:', error);
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
        .ilike('specialty', specialty)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, 'buscar pacientes por especialidade');
      }

      console.log(`✅ ${data?.length || 0} pacientes encontrados para ${specialty}`);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar pacientes por especialidade:', error);
      throw error;
    }
  }

  static async getPatientStats(): Promise<{ total: number; bySpecialty: { Curativos: number; Dermatologia: number; Cirurgias: number }; recentRegistrations: number }> {
    console.log('🔄 PatientService.getPatientStats() - Buscando estatísticas');
    
    try {
      isSupabaseConfigured();
      
      const { data, error } = await supabase
        .from('patients')
        .select('specialty, created_at');

      if (error) {
        handleSupabaseError(error, 'buscar estatísticas de pacientes');
      }

      const stats = {
        total: data?.length || 0,
        bySpecialty: {
          Curativos: data?.filter(p => p.specialty === 'Curativos').length || 0,
          Dermatologia: data?.filter(p => p.specialty === 'Dermatologia').length || 0,
          Cirurgias: data?.filter(p => p.specialty === 'Cirurgias').length || 0,
        },
        recentRegistrations: data?.filter(p => {
          const createdAt = new Date(p.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdAt >= thirtyDaysAgo;
        }).length || 0
      };

      console.log('✅ Estatísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error);
      throw error;
    }
  }

  static subscribeToPatients(callback: () => void) {
    console.log('🔄 PatientService.subscribeToPatients() - Configurando subscription');
    
    try {
      const subscription = supabase
        .channel('patients_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'patients' }, 
          () => {
            console.log('📡 Mudança detectada na tabela patients');
            callback();
          }
        )
        .subscribe();

      console.log('✅ Subscription configurada');
      return subscription;
    } catch (error) {
      console.error('❌ Erro ao configurar subscription:', error);
      return null;
    }
  }

  static async updateConsent(id: string, consentData: Pick<PatientFormData, 'consent_data_processing' | 'consent_whatsapp' | 'consent_email'>): Promise<Patient> {
    console.log('🔄 PatientService.updateConsent() - ID:', id);
    
    try {
      if (!id?.trim()) {
        throw new Error('ID do paciente é obrigatório');
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
        throw new Error('Paciente não encontrado');
      }

      console.log('✅ Consentimento atualizado com sucesso');
      return data as Patient;
    } catch (error) {
      console.error('❌ Erro ao atualizar consentimento:', error);
      throw error;
    }
  }

  // Gerar MRN único
  static async generateMRN(): Promise<string> {
    console.log('🔄 PatientService.generateMRN() - Gerando MRN único');
    
    try {
      isSupabaseConfigured();
      // Verificar se a coluna 'mrn' existe antes de tentar a checagem de unicidade
      let mrnColumnExists = true;
      try {
        const { missing } = await detectMissingPatientColumns(['mrn']);
        mrnColumnExists = !missing.includes('mrn');
      } catch (schemaCheckError) {
        // Em caso de qualquer falha inesperada na checagem, assume que existe para não mascarar outros erros
        console.warn('⚠️ Falha ao verificar existência da coluna mrn. Prosseguindo com checagem padrão.', schemaCheckError);
        mrnColumnExists = true;
      }
      
      let mrn: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      // Se a coluna mrn não existir, gera um MRN e pula a checagem de unicidade para evitar erro 42703
      if (!mrnColumnExists) {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        mrn = `MRN${year}${randomNum}`;
        console.warn('⚠️ Coluna mrn ausente na tabela patients. Pulando checagem de unicidade e usando MRN gerado:', mrn);
        return mrn;
      }

      while (!isUnique && attempts < maxAttempts) {
        // Gerar MRN no formato: MRN + ano + 6 dígitos aleatórios
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        mrn = `MRN${year}${randomNum}`;
        
        // Verificar se já existe
        const { data, error } = await supabase
          .from('patients')
          .select('id')
          .eq('mrn', mrn)
          .limit(1);
        
        if (error) {
          // Se a coluna 'mrn' não existir, evitar falha e aceitar MRN gerado
          if (error.code === '42703' || /column .*mrn.* does not exist/i.test(error.message || '') || /does not exist/i.test(error.message || '')) {
            console.warn('⚠️ Coluna mrn ausente ao verificar unicidade. Pulando checagem e usando MRN gerado:', mrn);
            isUnique = true;
            break;
          }
          handleSupabaseError(error, 'verificar MRN único');
        }
        
        isUnique = !data || data.length === 0;
        attempts++;
      }
      
      if (!isUnique) {
        throw new Error('Não foi possível gerar um MRN único após várias tentativas');
      }
      
      console.log('✅ MRN gerado com sucesso:', mrn);
      return mrn;
    } catch (error) {
      console.error('❌ Erro ao gerar MRN:', error);
      throw error;
    }
  }

  // Ativar paciente
  static async activatePatient(id: string): Promise<Patient> {
    console.log('🔄 PatientService.activatePatient() - ID:', id);
    
    try {
      if (!id?.trim()) {
        throw new Error('ID do paciente é obrigatório');
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
        throw new Error('Paciente não encontrado');
      }

      // Registrar no audit log
      await this.createAuditLog(id, 'patient_activated', {
        activated_at: new Date().toISOString()
      });

      console.log('✅ Paciente ativado com sucesso');
      return data as Patient;
    } catch (error) {
      console.error('❌ Erro ao ativar paciente:', error);
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
      console.log('🔄 PatientService.addDocument() - Paciente:', patientId);
    }
    await this.ensureAuthenticatedProd();
    
    try {
      if (!patientId?.trim()) {
        throw new Error('ID do paciente é obrigatório');
      }
      
      if (!document.name || !document.type || !document.url) {
        throw new Error('Dados do documento são obrigatórios');
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
        console.log('✅ Documento adicionado com sucesso');
      }
      return data as Record<string, unknown>;
    } catch (error) {
      if (!import.meta.env.PROD) {
        console.error('❌ Erro ao adicionar documento:', error);
      }
      throw error;
    }
  }

  // Criar registro de auditoria
  static async createAuditLog(patientId: string, action: string, details: Record<string, unknown> = {}): Promise<void> {
    console.log('🔄 PatientService.createAuditLog() - Ação:', action);
    
    try {
      if (!patientId?.trim() || !action?.trim()) {
        throw new Error('ID do paciente e ação são obrigatórios');
      }
      
      isSupabaseConfigured();
      
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          patient_id: patientId,
          action,
          details,
          // Campos adicionais para alinhar com relatórios
          module: 'patients',
          entity_type: 'patient',
          entity_id: patientId,
          old_values: null,
          new_values: null,
          ip_address: null,
          user_agent: null,
          created_at: new Date().toISOString(),
          user_id: null // TODO: Implementar autenticação de usuário
        });

      if (error) {
        // Log do erro mas não falha a operação principal
        console.warn('⚠️ Erro ao criar audit log (não crítico):', error);
      } else {
        console.log('✅ Audit log criado com sucesso');
      }
    } catch (error) {
      // Log do erro mas não falha a operação principal
      console.warn('⚠️ Erro ao criar audit log (não crítico):', error);
    }
  }
}
