import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuperAdminGuardProps {
  children: React.ReactNode;
  module?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  redirectTo?: string;
}

/**
 * Componente que protege rotas e funcionalidades exclusivas do SuperAdmin
 * Exibe uma mensagem de acesso negado ou um fallback personalizado
 */
export const SuperAdminGuard: React.FC<SuperAdminGuardProps> = ({
  children,
  module,
  fallback,
  showFallback = true,
  redirectTo = '/dashboard'
}) => {
  const { isSuperAdmin, getAccessDeniedMessage } = usePermissions();
  const navigate = useNavigate();

  // Se o usuário é SuperAdmin, renderiza o conteúdo
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // Se não deve mostrar fallback, retorna null
  if (!showFallback) {
    return null;
  }

  // Se há um fallback personalizado, usa ele
  if (fallback) {
    return <>{fallback}</>;
  }

  // Renderiza a mensagem padrão de acesso negado
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md border-red-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800 flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            Acesso Restrito
          </CardTitle>
          <CardDescription className="text-red-600">
            Funcionalidade Exclusiva para Super Administradores
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">
                  {getAccessDeniedMessage(module)}
                </p>
                <p className="text-red-600">
                  Esta funcionalidade requer privilégios de Super Administrador para garantir a segurança e integridade do sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-medium">Para acessar esta funcionalidade:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Entre em contato com um Super Administrador</li>
              <li>Solicite as permissões necessárias</li>
              <li>Aguarde a aprovação e configuração do acesso</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button 
              onClick={() => navigate(redirectTo)} 
              className="flex-1"
            >
              Ir para Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Hook para verificar se o usuário pode acessar funcionalidades de SuperAdmin
 */
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

/**
 * Componente inline para proteger elementos específicos
 */
interface SuperAdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  module?: string;
}

export const SuperAdminOnly: React.FC<SuperAdminOnlyProps> = ({
  children,
  fallback = null,
  module
}) => {
  const { isSuperAdmin } = usePermissions();

  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default SuperAdminGuard;