import React, { createContext, useContext } from 'react'

export interface SpecialtyConfig {
  id: string;
  name: string;
  enabled: boolean;
  procedures: ProcedureConfig[];
  materials: MaterialMapping[];
  templates: TemplateConfig[];
}

export interface ProcedureConfig {
  id: string;
  name: string;
  price: number;
  duration: number; // em minutos
  materials: string[]; // IDs dos materiais
  description?: string;
}

export interface MaterialMapping {
  procedureId: string;
  materialId: string;
  quantity: number;
  required: boolean;
}

export interface TemplateConfig {
  id: string;
  name: string;
  type: 'evolution' | 'report' | 'consent';
  content: string;
  fields: TemplateField[];
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  required: boolean;
  options?: string[]; // para campos select
}

export interface ClinicConfig {
  id: string;
  name: string;
  specialties: SpecialtyConfig[];
  userRoles: UserRole[];
  generalSettings: GeneralSettings;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
  canAccessSpecialties: string[]; // IDs das especialidades
}

export interface Permission {
  module: string;
  actions: string[]; // 'create', 'read', 'update', 'delete'
}

export interface GeneralSettings {
  multiClinic: boolean;
  multiUnit: boolean;
  defaultLanguage: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  workingHours: {
    start: string;
    end: string;
    days: number[]; // 0-6 (domingo-sábado)
  };
}

export interface ClinicConfigContextType {
  config: ClinicConfig | null;
  loading: boolean;
  updateSpecialtyConfig: (specialtyId: string, updates: Partial<SpecialtyConfig>) => Promise<void>;
  updateUserRole: (roleId: string, updates: Partial<UserRole>) => Promise<void>;
  updateGeneralSettings: (updates: Partial<GeneralSettings>) => Promise<void>;
  enableSpecialty: (specialtyId: string) => Promise<void>;
  disableSpecialty: (specialtyId: string) => Promise<void>;
  addProcedure: (specialtyId: string, procedure: Omit<ProcedureConfig, 'id'>) => Promise<void>;
  updateProcedure: (specialtyId: string, procedureId: string, updates: Partial<ProcedureConfig>) => Promise<void>;
  deleteProcedure: (specialtyId: string, procedureId: string) => Promise<void>;
}

export const ClinicConfigContext = createContext<ClinicConfigContextType | undefined>(undefined);

export const useClinicConfig = () => {
  const context = useContext(ClinicConfigContext);
  if (context === undefined) {
    throw new Error('useClinicConfig must be used within a ClinicConfigProvider');
  }
  return context;
};

