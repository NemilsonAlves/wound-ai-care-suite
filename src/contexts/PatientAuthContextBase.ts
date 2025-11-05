import React, { createContext, useContext } from 'react'

export interface PatientProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  cpf: string;
  avatar_url?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medical_info?: {
    allergies?: string;
    medications?: string;
    medical_history?: string;
    insurance_provider?: string;
    insurance_number?: string;
  };
  preferences?: {
    notifications_email: boolean;
    notifications_sms: boolean;
    language: string;
  };
}

export interface PatientSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  patient_id: string;
}

export interface PatientAuthContextType {
  patient: PatientProfile | null;
  session: PatientSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<PatientProfile>) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
}

export const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

export const usePatientAuth = () => {
  const context = useContext(PatientAuthContext);
  if (context === undefined) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider');
  }
  return context;
};

