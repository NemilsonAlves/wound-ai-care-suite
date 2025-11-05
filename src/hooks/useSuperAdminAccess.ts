import { usePermissions } from '@/hooks/usePermissions';

export const useSuperAdminAccess = () => {
  const { isSuperAdmin, getAccessDeniedMessage } = usePermissions();

  const checkAccess = (module?: string): { hasAccess: boolean; message?: string } => {
    const hasAccess = isSuperAdmin();
    return {
      hasAccess,
      message: hasAccess ? undefined : getAccessDeniedMessage(module)
    };
  };

  return {
    isSuperAdmin: isSuperAdmin(),
    checkAccess
  };
};

