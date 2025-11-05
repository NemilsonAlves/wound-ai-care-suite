import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePatientAuth } from '@/contexts/PatientAuthContextBase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PatientRouteProps {
  children: React.ReactNode;
}

const PatientRoute: React.FC<PatientRouteProps> = ({ children }) => {
  const { patient, session, loading } = usePatientAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!patient || !session) {
    // Redirecionar para login do paciente, preservando a URL de destino
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  // Verificar se a sessão não expirou
  if (session.expires_at <= Date.now()) {
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PatientRoute;
