import { z } from 'zod';
import { formatCPF as formatCPFUtil, formatPhone as formatPhoneUtil } from './utils';

// Regex patterns para validações
export const patterns = {
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cpfNumbers: /^\d{11}$/,
  phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  phoneNumbers: /^\d{10,11}$/,
  cep: /^\d{5}-\d{3}$/,
  cepNumbers: /^\d{8}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  name: /^[a-zA-ZÀ-ÿ\s]+$/,
  onlyNumbers: /^\d+$/,
  onlyLetters: /^[a-zA-ZÀ-ÿ\s]+$/
};

// Função para validar CPF
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  
  return remainder === parseInt(cleaned.charAt(10));
}

// Função para validar CEP
export function validateCEP(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
}

// Função para validar telefone
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

// Função para validar email
export function validateEmail(email: string): boolean {
  return patterns.email.test(email);
}

// Função para validar idade
export function validateAge(birthDate: Date): boolean {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 0 && age - 1 <= 120;
  }
  
  return age >= 0 && age <= 120;
}

// Schema base para paciente
export const basePatientSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo (máximo 100 caracteres)')
    .regex(patterns.name, 'Nome deve conter apenas letras e espaços')
    .refine((name) => {
      const words = name.trim().split(/\s+/);
      return words.length >= 2;
    }, 'Nome deve conter pelo menos nome e sobrenome'),

  cpf: z.string()
    .trim()
    .min(1, 'CPF é obrigatório')
    .refine((cpf) => {
      const cleaned = cpf.replace(/\D/g, '');
      return cleaned.length === 11;
    }, 'CPF deve ter 11 dígitos')
    .refine(validateCPF, 'CPF inválido'),

  birth_date: z.coerce.date({
    required_error: 'Data de nascimento é obrigatória',
    invalid_type_error: 'Data inválida'
  }).refine(validateAge, 'Idade deve estar entre 0 e 120 anos'),

  gender: z.enum(['masculino', 'feminino', 'outro'], {
    required_error: 'Gênero é obrigatório',
    invalid_type_error: 'Gênero deve ser masculino, feminino ou outro'
  }),

  phone: z.string()
    .trim()
    .min(1, 'Telefone é obrigatório')
    .refine((phone) => {
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 11;
    }, 'Telefone deve ter 10 ou 11 dígitos'),

  email: z.string()
    .trim()
    .optional()
    .refine((email) => {
      if (!email || email === '') return true;
      return validateEmail(email);
    }, 'Email inválido'),

  address: z.string()
    .trim()
    .max(200, 'Endereço muito longo (máximo 200 caracteres)')
    .optional(),

  city: z.string()
    .trim()
    .max(100, 'Nome da cidade muito longo (máximo 100 caracteres)')
    .optional(),

  state: z.string()
    .trim()
    .length(2, 'Estado deve ter exatamente 2 caracteres')
    .optional()
    .refine((state) => {
      if (!state) return true;
      return /^[A-Z]{2}$/.test(state);
    }, 'Estado deve conter apenas letras maiúsculas'),

  zip_code: z.string()
    .trim()
    .optional()
    .refine((cep) => {
      if (!cep || cep === '') return true;
      return validateCEP(cep);
    }, 'CEP deve ter 8 dígitos'),

  // Especialidade usa rótulos exibidos na UI para manter consistência com o banco
  specialty: z.enum([
    'Curativos',
    'Dermatologia',
    'Cirurgia Plástica',
    'Enfermagem',
    'Fisioterapia',
    'Nutrição',
    'Psicologia',
    'Clínica Geral'
  ], {
    required_error: 'Especialidade é obrigatória'
  }),

  emergency_contact_name: z.string()
    .trim()
    .max(100, 'Nome do contato de emergência muito longo')
    .optional(),

  emergency_contact_phone: z.string()
    .trim()
    .optional()
    .refine((phone) => {
      if (!phone || phone === '') return true;
      return validatePhone(phone);
    }, 'Telefone de emergência inválido'),

  medical_history: z.string()
    .trim()
    .max(1000, 'Histórico médico muito longo (máximo 1000 caracteres)')
    .optional(),

  allergies: z.string()
    .trim()
    .max(500, 'Lista de alergias muito longa (máximo 500 caracteres)')
    .optional(),

  current_medications: z.string()
    .trim()
    .max(500, 'Lista de medicamentos muito longa (máximo 500 caracteres)')
    .optional(),

  consent_data_processing: z.boolean()
    .refine((val) => val === true, 'Consentimento para processamento de dados é obrigatório'),

  consent_whatsapp: z.boolean().optional(),
  consent_email: z.boolean().optional()
});

