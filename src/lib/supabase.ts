import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validação explícita para produção
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Bloquear valores de demonstração e URLs não-HTTPS em produção
if (import.meta.env.PROD) {
  const isDemo = /demo\.supabase\.co|demo_key/.test(`${supabaseUrl}${supabaseAnonKey}`)
  const isHttps = supabaseUrl.startsWith('https://')
  if (isDemo) {
    throw new Error('Invalid Supabase production configuration: demo URL/key detected')
  }
  if (!isHttps) {
    throw new Error('Supabase URL must use HTTPS in production')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'professional' | 'patient'
          specialty?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'professional' | 'patient'
          specialty?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'professional' | 'patient'
          specialty?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          profile_id?: string
          full_name: string
          email?: string
          cpf: string
          birth_date: string
          phone: string
          address?: string
          emergency_contact?: string
          medical_history?: string
          allergies?: string
          medications?: string
          status: 'active' | 'inactive'
          specialties?: string[]
          avatar_url?: string
          // Campos específicos por especialidade
          specialty_data?: {
            curativos?: {
              area?: string
              profundidade?: string
              necrose?: boolean
              dor_nivel?: number
              sinais_infeccao?: boolean
              observacoes?: string
            }
            dermatologia?: {
              procedimento?: string
              parametros?: string
              fototipo?: number
              manchas?: string
              acne_grau?: number
              observacoes?: string
            }
            cirurgias?: {
              tipo?: string
              anestesia?: string
              insumos?: string[]
              suturas?: string
              pos_operatorio?: string
              observacoes?: string
            }
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string
          full_name: string
          email?: string
          cpf: string
          birth_date: string
          phone: string
          address?: string
          emergency_contact?: string
          medical_history?: string
          allergies?: string
          medications?: string
          status?: 'active' | 'inactive'
          specialties?: string[]
          avatar_url?: string
          specialty_data?: {
            curativos?: {
              area?: string
              profundidade?: string
              necrose?: boolean
              dor_nivel?: number
              sinais_infeccao?: boolean
              observacoes?: string
            }
            dermatologia?: {
              procedimento?: string
              parametros?: string
              fototipo?: number
              manchas?: string
              acne_grau?: number
              observacoes?: string
            }
            cirurgias?: {
              tipo?: string
              anestesia?: string
              insumos?: string[]
              suturas?: string
              pos_operatorio?: string
              observacoes?: string
            }
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          full_name?: string
          email?: string
          cpf?: string
          birth_date?: string
          phone?: string
          address?: string
          emergency_contact?: string
          medical_history?: string
          allergies?: string
          medications?: string
          status?: 'active' | 'inactive'
          specialties?: string[]
          avatar_url?: string
          specialty_data?: {
            curativos?: {
              area?: string
              profundidade?: string
              necrose?: boolean
              dor_nivel?: number
              sinais_infeccao?: boolean
              observacoes?: string
            }
            dermatologia?: {
              procedimento?: string
              parametros?: string
              fototipo?: number
              manchas?: string
              acne_grau?: number
              observacoes?: string
            }
            cirurgias?: {
              tipo?: string
              anestesia?: string
              insumos?: string[]
              suturas?: string
              pos_operatorio?: string
              observacoes?: string
            }
          }
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          professional_id: string
          specialty: 'curativos' | 'dermatologia' | 'cirurgias' | 'Curativos' | 'Dermatologia' | 'Cirurgias'
          date_time: string
          duration: number
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          professional_id: string
          specialty: 'curativos' | 'dermatologia' | 'cirurgias' | 'Curativos' | 'Dermatologia' | 'Cirurgias'
          date_time: string
          duration: number
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          professional_id?: string
          specialty?: 'curativos' | 'dermatologia' | 'cirurgias' | 'Curativos' | 'Dermatologia' | 'Cirurgias'
          date_time?: string
          duration?: number
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string
          updated_at?: string
        }
      }
      clinical_evolutions: {
        Row: {
          id: string
          patient_id: string
          professional_id: string
          appointment_id?: string
          specialty: 'curativos' | 'dermatologia' | 'cirurgias' | 'Curativos' | 'Dermatologia' | 'Cirurgias'
          evolution_data: any
          photos: string[]
          ai_analysis?: string
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          professional_id: string
          appointment_id?: string
          specialty: 'curativos' | 'dermatologia' | 'cirurgias' | 'Curativos' | 'Dermatologia' | 'Cirurgias'
          evolution_data: any
          photos?: string[]
          ai_analysis?: string
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          professional_id?: string
          appointment_id?: string
          specialty?: 'curativos' | 'dermatologia' | 'cirurgias' | 'Curativos' | 'Dermatologia' | 'Cirurgias'
          evolution_data?: any
          photos?: string[]
          ai_analysis?: string
          version?: number
          updated_at?: string
        }
      }
      digital_consents: {
        Row: {
          id: string
          patient_id: string
          professional_id: string
          consent_type: string
          content: string
          hash: string
          signed_at: string
          ip_address: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          professional_id: string
          consent_type: string
          content: string
          hash: string
          signed_at: string
          ip_address: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          professional_id?: string
          consent_type?: string
          content?: string
          hash?: string
          signed_at?: string
          ip_address?: string
        }
      }
      inventory: {
        Row: {
          id: string
          name: string
          category: string
          current_stock: number
          min_stock: number
          unit_cost: number
          supplier: string
          batch_number?: string
          expiry_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          current_stock: number
          min_stock: number
          unit_cost: number
          supplier: string
          batch_number?: string
          expiry_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          current_stock?: number
          min_stock?: number
          unit_cost?: number
          supplier?: string
          batch_number?: string
          expiry_date?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          patient_id: string
          appointment_id?: string
          amount: number
          payment_method: 'pix' | 'credit_card' | 'debit_card' | 'cash'
          status: 'pending' | 'paid' | 'cancelled' | 'refunded'
          external_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          appointment_id?: string
          amount: number
          payment_method: 'pix' | 'credit_card' | 'debit_card' | 'cash'
          status?: 'pending' | 'paid' | 'cancelled' | 'refunded'
          external_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          appointment_id?: string
          amount?: number
          payment_method?: 'pix' | 'credit_card' | 'debit_card' | 'cash'
          status?: 'pending' | 'paid' | 'cancelled' | 'refunded'
          external_id?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          table_name: string
          record_id: string
          old_values?: any
          new_values?: any
          ip_address: string
          user_agent: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          table_name: string
          record_id: string
          old_values?: any
          new_values?: any
          ip_address: string
          user_agent: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          table_name?: string
          record_id?: string
          old_values?: any
          new_values?: any
          ip_address?: string
          user_agent?: string
        }
      }
    }
  }
}

