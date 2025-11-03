import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { PatientForm } from '@/components/patients/PatientForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PatientRegister() {
  const navigate = useNavigate();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pacientes', href: '/pacientes' },
    { label: 'Novo Paciente', href: '/pacientes/novo' },
  ];

  const handleSuccess = () => {
    navigate('/pacientes');
  };

  const handleCancel = () => {
    navigate('/pacientes');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/pacientes')}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      <PageHeader
        title="Cadastrar Novo Paciente"
        description="Preencha as informações do paciente para realizar o cadastro no sistema"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-4xl">
        <PatientForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default PatientRegister;