// Schema para criação de paciente
export const createPatientSchema = basePatientSchema;

// Schema para edição de paciente (CPF não pode ser alterado)
export const editPatientSchema = basePatientSchema.omit({ cpf: true }).extend({
  id: z.string().uuid('ID inválido')
});

// Schema para busca de pacientes
export const patientSearchSchema = z.object({
  query: z.string().trim().optional(),
  // Buscar por especialidade também usa rótulos
  specialty: z.enum(['Curativos', 'Dermatologia', 'Cirurgias']).optional(),
  city: z.string().trim().optional(),
  state: z.string().length(2).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['full_name', 'created_at', 'birth_date']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Validações de servidor (backend)
export const serverValidations = {
  // Validar se CPF já existe no banco
  async validateUniqueCPF(cpf: string, excludeId?: string): Promise<boolean> {
    // Esta função deve ser implementada no backend
    // Retorna true se o CPF não existe ou se pertence ao paciente sendo editado
    return true;
  },

  // Validar se email já existe no banco
  async validateUniqueEmail(email: string, excludeId?: string): Promise<boolean> {
    // Esta função deve ser implementada no backend
    return true;
  },

  // Validar se o paciente pode ser excluído
  async validateCanDelete(patientId: string): Promise<boolean> {
    // Verificar se o paciente tem consultas, evoluções, etc.
    return true;
  }
};

// Mensagens de erro personalizadas
export const errorMessages = {
  required: 'Este campo é obrigatório',
  invalid: 'Valor inválido',
  tooShort: 'Muito curto',
  tooLong: 'Muito longo',
  invalidFormat: 'Formato inválido',
  invalidCPF: 'CPF inválido',
  invalidEmail: 'Email inválido',
  invalidPhone: 'Telefone inválido',
  invalidDate: 'Data inválida',
  duplicateCPF: 'CPF já cadastrado',
  duplicateEmail: 'Email já cadastrado',
  cannotDelete: 'Não é possível excluir este paciente'
};

// Função para sanitizar dados de entrada
export function sanitizePatientData(data: any): any {
  // Normaliza especialidade para a forma capitalizada canônica
  const SPECIALTY_MAP: Record<string, string> = SPECIALTIES.reduce((acc, item) => {
    acc[item.toLowerCase()] = item;
    return acc;
  }, {} as Record<string, string>);

  const normalizedSpecialty = (() => {
    const raw = data?.specialty;
    if (!raw || typeof raw !== 'string') return raw;
    const key = raw.trim().toLowerCase();
    return SPECIALTY_MAP[key] || raw;
  })();

  return {
    ...data,
    full_name: data.full_name?.trim(),
    cpf: data.cpf?.replace(/\D/g, ''),
    phone: data.phone?.replace(/\D/g, ''),
    email: data.email?.trim().toLowerCase(),
    address: data.address?.trim(),
    city: data.city?.trim(),
    state: data.state?.trim().toUpperCase(),
    zip_code: data.zip_code?.replace(/\D/g, ''),
    emergency_contact_name: data.emergency_contact_name?.trim(),
    emergency_contact_phone: data.emergency_contact_phone?.replace(/\D/g, ''),
    medical_history: data.medical_history?.trim(),
    allergies: data.allergies?.trim(),
    current_medications: data.current_medications?.trim(),
    specialty: normalizedSpecialty
  };
}

// Função para formatar dados para exibição
export function formatPatientData(data: any): any {
  return {
    ...data,
    cpf: data.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
    phone: data.phone?.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3'),
    zip_code: data.zip_code?.replace(/(\d{5})(\d{3})/, '$1-$2'),
    emergency_contact_phone: data.emergency_contact_phone?.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
  };
}

// Helpers de formatação expostos para uso em páginas e formulários
export function formatCPF(cpf: string): string {
  return formatCPFUtil(cpf);
}

export function formatPhone(phone: string): string {
  return formatPhoneUtil(phone);
}

export function formatZipCode(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
}

// Constantes para listas de seleção
export const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Mantemos especialidades alinhadas ao schema (curativos, dermatologia, cirurgias)
export const SPECIALTIES = [
  'Curativos',
  'Dermatologia',
  'Cirurgia Plástica',
  'Enfermagem',
  'Fisioterapia',
  'Nutrição',
  'Psicologia',
  'Clínica Geral'
];

export type CreatePatientData = z.infer<typeof createPatientSchema>;
export type EditPatientData = z.infer<typeof editPatientSchema>;
export type PatientSearchData = z.infer<typeof patientSearchSchema>;
