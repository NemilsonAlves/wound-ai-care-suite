import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { PatientService } from '../services/patientService';
import { Patient } from '@/types/patient';
import { editPatientSchema, formatCPF, formatPhone, formatZipCode, SPECIALTIES, STATES } from '@/lib/validations';

type EditPatientFormData = z.infer<typeof editPatientSchema>;

export default function EditPatient() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema),
  });

  const watchedBirthDate = watch('birth_date');

  // Carregar dados do paciente
  useEffect(() => {
    const loadPatient = async () => {
      if (!id) {
        toast({
          title: 'Erro',
          description: 'ID do paciente não fornecido',
          variant: 'destructive',
        });
        navigate('/pacientes');
        return;
      }

      try {
        setIsLoading(true);
        const patientData = await PatientService.getById(id);
        
        if (!patientData) {
          toast({
            title: 'Erro',
            description: 'Paciente não encontrado',
            variant: 'destructive',
          });
          navigate('/pacientes');
          return;
        }

        setPatient(patientData);

        // Preencher o formulário com os dados do paciente
        setValue('full_name', patientData.full_name);
        setValue('cpf', patientData.cpf);
        setValue('birth_date', new Date(patientData.birth_date));
        setValue('gender', patientData.gender as 'masculino' | 'feminino' | 'outro');
        setValue('phone', patientData.phone);
        setValue('email', patientData.email || '');
        setValue('address', patientData.address);
        setValue('city', patientData.city);
        setValue('state', patientData.state);
        setValue('zip_code', patientData.zip_code);
        setValue('specialty', patientData.specialty);
        setValue('emergency_contact_name', patientData.emergency_contact_name || '');
        setValue('emergency_contact_phone', patientData.emergency_contact_phone || '');
        setValue('medical_history', patientData.medical_history || '');
        setValue('allergies', patientData.allergies || '');
        setValue('medications', patientData.medications || '');
        setValue('consent_data_processing', patientData.consent_data_processing || false);
        setValue('consent_whatsapp', patientData.consent_whatsapp || false);
        setValue('consent_email', patientData.consent_email || false);

      } catch (error) {
        console.error('Erro ao carregar paciente:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar dados do paciente',
          variant: 'destructive',
        });
        navigate('/pacientes');
      } finally {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [id, navigate, setValue]);

  const onSubmit = async (data: EditPatientFormData) => {
    if (!id) return;

    try {
      setIsSubmitting(true);

      // Verificar se o CPF foi alterado e se já existe
      if (patient && data.cpf !== patient.cpf) {
        const cpfExists = await PatientService.checkCpfExists(data.cpf);
        if (cpfExists) {
          toast({
            title: 'Erro',
            description: 'CPF já cadastrado para outro paciente',
            variant: 'destructive',
          });
          return;
        }
      }

      const updatedPatient = await PatientService.update(id, {
        ...data,
        birth_date: format(data.birth_date, 'yyyy-MM-dd'),
        email: data.email || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        medical_history: data.medical_history || null,
        allergies: data.allergies || null,
        medications: data.medications || null,
      });

      toast({
        title: 'Sucesso',
        description: 'Paciente atualizado com sucesso!',
      });

      navigate(`/pacientes/${id}`);
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar paciente. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Paciente não encontrado</h2>
          <Button onClick={() => navigate('/pacientes')} className="mt-4">
            Voltar para Pacientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <PageHeader
        title="Editar Paciente"
        description={`Editando dados de ${patient.full_name}`}
        action={
          <Button
            variant="outline"
            onClick={() => navigate('/pacientes')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>
              Informações básicas do paciente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  placeholder="Digite o nome completo"
                />
                {errors.full_name && (
                  <p className="text-sm text-red-600">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  {...register('cpf')}
                  placeholder="000.000.000-00"
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value);
                    setValue('cpf', formatted);
                  }}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-600">{errors.cpf.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Data de Nascimento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watchedBirthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedBirthDate ? (
                        format(watchedBirthDate, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watchedBirthDate}
                      onSelect={(date) => setValue('birth_date', date!)}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                {errors.birth_date && (
                  <p className="text-sm text-red-600">{errors.birth_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gênero *</Label>
                <Select onValueChange={(value) => setValue('gender', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
            <CardDescription>
              Dados para comunicação com o paciente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(00) 00000-0000"
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setValue('phone', formatted);
                  }}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>
              Endereço residencial do paciente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo *</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Rua, número, complemento"
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Nome da cidade"
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Select onValueChange={(value) => setValue('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP *</Label>
                <Input
                  id="zip_code"
                  {...register('zip_code')}
                  placeholder="00000-000"
                  onChange={(e) => {
                    const formatted = formatZipCode(e.target.value);
                    setValue('zip_code', formatted);
                  }}
                />
                {errors.zip_code && (
                  <p className="text-sm text-red-600">{errors.zip_code.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Médicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Médicas</CardTitle>
            <CardDescription>
              Dados médicos e especialidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade *</Label>
              <Select onValueChange={(value) => setValue('specialty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((specialty) => (
                    <SelectItem key={specialty} value={specialty.toLowerCase()}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.specialty && (
                <p className="text-sm text-red-600">{errors.specialty.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Contato de Emergência</Label>
                <Input
                  id="emergency_contact_name"
                  {...register('emergency_contact_name')}
                  placeholder="Nome do contato"
                />
                {errors.emergency_contact_name && (
                  <p className="text-sm text-red-600">{errors.emergency_contact_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Telefone do Contato</Label>
                <Input
                  id="emergency_contact_phone"
                  {...register('emergency_contact_phone')}
                  placeholder="(00) 00000-0000"
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    setValue('emergency_contact_phone', formatted);
                  }}
                />
                {errors.emergency_contact_phone && (
                  <p className="text-sm text-red-600">{errors.emergency_contact_phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_history">Histórico Médico</Label>
              <Textarea
                id="medical_history"
                {...register('medical_history')}
                placeholder="Descreva o histórico médico relevante"
                rows={3}
              />
              {errors.medical_history && (
                <p className="text-sm text-red-600">{errors.medical_history.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  id="allergies"
                  {...register('allergies')}
                  placeholder="Liste alergias conhecidas"
                  rows={2}
                />
                {errors.allergies && (
                  <p className="text-sm text-red-600">{errors.allergies.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Medicamentos em Uso</Label>
                <Textarea
                  id="medications"
                  {...register('medications')}
                  placeholder="Liste medicamentos atuais"
                  rows={2}
                />
                {errors.medications && (
                  <p className="text-sm text-red-600">{errors.medications.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consentimentos */}
        <Card>
          <CardHeader>
            <CardTitle>Consentimentos</CardTitle>
            <CardDescription>
              Autorizações do paciente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent_data_processing"
                {...register('consent_data_processing')}
                onCheckedChange={(checked) => setValue('consent_data_processing', !!checked)}
              />
              <Label htmlFor="consent_data_processing" className="text-sm">
                Autorizo o processamento dos meus dados pessoais conforme a LGPD
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent_whatsapp"
                {...register('consent_whatsapp')}
                onCheckedChange={(checked) => setValue('consent_whatsapp', !!checked)}
              />
              <Label htmlFor="consent_whatsapp" className="text-sm">
                Autorizo o envio de mensagens via WhatsApp
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent_email"
                {...register('consent_email')}
                onCheckedChange={(checked) => setValue('consent_email', !!checked)}
              />
              <Label htmlFor="consent_email" className="text-sm">
                Autorizo o envio de comunicações por email
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/pacientes/${id}`)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
