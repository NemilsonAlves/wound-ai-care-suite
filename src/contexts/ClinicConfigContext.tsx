import React, { useState, useEffect } from 'react';
import { ClinicConfigContext, ClinicConfigContextType, SpecialtyConfig, ProcedureConfig, MaterialMapping, TemplateConfig, TemplateField, ClinicConfig, UserRole, Permission, GeneralSettings } from './ClinicConfigContextBase';


// Tipos, contexto e hook importados do arquivo base

// Configuração padrão do sistema
const defaultConfig: ClinicConfig = {
  id: 'default-clinic',
  name: 'Clínica Padrão',
  specialties: [
    {
      id: 'curativos',
      name: 'Curativos Avançados',
      enabled: true,
      procedures: [
        {
          id: 'curativo-simples',
          name: 'Curativo Simples',
          price: 50.00,
          duration: 30,
          materials: ['gaze', 'soro', 'luva'],
          description: 'Curativo básico para feridas simples'
        },
        {
          id: 'curativo-complexo',
          name: 'Curativo Complexo',
          price: 120.00,
          duration: 60,
          materials: ['gaze', 'soro', 'luva', 'alginato', 'hidrocoloide'],
          description: 'Curativo para feridas complexas com produtos especializados'
        }
      ],
      materials: [],
      templates: [
        {
          id: 'evolucao-curativo',
          name: 'Evolução de Curativo',
          type: 'evolution',
          content: 'Evolução do curativo realizado em {data}',
          fields: [
            { id: 'area', name: 'Área da lesão (cm²)', type: 'number', required: true },
            { id: 'profundidade', name: 'Profundidade', type: 'select', required: true, options: ['Superficial', 'Parcial', 'Total'] },
            { id: 'necrose', name: 'Presença de necrose', type: 'checkbox', required: false },
            { id: 'dor', name: 'Nível de dor (0-10)', type: 'number', required: true },
            { id: 'observacoes', name: 'Observações', type: 'textarea', required: false }
          ]
        }
      ]
    },
    {
      id: 'dermatologia',
      name: 'Dermatologia Estética',
      enabled: false,
      procedures: [
        {
          id: 'peeling-quimico',
          name: 'Peeling Químico',
          price: 200.00,
          duration: 45,
          materials: ['acido-glicolico', 'neutralizante', 'protetor-solar'],
          description: 'Peeling químico para renovação celular'
        },
        {
          id: 'laser-co2',
          name: 'Laser CO2 Fracionado',
          price: 800.00,
          duration: 90,
          materials: ['gel-condutor', 'protetor-ocular', 'pomada-cicatrizante'],
          description: 'Tratamento a laser para rejuvenescimento'
        }
      ],
      materials: [],
      templates: [
        {
          id: 'evolucao-dermato',
          name: 'Evolução Dermatológica',
          type: 'evolution',
          content: 'Evolução do tratamento dermatológico em {data}',
          fields: [
            { id: 'fototipo', name: 'Fototipo', type: 'select', required: true, options: ['I', 'II', 'III', 'IV', 'V', 'VI'] },
            { id: 'manchas', name: 'Tipo de manchas', type: 'select', required: false, options: ['Melasma', 'Hiperpigmentação', 'Acne', 'Cicatrizes'] },
            { id: 'parametros', name: 'Parâmetros do equipamento', type: 'text', required: false },
            { id: 'reacao', name: 'Reação pós-procedimento', type: 'textarea', required: false }
          ]
        }
      ]
    },
    {
      id: 'cirurgias',
      name: 'Pequenas Cirurgias',
      enabled: false,
      procedures: [
        {
          id: 'biopsia',
          name: 'Biópsia de Pele',
          price: 300.00,
          duration: 30,
          materials: ['bisturi', 'anestesico', 'sutura', 'curativo'],
          description: 'Biópsia para análise histopatológica'
        },
        {
          id: 'excisao-lesao',
          name: 'Excisão de Lesão',
          price: 500.00,
          duration: 60,
          materials: ['bisturi', 'anestesico', 'sutura', 'curativo', 'eletrocoagulador'],
          description: 'Remoção cirúrgica de lesões cutâneas'
        }
      ],
      materials: [],
      templates: [
        {
          id: 'evolucao-cirurgia',
          name: 'Evolução Cirúrgica',
          type: 'evolution',
          content: 'Evolução pós-cirúrgica em {data}',
          fields: [
            { id: 'tipo-cirurgia', name: 'Tipo de cirurgia', type: 'text', required: true },
            { id: 'anestesia', name: 'Tipo de anestesia', type: 'select', required: true, options: ['Local', 'Regional', 'Geral'] },
            { id: 'suturas', name: 'Tipo de sutura', type: 'text', required: false },
            { id: 'pos-operatorio', name: 'Cuidados pós-operatórios', type: 'textarea', required: true }
          ]
        }
      ]
    }
  ],
  userRoles: [
    {
      id: 'superadmin',
      name: 'Super Administrador',
      permissions: [
        { module: '*', actions: ['create', 'read', 'update', 'delete'] }
      ],
      canAccessSpecialties: ['curativos', 'dermatologia', 'cirurgias']
    },
    {
      id: 'gestor',
      name: 'Gestor da Clínica',
      permissions: [
        { module: 'patients', actions: ['create', 'read', 'update'] },
        { module: 'appointments', actions: ['create', 'read', 'update', 'delete'] },
        { module: 'reports', actions: ['read'] },
        { module: 'team', actions: ['read', 'update'] },
        { module: 'inventory', actions: ['read', 'update'] }
      ],
      canAccessSpecialties: ['curativos', 'dermatologia', 'cirurgias']
    },
    {
      id: 'profissional',
      name: 'Profissional',
      permissions: [
        { module: 'patients', actions: ['create', 'read', 'update'] },
        { module: 'appointments', actions: ['read', 'update'] },
        { module: 'evolutions', actions: ['create', 'read', 'update'] },
        { module: 'inventory', actions: ['read'] }
      ],
      canAccessSpecialties: ['curativos']
    },
    {
      id: 'financeiro',
      name: 'Financeiro',
      permissions: [
        { module: 'payments', actions: ['create', 'read', 'update'] },
        { module: 'reports', actions: ['read'] },
        { module: 'patients', actions: ['read'] }
      ],
      canAccessSpecialties: []
    }
  ],
  generalSettings: {
    multiClinic: false,
    multiUnit: false,
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    workingHours: {
      start: '08:00',
      end: '18:00',
      days: [1, 2, 3, 4, 5] // Segunda a sexta
    }
  }
};

