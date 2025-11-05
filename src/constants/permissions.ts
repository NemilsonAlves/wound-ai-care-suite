// Constantes de permissões do sistema
// Define quais módulos são exclusivos para cada tipo de usuário

export const SUPERADMIN_ONLY_MODULES = [
  // 🏗️ Configurações de Sistema Críticas
  'system.config',
  'system.database',
  'system.security',
  'system.backup',
  'system.infrastructure',
  'system.environment',
  
  // 👥 Gerenciamento Total de Usuários
  'users.roles.create',
  'users.roles.delete',
  'users.permissions.global',
  'users.superadmin.manage',
  'users.audit.full',
  
  // 🔧 Configurações de Negócio Avançadas
  'business.specialties.toggle',
  'business.templates.global',
  'business.multiclinic',
  'business.integrations.config',
  
  // 📊 Auditoria e Monitoramento Completo
  'audit.system.logs',
  'audit.security.reports',
  'audit.system.metrics',
  'audit.integrity.monitor',
  
  // 💰 Configurações Financeiras Críticas
  'financial.gateways.config',
  'financial.policies.global',
  'financial.fiscal.config',
  'financial.reports.consolidated',
  
  // 🔌 Integrações e APIs
  'integrations.whatsapp.config',
  'integrations.ai.config',
  'integrations.apis.external',
  'integrations.webhooks.config',
  'integrations.sync.data'
] as const;

export const ADMIN_MODULES = [
  // Módulos que admins podem acessar (mas não superadmin exclusivos)
  'reports.operational',
  'team.management',
  'procedures.basic.config',
  'inventory.management',
  'patients.management',
  'appointments.management'
] as const;

export const MANAGER_MODULES = [
  // Módulos específicos para gestores
  'reports.operational',
  'team.view',
  'procedures.basic.config',
  'inventory.view',
  'patients.management',
  'appointments.management'
] as const;

export const PROFESSIONAL_MODULES = [
  // Módulos para profissionais
  'patients.care',
  'appointments.own',
  'evolutions.create',
  'inventory.view',
  'reports.own'
] as const;

// Mapeamento de roles para módulos permitidos
export const ROLE_MODULE_MAPPING = {
  superadmin: [...SUPERADMIN_ONLY_MODULES, ...ADMIN_MODULES, ...MANAGER_MODULES, ...PROFESSIONAL_MODULES],
  admin: [...ADMIN_MODULES, ...MANAGER_MODULES, ...PROFESSIONAL_MODULES],
  gestor: [...MANAGER_MODULES, ...PROFESSIONAL_MODULES],
  profissional: [...PROFESSIONAL_MODULES],
  financeiro: ['financial.reports.basic', 'patients.view', 'payments.management']
} as const;

// Função para verificar se um módulo é exclusivo do SuperAdmin
export const isSuperAdminOnlyModule = (module: string): boolean => {
  return (SUPERADMIN_ONLY_MODULES as string[]).includes(module as string);
};

// Função para verificar se um usuário pode acessar um módulo
export const canAccessModule = (userRole: string, module: string): boolean => {
  const allowedModules = ROLE_MODULE_MAPPING[userRole as keyof typeof ROLE_MODULE_MAPPING] || [];
  return (allowedModules as string[]).includes(module as string);
};

// Definições de permissões críticas
export const CRITICAL_PERMISSIONS = {
  SYSTEM_CONFIG: 'system.config',
  DATABASE_ADMIN: 'system.database',
  SECURITY_POLICIES: 'system.security',
  BACKUP_ADMIN: 'system.backup',
  USER_ROLES_MANAGE: 'users.roles.manage',
  AUDIT_FULL: 'audit.full',
  INTEGRATIONS_CONFIG: 'integrations.config',
  FINANCIAL_CONFIG: 'financial.config'
} as const;

// Mensagens de erro para acesso negado
export const ACCESS_DENIED_MESSAGES = {
  SUPERADMIN_ONLY: 'Esta funcionalidade é exclusiva para Super Administradores.',
  INSUFFICIENT_PERMISSIONS: 'Você não possui permissões suficientes para acessar esta funcionalidade.',
  ROLE_REQUIRED: (role: string) => `Esta funcionalidade requer o papel de ${role}.`,
  MODULE_RESTRICTED: (module: string) => `Acesso ao módulo ${module} é restrito.`
} as const;
