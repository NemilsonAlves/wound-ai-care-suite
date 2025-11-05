import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Printer, User, Calendar, FileText, Shield, UserCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { PatientService } from '../../services/patientService';

interface PatientRegistrationReceiptProps {
  patient: {
    id: string;
    full_name: string;
    cpf: string;
    email?: string;
    phone: string;
    specialty: string;
    mrn?: string;
    status?: string;
    created_at?: string;
  };
  onClose?: () => void;
  onPatientActivated?: (patient: Record<string, unknown>) => void;
}

export function PatientRegistrationReceipt({ patient, onClose, onPatientActivated }: PatientRegistrationReceiptProps) {
  const [isActivating, setIsActivating] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(patient);
  
  const registrationDate = patient.created_at ? new Date(patient.created_at) : new Date();
  const registrationNumber = `WCS-${patient.id.slice(0, 8).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById('registration-receipt');
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Comprovante de Cadastro - ${patient.full_name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .receipt { max-width: 600px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; margin-bottom: 20px; }
                .content { line-height: 1.6; }
                .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleActivatePatient = async () => {
    if (currentPatient.status === 'active') {
      toast.info('Paciente já está ativo');
      return;
    }

    setIsActivating(true);
    try {
      const activatedPatient = await PatientService.activatePatient(currentPatient.id);
      setCurrentPatient({ ...currentPatient, status: 'active' });
      toast.success('Paciente ativado com sucesso!');
      
      if (onPatientActivated) {
        onPatientActivated(activatedPatient);
      }
    } catch (error) {
      console.error('Erro ao ativar paciente:', error);
      toast.error('Erro ao ativar paciente. Tente novamente.');
    } finally {
      setIsActivating(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inativo</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Não definido</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white">
        <CardHeader className="text-center border-b-2 border-blue-600 pb-6">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
            <div>
              <CardTitle className="text-2xl text-blue-600">Cadastro Realizado com Sucesso!</CardTitle>
      <p className="text-gray-600 mt-2">Central de Pele AI - Sistema de Gestão de Lesões</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6" id="registration-receipt">
          <div className="space-y-6">
            {/* Informações do Comprovante */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Comprovante de Cadastro
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Número do Registro:</span>
                  <span className="font-mono">{registrationNumber}</span>
                </div>
                {currentPatient.mrn && (
                  <div className="flex justify-between">
                    <span className="font-medium">MRN (Número Médico):</span>
                    <span className="font-mono font-semibold text-blue-700">{currentPatient.mrn}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(currentPatient.status)}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Data de Cadastro:</span>
                  <span>{format(registrationDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
              </div>
            </div>

            {/* Dados do Paciente */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Dados do Paciente
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Nome Completo:</span>
                  <span>{currentPatient.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">CPF:</span>
                  <span>{currentPatient.cpf}</span>
                </div>
                {currentPatient.email && (
                  <div className="flex justify-between">
                    <span className="font-medium">E-mail:</span>
                    <span>{currentPatient.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Telefone:</span>
                  <span>{currentPatient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Especialidade:</span>
                  <span className="capitalize">{currentPatient.specialty}</span>
                </div>
              </div>
            </div>

            {/* Informações Importantes */}
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Informações Importantes
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Guarde este comprovante para futuras consultas</li>
                <li>• Seu número de registro é único e identifica seu cadastro no sistema</li>
                <li>• Em caso de dúvidas, entre em contato com nossa equipe</li>
                <li>• Seus dados estão protegidos conforme a LGPD</li>
              </ul>
            </div>

            {/* Próximos Passos */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Próximos Passos
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Aguarde o contato da nossa equipe para agendamento</li>
                <li>• Prepare a documentação necessária para a consulta</li>
                <li>• Mantenha seus dados de contato atualizados</li>
              </ul>
            </div>
          </div>
        </CardContent>

        {/* Botões de Ação */}
        <div className="flex justify-center gap-4 p-6 border-t bg-gray-50">
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
          {currentPatient.status === 'pending' && (
            <Button 
              onClick={handleActivatePatient} 
              disabled={isActivating}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              {isActivating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
              {isActivating ? 'Ativando...' : 'Ativar Paciente'}
            </Button>
          )}
          {onClose && (
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
              Fechar
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
