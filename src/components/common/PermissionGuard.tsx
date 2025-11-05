import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  module?: string;
  action?: 'create' | 'read' | 'update' | 'delete';
  specialty?: string;
  role?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  module,
  action,
  specialty,
  role,
  fallback,
  showFallback = true
}) => {
  const permissions = usePermissions();

  // Verificar permissão de papel específico
  if (role && permissions.getUserRole() !== role && !permissions.hasFullAccess()) {
    return showFallback ? (fallback || <AccessDenied />) : null;
  }

  // Verificar permissão de especialidade
  if (specialty && !permissions.canAccessSpecialty(specialty)) {
    return showFallback ? (fallback || <AccessDenied />) : null;
  }

  // Verificar permissão de módulo e ação
  if (module && action) {
    let hasPermission = false;
    
    switch (action) {
      case 'create':
        hasPermission = permissions.canCreate(module);
        break;
      case 'read':
        hasPermission = permissions.canRead(module);
        break;
      case 'update':
        hasPermission = permissions.canUpdate(module);
        break;
      case 'delete':
        hasPermission = permissions.canDelete(module);
        break;
    }

    if (!hasPermission) {
      return showFallback ? (fallback || <AccessDenied />) : null;
    }
  }

  return <>{children}</>;
};

const AccessDenied: React.FC = () => (
  <Alert variant="destructive" className="max-w-md mx-auto">
    <ShieldX className="h-4 w-4" />
    <AlertDescription>
      Você não tem permissão para acessar este recurso.
    </AlertDescription>
  </Alert>
);
