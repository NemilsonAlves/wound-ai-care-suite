import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { PatientForm } from './PatientForm';
import { PatientService } from '../../services/patientService';
import { formatDate, formatPhone, formatCPF, calculateAge } from '@/lib/utils';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Shield,
  FileText,
  Edit,
  Trash2,
  Plus,
  Activity,
  Camera,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

interface PatientProfileProps {
  patientId: string;
  onClose?: () => void;
}

export function PatientProfile({ patientId, onClose }: PatientProfileProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => PatientService.getPatientById(patientId),
  });

  const deleteMutation = useMutation({
    mutationFn: PatientService.deletePatient,
    onSuccess: () => {
      toast.success('Paciente removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      onClose?.();
    },
    onError: () => {
      toast.error('Erro ao remover paciente');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Erro ao carregar dados do paciente</p>
      </div>
    );
  }

  const age = calculateAge(new Date(patient.birth_date));
  const initials = patient.full_name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleDelete = () => {
    deleteMutation.mutate(patientId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={patient.avatar_url} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{patient.full_name}</h1>
            <p className="text-muted-foreground">
              {age} anos • {patient.specialty}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <StatusBadge status={patient.status} />
              <Badge variant="outline">{patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : 'Outro'}</Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Paciente</DialogTitle>
              </DialogHeader>
              <PatientForm
                initialData={patient}
                isEditing
                patientId={patientId}
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
                }}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Remover
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="medical">Informações Médicas</TabsTrigger>
          <TabsTrigger value="assessments">Avaliações</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Informações de Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patient.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatPhone(patient.phone)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatCPF(patient.cpf)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(new Date(patient.birth_date))}</span>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.address ? (
                  <div className="space-y-1 text-sm">
                    <p>{patient.address}</p>
                    {patient.city && patient.state && (
                      <p>{patient.city}, {patient.state}</p>
                    )}
                    {patient.zip_code && <p>CEP: {patient.zip_code}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Endereço não informado</p>
                )}
              </CardContent>
            </Card>

            {/* Contato de Emergência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Contato de Emergência
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.emergency_contact_name ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>{patient.emergency_contact_name}</strong></p>
                    {patient.emergency_contact_phone && (
                      <p>{formatPhone(patient.emergency_contact_phone)}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Contato de emergência não informado</p>
                )}
              </CardContent>
            </Card>

            {/* Convênio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Convênio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.insurance_provider ? (
                  <div className="space-y-1 text-sm">
                    <p><strong>{patient.insurance_provider}</strong></p>
                    {patient.insurance_number && (
                      <p>Carteirinha: {patient.insurance_number}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Convênio não informado</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Histórico Médico */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico Médico</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medical_history ? (
                  <p className="text-sm whitespace-pre-wrap">{patient.medical_history}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum histórico médico registrado</p>
                )}
              </CardContent>
            </Card>

            {/* Alergias */}
            <Card>
              <CardHeader>
                <CardTitle>Alergias</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.allergies ? (
                  <p className="text-sm whitespace-pre-wrap">{patient.allergies}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma alergia registrada</p>
                )}
              </CardContent>
            </Card>

            {/* Medicações */}
            <Card>
              <CardHeader>
                <CardTitle>Medicações em Uso</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medications ? (
                  <p className="text-sm whitespace-pre-wrap">{patient.medications}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma medicação registrada</p>
                )}
              </CardContent>
            </Card>

            {/* Consentimentos */}
            <Card>
              <CardHeader>
                <CardTitle>Consentimentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tratamento médico</span>
                  <Badge variant={patient.consent_treatment ? "default" : "destructive"}>
                    {patient.consent_treatment ? "Autorizado" : "Não autorizado"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compartilhamento de dados</span>
                  <Badge variant={patient.consent_data_sharing ? "default" : "secondary"}>
                    {patient.consent_data_sharing ? "Autorizado" : "Não autorizado"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Comunicações de marketing</span>
                  <Badge variant={patient.consent_marketing ? "default" : "secondary"}>
                    {patient.consent_marketing ? "Autorizado" : "Não autorizado"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Avaliações
                </span>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Avaliação
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Documentos
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Adicionar Foto
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Nenhum documento anexado</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Paciente cadastrado</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(patient.created_at))}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Remoção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Tem certeza que deseja remover o paciente <strong>{patient.full_name}</strong>?</p>
            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita. Todos os dados do paciente serão permanentemente removidos.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
