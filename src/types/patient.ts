export interface Patient {
  id: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  gender: 'masculino' | 'feminino' | 'outro';
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  mrn?: string;
  status?: 'active' | 'inactive';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_history?: string;
  current_medications?: string;
  allergies?: string;
  specialty: 'Curativos' | 'Dermatologia' | 'Cirurgia Plástica' | 'Enfermagem' | 'Fisioterapia' | 'Nutrição' | 'Psicologia' | 'Clínica Geral';
  specialty_data?: unknown;
  consent_data_processing: boolean;
  consent_whatsapp: boolean;
  consent_email: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientFormData {
  full_name: string;
  cpf: string;
  birth_date: string;
  gender: 'masculino' | 'feminino' | 'outro';
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_history?: string;
  current_medications?: string;
  allergies?: string;
  specialty: 'Curativos' | 'Dermatologia' | 'Cirurgia Plástica' | 'Enfermagem' | 'Fisioterapia' | 'Nutrição' | 'Psicologia' | 'Clínica Geral';
  specialty_data?: unknown;
  consent_data_processing: boolean;
  consent_whatsapp: boolean;
  consent_email: boolean;
}

export interface PatientStats {
  total: number;
  bySpecialty: {
    Curativos: number;
    Dermatologia: number;
    Cirurgias: number;
  };
  recentRegistrations: number;
}

export interface PatientSearchFilters {
  specialty?: string;
  city?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}