interface ClinicConfigProviderProps {
  children: React.ReactNode;
}

export const ClinicConfigProvider: React.FC<ClinicConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<ClinicConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar configuração do localStorage ou usar padrão
    const loadConfig = () => {
      try {
        const savedConfig = localStorage.getItem('clinicConfig');
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
        } else {
          setConfig(defaultConfig);
          localStorage.setItem('clinicConfig', JSON.stringify(defaultConfig));
        }
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
        setConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const saveConfig = (newConfig: ClinicConfig) => {
    setConfig(newConfig);
    localStorage.setItem('clinicConfig', JSON.stringify(newConfig));
  };

  const updateSpecialtyConfig = async (specialtyId: string, updates: Partial<SpecialtyConfig>) => {
    if (!config) return;

    const newConfig = {
      ...config,
      specialties: config.specialties.map(specialty =>
        specialty.id === specialtyId ? { ...specialty, ...updates } : specialty
      )
    };

    saveConfig(newConfig);
  };

  const updateUserRole = async (roleId: string, updates: Partial<UserRole>) => {
    if (!config) return;

    const newConfig = {
      ...config,
      userRoles: config.userRoles.map(role =>
        role.id === roleId ? { ...role, ...updates } : role
      )
    };

    saveConfig(newConfig);
  };

  const updateGeneralSettings = async (updates: Partial<GeneralSettings>) => {
    if (!config) return;

    const newConfig = {
      ...config,
      generalSettings: { ...config.generalSettings, ...updates }
    };

    saveConfig(newConfig);
  };

  const enableSpecialty = async (specialtyId: string) => {
    await updateSpecialtyConfig(specialtyId, { enabled: true });
  };

  const disableSpecialty = async (specialtyId: string) => {
    await updateSpecialtyConfig(specialtyId, { enabled: false });
  };

  const addProcedure = async (specialtyId: string, procedure: Omit<ProcedureConfig, 'id'>) => {
    if (!config) return;

    const newProcedure: ProcedureConfig = {
      ...procedure,
      id: `${specialtyId}-${Date.now()}`
    };

    const specialty = config.specialties.find(s => s.id === specialtyId);
    if (!specialty) return;

    await updateSpecialtyConfig(specialtyId, {
      procedures: [...specialty.procedures, newProcedure]
    });
  };

  const updateProcedure = async (specialtyId: string, procedureId: string, updates: Partial<ProcedureConfig>) => {
    if (!config) return;

    const specialty = config.specialties.find(s => s.id === specialtyId);
    if (!specialty) return;

    const updatedProcedures = specialty.procedures.map(procedure =>
      procedure.id === procedureId ? { ...procedure, ...updates } : procedure
    );

    await updateSpecialtyConfig(specialtyId, { procedures: updatedProcedures });
  };

  const deleteProcedure = async (specialtyId: string, procedureId: string) => {
    if (!config) return;

    const specialty = config.specialties.find(s => s.id === specialtyId);
    if (!specialty) return;

    const updatedProcedures = specialty.procedures.filter(procedure => procedure.id !== procedureId);

    await updateSpecialtyConfig(specialtyId, { procedures: updatedProcedures });
  };

  const value: ClinicConfigContextType = {
    config,
    loading,
    updateSpecialtyConfig,
    updateUserRole,
    updateGeneralSettings,
    enableSpecialty,
    disableSpecialty,
    addProcedure,
    updateProcedure,
    deleteProcedure
  };

  return (
    <ClinicConfigContext.Provider value={value}>
      {children}
    </ClinicConfigContext.Provider>
  );
};
