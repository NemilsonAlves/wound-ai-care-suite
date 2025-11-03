import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Calendar, 
  User, 
  Stethoscope,
  ClipboardList,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatDate } from '../lib/utils';

interface MedicalReport {
  id: string;
  title: string;
  date: string;
  doctor: string;
  specialty: string;
  type: 'consultation' | 'exam' | 'prescription' | 'surgery';
  status: 'available' | 'pending' | 'draft';
  patient: {
    name: string;
    age: number;
    gender: string;
    id: string;
  };
  content: {
    complaint: string;
    examination: string;
    diagnosis: string;
    treatment: string;
    observations: string;
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    exams?: Array<{
      name: string;
      result: string;
      reference: string;
      status: 'normal' | 'altered' | 'critical';
    }>;
  };
  attachments?: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

interface ReportViewerProps {
  report: MedicalReport;
  onClose: () => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ report, onClose }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <Stethoscope className="h-5 w-5" />;
      case 'exam': return <ClipboardList className="h-5 w-5" />;
      case 'prescription': return <FileText className="h-5 w-5" />;
      case 'surgery': return <User className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consulta';
      case 'exam': return 'Exame';
      case 'prescription': return 'Receita';
      case 'surgery': return 'Cirurgia';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExamStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'altered': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getTypeIcon(report.type)}
              <div>
                <h2 className="text-xl font-bold">{report.title}</h2>
                <p className="text-blue-100">
                  {getTypeLabel(report.type)} - {formatDate(report.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(report.status)}>
                {report.status === 'available' ? 'Disponível' : 
                 report.status === 'pending' ? 'Pendente' : 'Rascunho'}
              </Badge>
              <Button variant="secondary" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Patient Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informações do Paciente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nome</p>
                    <p className="text-lg">{report.patient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Idade</p>
                    <p className="text-lg">{report.patient.age} anos</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sexo</p>
                    <p className="text-lg">{report.patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">ID</p>
                    <p className="text-lg">{report.patient.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Doctor Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5" />
                  <span>Profissional Responsável</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Médico</p>
                    <p className="text-lg">{report.doctor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Especialidade</p>
                    <p className="text-lg">{report.specialty}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Report Content */}
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Laudo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.content.complaint && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Queixa Principal</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {report.content.complaint}
                    </p>
                  </div>
                )}

                {report.content.examination && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Exame Físico</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {report.content.examination}
                    </p>
                  </div>
                )}

                {report.content.diagnosis && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Diagnóstico</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                      {report.content.diagnosis}
                    </p>
                  </div>
                )}

                {report.content.treatment && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tratamento</h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                      {report.content.treatment}
                    </p>
                  </div>
                )}

                {report.content.observations && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {report.content.observations}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medications */}
            {report.content.medications && report.content.medications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Medicações Prescritas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.content.medications.map((medication, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">{medication.name}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Dosagem:</span> {medication.dosage}
                          </div>
                          <div>
                            <span className="font-medium">Frequência:</span> {medication.frequency}
                          </div>
                          <div>
                            <span className="font-medium">Duração:</span> {medication.duration}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exam Results */}
            {report.content.exams && report.content.exams.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultados de Exames</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {report.content.exams.map((exam, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{exam.name}</h5>
                          {getExamStatusIcon(exam.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Resultado:</span>
                            <span className="ml-2">{exam.result}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Referência:</span>
                            <span className="ml-2">{exam.reference}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {report.attachments && report.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Anexos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{attachment.name}</p>
                            <p className="text-sm text-gray-500">{attachment.type}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Gerado em {formatDate(report.date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;