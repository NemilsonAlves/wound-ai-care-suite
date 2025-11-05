import { useAuth } from '@/contexts/AuthContextBase';
import { useClinicConfig } from '@/contexts/ClinicConfigContextBase';
import { useMemo } from 'react';
import { 
  SUPERADMIN_ONLY_MODULES, 
  isSuperAdminOnlyModule, 
  canAccessModule,
  ACCESS_DENIED_MESSAGES,
  CRITICAL_PERMISSIONS
} from '@/constants/permissions';

export interface UserPermissions {
  canCreate: (module: string) => boolean;
  canRead: (module: string) => boolean;
  canUpdate: (module: string) => boolean;
  canDelete: (module: string) => boolean;
  canAccessSpecialty: (specialtyId: string) => boolean;
  canAccessModule: (module: string) => boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  hasFullAccess: () => boolean;
  getUserRole: () => string | null;
  getAccessibleSpecialties: () => string[];
  getAccessDeniedMessage: (module?: string) => string;
  hasCriticalPermission: (permission: string) => boolean;
}

export const usePermissions = (): UserPermissions => {
  const { user } = useAuth();
  const { config } = useClinicConfig();

  const userRole = useMemo(() => {
    if (!user || !config) return null;
    
    // Buscar o papel do usuário baseado no email ou ID
    // Por enquanto, vamos usar uma lógica simples baseada no email
    if (user.email?.includes('admin')) return 'superadmin';
    if (user.email?.includes('gestor')) return 'gestor';
    if (user.email?.includes('financeiro')) return 'financeiro';
    return 'profissional'; // padrão
  }, [user, config]);

  const roleConfig = useMemo(() => {
    if (!config || !userRole) return null;
    return config.userRoles.find(role => role.id === userRole);
  }, [config, userRole]);

  const canPerformAction = (module: string, action: string): boolean => {
    if (!roleConfig) return false;

    // Verificar se é um módulo exclusivo do SuperAdmin
    if (isSuperAdminOnlyModule(module) && userRole !== 'superadmin') {
      return false;
    }

    // SuperAdmin tem acesso total
    if (userRole === 'superadmin') return true;

    // Verificar permissões específicas
    const permission = roleConfig.permissions.find(p => p.module === module || p.module === '*');
    return permission ? permission.actions.includes(action) : false;
  };

  const canCreate = (module: string): boolean => canPerformAction(module, 'create');
  const canRead = (module: string): boolean => canPerformAction(module, 'read');
  const canUpdate = (module: string): boolean => canPerformAction(module, 'update');
  const canDelete = (module: string): boolean => canPerformAction(module, 'delete');

  const canAccessModulePermission = (module: string): boolean => {
    if (!userRole) return false;
    
    // Verificar se é um módulo exclusivo do SuperAdmin
    if (isSuperAdminOnlyModule(module)) {
      return userRole === 'superadmin';
    }

    // Usar a função das constantes para verificar acesso
    return canAccessModule(userRole, module);
  };

  const canAccessSpecialty = (specialtyId: string): boolean => {
    if (!roleConfig) return false;
    if (userRole === 'superadmin') return true;
    return roleConfig.canAccessSpecialties.includes(specialtyId);
  };

  const isSuperAdmin = (): boolean => {
    return userRole === 'superadmin';
  };

  const isAdmin = (): boolean => {
    return userRole === 'superadmin' || userRole === 'admin';
  };

  const hasFullAccess = (): boolean => {
    return userRole === 'superadmin';
  };

  const getUserRole = (): string | null => {
    return userRole;
  };

  const getAccessibleSpecialties = (): string[] => {
    if (!roleConfig) return [];
    if (userRole === 'superadmin' && config) {
      return config.specialties.map(s => s.id);
    }
    return roleConfig.canAccessSpecialties;
  };

  const getAccessDeniedMessage = (module?: string): string => {
    if (module && isSuperAdminOnlyModule(module)) {
      return ACCESS_DENIED_MESSAGES.SUPERADMIN_ONLY;
    }
    return ACCESS_DENIED_MESSAGES.INSUFFICIENT_PERMISSIONS;
  };

  const hasCriticalPermission = (permission: string): boolean => {
    if (userRole !== 'superadmin') return false;
  return (Object.values(CRITICAL_PERMISSIONS) as string[]).includes(permission as string);
  };

  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canAccessSpecialty,
    canAccessModule: canAccessModulePermission,
    isSuperAdmin,
    isAdmin,
    hasFullAccess,
    getUserRole,
    getAccessibleSpecialties,
    getAccessDeniedMessage,
    hasCriticalPermission
  };
};
