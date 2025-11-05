import { usePermissions } from '@/hooks/usePermissions';

export const usePermissionCheck = () => {
  const permissions = usePermissions();

  const checkPermission = (
    module?: string,
    action?: 'create' | 'read' | 'update' | 'delete',
    specialty?: string,
    role?: string
  ): boolean => {
    if (role && permissions.getUserRole() !== role && !permissions.hasFullAccess()) {
      return false;
    }

    if (specialty && !permissions.canAccessSpecialty(specialty)) {
      return false;
    }

    if (module && action) {
      switch (action) {
        case 'create':
          return permissions.canCreate(module);
        case 'read':
          return permissions.canRead(module);
        case 'update':
          return permissions.canUpdate(module);
        case 'delete':
          return permissions.canDelete(module);
      }
    }

    return true;
  };

  return { checkPermission, ...permissions };
};

