import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PatientDuplicationService } from '@/services/patientDuplicationService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { Patient } from '@/types/patient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DateInput } from '@/components/ui/date-input';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Info } from 'lucide-react';
// Removido import de date-fns nÃ£o utilizado
// Removed unused locale import
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PatientService } from '../../services/patientService';
import { PatientRegistrationReceipt } from './PatientRegistrationReceipt';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

import { sanitizePatientData as normalizeDefaults } from '@/lib/validations';
import { supabase } from '@/lib/supabase';

// ValidaÃ§Ãµes avanÃ§adas com mensagens personalizadas
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
const cepRegex = /^\d{5}-\d{3}$/;

// FunÃ§Ã£o para validar CPF
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dÃ­gitos sÃ£o iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // ValidaÃ§Ã£o dos dÃ­gitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// Schema de validaÃ§Ã£o aprimorado
const patientSchema = z.object({
  full_name: z.string({ required_error: 'Nome completo Ã© obrigatÃ³rio' })
    .min(1, 'Nome completo Ã© obrigatÃ³rio')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[\p{L}\s]+$/u, 'Nome deve conter apenas letras e espaços'),
  email: z.string()
    .email('Email invÃ¡lido')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .regex(phoneRegex, 'Telefone deve estar no formato (11) 99999-9999')
    .min(1, 'Telefone Ã© obrigatÃ³rio'),
  cpf: z.string()
    .min(1, 'CPF Ã© obrigatÃ³rio')
    .regex(cpfRegex, 'CPF deve estar no formato 000.000.000-00')
    .refine(validateCPF, 'CPF invÃ¡lido'),
  birth_date: z.date({ 
    required_error: 'Data de nascimento Ã© obrigatÃ³ria',
    invalid_type_error: 'Data invÃ¡lida'
  }).refine((date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    return age >= 0 && age <= 120;
  }, 'Idade deve estar entre 0 e 120 anos'),
  gender: z.enum(['masculino', 'feminino', 'outro'], {
    required_error: 'Gênero Ã© obrigatÃ³rio'
  }),
  address: z.string().max(200, 'EndereÃ§o muito longo').optional(),
  city: z.string().max(100, 'Nome da cidade muito longo').optional(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  zip_code: z.string()
    .regex(cepRegex, 'CEP deve estar no formato 00000-000')
    .optional()
    .or(z.literal('')),
  emergency_contact_name: z.string().max(100, 'Nome muito longo').optional(),
  emergency_contact_phone: z.string()
    .regex(phoneRegex, 'Telefone deve estar no formato (11) 99999-9999')
    .optional()
    .or(z.literal('')),
  medical_history: z.string().max(1000, 'Histórico mÃ©dico muito longo').optional(),
  allergies: z.string().max(500, 'Lista de alergias muito longa').optional(),
  medications: z.string().max(500, 'Lista de medicamentos muito longa').optional(),
  specialty: z.enum([
    'Curativos', 
    'Dermatologia', 
    'Cirurgia Plástica', 
    'Enfermagem', 
    'Fisioterapia', 
    'Nutrição', 
    'Psicologia', 
    'Clínica Geral'
  ], {
    required_error: 'Especialidade Ã© obrigatÃ³ria'
  }),
  insurance_provider: z.string().max(100, 'Nome do convÃªnio muito longo').optional(),
  insurance_number: z.string().max(50, 'NÃºmero da carteirinha muito longo').optional(),
  consent_data_processing: z.boolean().refine(val => val === true, 'Consentimento para processamento de dados Ã© obrigatÃ³rio'),
  consent_whatsapp: z.boolean(),
  consent_email: z.boolean(),
  // Campos especÃ­ficos por especialidade com validaÃ§Ãµes condicionais
  specialty_data: z.object({
    curativos: z.object({
      area: z.string().max(50).optional(),
      profundidade: z.enum(['superficial', 'parcial', 'total']).optional(),
      necrose: z.boolean().optional(),
      dor_nivel: z.number().min(0).max(10).optional(),
      sinais_infeccao: z.boolean().optional(),
      observacoes: z.string().max(500).optional(),
    }).optional(),
    dermatologia: z.object({
      procedimento: z.string().max(100).optional(),
      parametros: z.string().max(100).optional(),
      fototipo: z.number().min(1).max(6).optional(),
      manchas: z.string().max(300).optional(),
      acne_grau: z.number().min(1).max(4).optional(),
      observacoes: z.string().max(500).optional(),
    }).optional(),
    cirurgias: z.object({
      tipo: z.string().max(100).optional(),
      anestesia: z.enum(['local', 'sedacao', 'geral', 'raqui']).optional(),
      insumos: z.array(z.string()).optional(),
      suturas: z.string().max(100).optional(),
      pos_operatorio: z.string().max(500).optional(),
      observacoes: z.string().max(500).optional(),
    }).optional(),
  }).optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<PatientFormData>;
  isEditing?: boolean;
  patientId?: string;
}

// FunÃ§Ãµes de mÃ¡scara
const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskPhone = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const maskCEP = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

const specialties = [
  'Curativos',
  'Dermatologia',
  'Cirurgia Plástica',
  'Enfermagem',
  'Fisioterapia',
  'Nutrição',
  'Psicologia',
  'Clínica Geral',
];

const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function PatientForm({ onSuccess, onCancel, initialData, isEditing = false, patientId }: PatientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [cpfValidation, setCpfValidation] = useState<'valid' | 'invalid' | 'checking' | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    file: File;
  }>>([]);
  const [, setIsUploadingDocument] = useState(false);
  const [dupDialogOpen, setDupDialogOpen] = useState(false);
  const [dupCandidates, setDupCandidates] = useState<Patient[]>([]);
  const [selectedMergeId, setSelectedMergeId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    setValue,
    getValues,
    watch,
    control,
    trigger,
    
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    mode: 'onChange',
    defaultValues: (() => {
      const normalized = initialData ? (normalizeDefaults(initialData) as Partial<PatientFormData>) : {};
      return {
        consent_data_processing: false,
        consent_whatsapp: false,
        consent_email: false,
        ...normalized,
      };
    })(),
  });

  const birthDate = watch('birth_date');
  const selectedSpecialty = watch('specialty');
  const cpfValue = watch('cpf');

  // ValidaÃ§Ã£o de CPF em tempo real
  useEffect(() => {
    if (cpfValue && cpfValue.length === 14) {
      setCpfValidation('checking');
      const timer = setTimeout(() => {
        const cpfIsValid = validateCPF(cpfValue);
        setCpfValidation(cpfIsValid ? 'valid' : 'invalid');
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setCpfValidation(null);
    }
  }, [cpfValue]);

  // Calcular idade
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  // Buscar CEP
  const fetchAddressByCEP = async (cep: string) => {
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      if (cleanCEP.length === 8) {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          const currentAddress = (getValues('address') || '').trim();
          const currentCity = (getValues('city') || '').trim();
          const currentState = (getValues('state') || '').trim();

          if (!currentAddress) setValue('address', data.logradouro);
          if (!currentCity) setValue('city', data.localidade);
          if (!currentState) setValue('state', data.uf);
          toast.success('EndereÃ§o preenchido automaticamente!');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  // Gerenciar upload de documentos
  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de arquivo nÃ£o permitido: ${file.name}`, {
          description: 'Apenas PDF, JPG e PNG sÃ£o aceitos.'
        });
        return;
      }

      // Validar tamanho (mÃ¡ximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Arquivo muito grande: ${file.name}`, {
          description: 'Tamanho mÃ¡ximo permitido: 5MB'
        });
        return;
      }

      const newDocument = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        file
      };

      setUploadedDocuments(prev => [...prev, newDocument]);
      toast.success(`Documento adicionado: ${file.name}`);
    });

    // Limpar input
    event.target.value = '';
  };

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast.success('Documento removido');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    try {
      // Converter birth_date de Date para string no formato ISO
      const formattedData = {
        ...data,
        birth_date: data.birth_date.toISOString().split('T')[0],
      };

      let result;
      if (isEditing && patientId) {
        result = await PatientService.updatePatient(patientId, formattedData);
        toast.success('Paciente atualizado com sucesso!', {
          description: `${data.full_name} foi atualizado no sistema.`,
          duration: 5000,
        });
      } else {
        // Checagem de duplicidade antes de criar
  const similar = await PatientDuplicationService.findSimilarPatients(formattedData as Record<string, unknown>);
        if (similar.length > 0) {
          setDupCandidates(similar);
          setDupDialogOpen(true);
          setIsLoading(false);
          return; // aguarda aÃ§Ã£o do usuÃ¡rio no diÃ¡logo
        }
        result = await PatientService.create(formattedData);
        
        // Processar documentos uploadados (Supabase Storage)
        if (uploadedDocuments.length > 0) {
          setIsUploadingDocument(true);
          try {
            const bucket = import.meta.env.VITE_PATIENT_DOC_BUCKET || 'patient-documents';
            for (const doc of uploadedDocuments) {
              try {
                const timestamp = Date.now();
                const safeName = doc.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
                const filePath = `${result.id}/${timestamp}_${safeName}`;

                const { error: uploadError } = await supabase.storage
                  .from(bucket)
                  .upload(filePath, doc.file);

                if (uploadError) throw uploadError;

                const { data: publicData } = supabase.storage
                  .from(bucket)
                  .getPublicUrl(filePath);

                const publicUrl = publicData.publicUrl;

                await PatientService.addDocument(result.id, {
                  name: doc.name,
                  type: doc.type,
                  url: publicUrl,
                  size: doc.size
                });
              } catch (singleDocError) {
                console.warn('Erro ao enviar/anexar documento:', singleDocError);
                toast.warning(`Erro ao anexar: ${doc.name}`);
              }
            }
            toast.success(`${uploadedDocuments.length} documento(s) processado(s)!`);
          } catch (docError) {
            console.warn('Erro ao anexar documentos:', docError);
            toast.warning('Paciente criado, mas houve erro ao anexar alguns documentos');
          } finally {
            setIsUploadingDocument(false);
          }
        }
        
        const patientForReceipt = {
          id: result.id,
          full_name: data.full_name,
          cpf: data.cpf,
          email: data.email,
          phone: data.phone,
          specialty: data.specialty,
          mrn: result.mrn,
          status: result.status,
          created_at: result.created_at || new Date().toISOString()
        };
        
        setRegisteredPatient(patientForReceipt);
        setShowReceipt(true);
        
        toast.success('Paciente cadastrado com sucesso!', {
          description: `${data.full_name} foi cadastrado com MRN: ${result.mrn}`,
          duration: 5000,
        });
      }
      
      if (!showReceipt) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('âŒ Erro na operaÃ§Ã£o:', error);
      
      let errorMessage = 'Erro desconhecido';
      let errorDescription = 'Verifique os dados e tente novamente.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
          errorDescription = 'JÃ¡ existe um paciente cadastrado com estes dados (CPF ou e-mail).';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorDescription = 'Problema de conexÃ£o. Verifique sua internet e tente novamente.';
        } else if (errorMessage.includes('validation')) {
          errorDescription = 'Dados invÃ¡lidos. Verifique os campos obrigatÃ³rios.';
        }
      }
      
      toast.error(isEditing ? 'Erro ao atualizar paciente' : 'Erro ao cadastrar paciente', {
        description: errorDescription,
        duration: 7000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceCreate = async () => {
    try {
      setIsLoading(true);
      const formValues = getValues();
      const formattedData: Partial<PatientFormData> & { birth_date: string } = {
        ...formValues,
        birth_date: formValues.birth_date.toISOString().split('T')[0],
      };
      const result = await PatientDuplicationService.createAllowDuplicate(formattedData);

      if (uploadedDocuments.length > 0) {
        setIsUploadingDocument(true);
        try {
          const bucket = import.meta.env.VITE_PATIENT_DOC_BUCKET || 'patient-documents';
          for (const doc of uploadedDocuments) {
            try {
              const timestamp = Date.now();
              const safeName = doc.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
              const filePath = `${result.id}/${timestamp}_${safeName}`;

              const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, doc.file);

              if (uploadError) throw uploadError;

              const { data: publicData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

              const publicUrl = publicData.publicUrl;

              await PatientService.addDocument(result.id, {
                name: doc.name,
                type: doc.type,
                url: publicUrl,
                size: doc.size
              });
            } catch (singleDocError) {
              console.warn('Erro ao enviar/anexar documento:', singleDocError);
              toast.warning(`Erro ao anexar: ${doc.name}`);
            }
          }
          toast.success(`${uploadedDocuments.length} documento(s) processado(s)!`);
        } catch (docError) {
          console.warn('Erro ao anexar documentos:', docError);
          toast.warning('Paciente criado, mas houve erro ao anexar alguns documentos');
        } finally {
          setIsUploadingDocument(false);
        }
      }

      const patientForReceipt = {
        id: result.id,
        full_name: result.full_name,
        cpf: result.cpf,
        email: result.email,
        phone: result.phone,
        specialty: result.specialty,
        mrn: result.mrn,
        status: result.status,
        created_at: result.created_at || new Date().toISOString()
      };
      setRegisteredPatient(patientForReceipt);
      setShowReceipt(true);
      setDupDialogOpen(false);
      toast.success('Paciente cadastrado mesmo com possÃ­vel duplicidade', {
        description: `Cadastro criado com MRN: ${result.mrn}`,
      });
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar paciente apesar da duplicidade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!selectedMergeId) {
      toast.info('Selecione um paciente para mesclagem');
      return;
    }
    try {
      setIsLoading(true);
      const formValues = getValues();
      const formattedData: Partial<PatientFormData> & { birth_date: string } = {
        ...formValues,
        birth_date: formValues.birth_date.toISOString().split('T')[0],
      };
      const merged = await PatientDuplicationService.mergeInto(selectedMergeId, formattedData);
      setDupDialogOpen(false);
      toast.success('Dados mesclados com sucesso!', {
        description: `Atualizado: ${merged.full_name}`,
      });
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao mesclar dados do paciente');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['full_name', 'cpf', 'birth_date', 'gender', 'phone']
      : ['specialty'];
    
  const isStepValid = await trigger(fieldsToValidate as string[]);
    if (isStepValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep >= step 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-2",
                    currentStep > step ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
          <Badge variant="outline">
            Passo {currentStep} de 3
          </Badge>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Passo 1: Informações Pessoais */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Informações Pessoais
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Dados bÃ¡sicos do paciente para identificaÃ§Ã£o</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo *</Label>
                    <Input
                      id="full_name"
                      {...register('full_name')}
                      placeholder="Digite o nome completo"
                      aria-invalid={errors.full_name ? 'true' : undefined}
                      required
                      className={cn(
                        touchedFields.full_name && !errors.full_name && "border-green-500"
                      )}
                    />
                    {errors.full_name && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <div className="relative">
                      <Controller
                        name="cpf"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="cpf"
                            {...field}
                            placeholder="000.000.000-00"
                            onChange={(e) => {
                              const masked = maskCPF(e.target.value);
                              field.onChange(masked);
                            }}
                            aria-invalid={errors.cpf ? 'true' : undefined}
                            required
                            className={cn(
                              touchedFields.cpf && !errors.cpf && cpfValidation === 'valid' && "border-green-500",
                              cpfValidation === 'invalid' && "border-red-500"
                            )}
                          />
                        )}
                      />
                      {cpfValidation === 'checking' && (
                        <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3" />
                      )}
                      {cpfValidation === 'valid' && (
                        <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-3" />
                      )}
                      {cpfValidation === 'invalid' && (
                        <AlertCircle className="w-4 h-4 text-red-500 absolute right-3 top-3" />
                      )}
                    </div>
                    {errors.cpf && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.cpf.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Nascimento *</Label>
                    <Controller
                      name="birth_date"
                      control={control}
                      render={({ field }) => (
                        <DateInput
                          id="birth_date"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          placeholder="dd/mm/aaaa"
                          minDate={new Date('1900-01-01')}
                          maxDate={new Date()}
                          aria-invalid={errors.birth_date ? 'true' : undefined}
                          required
                        />
                      )}
                    />
                    {birthDate && (
                      <p className="text-sm text-muted-foreground">Idade: {calculateAge(birthDate)} anos</p>
                    )}
                    {errors.birth_date && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.birth_date.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero *</Label>
                    <select
                      id="gender"
                      {...register('gender')}
                      required
                      aria-invalid={errors.gender ? 'true' : undefined}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        touchedFields.gender && !errors.gender && "border-green-500"
                      )}
                    >
                      <option value="">Selecione o Gênero</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                    </select>
                    {errors.gender && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.gender.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="phone"
                          {...field}
                          placeholder="(11) 99999-9999"
                          onChange={(e) => {
                            const masked = maskPhone(e.target.value);
                            field.onChange(masked);
                          }}
                          aria-invalid={errors.phone ? 'true' : undefined}
                          required
                          className={cn(
                            touchedFields.phone && !errors.phone && "border-green-500"
                          )}
                        />
                      )}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="Digite o email"
                      aria-invalid={errors.email ? 'true' : undefined}
                      className={cn(
                        touchedFields.email && !errors.email && "border-green-500"
                      )}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Campos de EndereÃ§o */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">EndereÃ§o</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                    >
                      {showAdvancedFields ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showAdvancedFields ? 'Ocultar' : 'Mostrar'} campos opcionais
                    </Button>
                  </div>

                  {showAdvancedFields && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zip_code">CEP</Label>
                        <Controller
                          name="zip_code"
                          control={control}
                          render={({ field }) => (
                            <Input
                              id="zip_code"
                              {...field}
                              placeholder="00000-000"
                              onChange={(e) => {
                                const masked = maskCEP(e.target.value);
                                field.onChange(masked);
                                if (masked.length === 9) {
                                  fetchAddressByCEP(masked);
                                }
                              }}
                            />
                          )}
                        />
                        {errors.zip_code && (
                          <p className="text-sm text-red-500">{errors.zip_code.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">EndereÃ§o</Label>
                        <Input
                          id="address"
                          {...register('address')}
                          placeholder="Rua, nÃºmero, complemento"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          {...register('city')}
                          placeholder="Digite a cidade"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <select
                          id="state"
                          {...register('state')}
                          aria-invalid={errors.state ? 'true' : undefined}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Selecione o estado</option>
                          {states.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

      {/* EndereÃ§o */}
      <Card>
        <CardHeader>
          <CardTitle>EndereÃ§o</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zip_code">CEP</Label>
              <Controller
                name="zip_code"
                control={control}
                render={({ field }) => (
                  <Input
                    id="zip_code"
                    {...field}
                    placeholder="00000-000"
                    onChange={(e) => {
                      const masked = maskCEP(e.target.value);
                      field.onChange(masked);
                      if (masked.length === 9) {
                        fetchAddressByCEP(masked);
                      }
                    }}
                  />
                )}
              />
              {errors.zip_code && (
                <p className="text-sm text-red-500">{errors.zip_code.message}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">EndereÃ§o</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Rua, nÃºmero, complemento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Digite a cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <select
                id="state"
                {...register('state')}
                aria-invalid={errors.state ? 'true' : undefined}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione o estado</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contato de EmergÃªncia */}
      <Card>
        <CardHeader>
          <CardTitle>Contato de EmergÃªncia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Nome do Contato</Label>
              <Input
                id="emergency_contact_name"
                {...register('emergency_contact_name')}
                placeholder="Nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">NÃºmero do Contato</Label>
              <Input
                id="emergency_contact_phone"
                {...register('emergency_contact_phone')}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações MÃ©dicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações MÃ©dicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialty" id="specialty-label">Especialidade *</Label>
            <select
              id="specialty"
              name="specialty"
              aria-labelledby="specialty-label"
              aria-invalid={errors.specialty ? 'true' : undefined}
              value={watch('specialty') ?? ''}
              onChange={(e) => setValue('specialty', e.target.value as 'Curativos' | 'Dermatologia' | 'Cirurgia Plástica' | 'Enfermagem' | 'Fisioterapia' | 'Nutrição' | 'Psicologia' | 'Clínica Geral')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Selecione a especialidade</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            {errors.specialty && (
              <p className="text-sm text-red-500">{errors.specialty.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_history">Histórico MÃ©dico</Label>
            <Textarea
              id="medical_history"
              {...register('medical_history')}
              placeholder="Descreva o Histórico mÃ©dico relevante"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Alergias</Label>
            <Textarea
              id="allergies"
              {...register('allergies')}
              placeholder="Liste alergias conhecidas"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">MedicaÃ§Ãµes em Uso</Label>
            <Textarea
              id="medications"
              {...register('medications')}
              placeholder="Liste medicaÃ§Ãµes atuais"
              rows={2}
            />
          </div>

          {/* SeÃ§Ã£o de Upload de Documentos */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Documentos MÃ©dicos</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Anexe exames, laudos ou outros documentos relevantes</p>
                    <p>Formatos aceitos: PDF, JPG, PNG (mÃ¡x. 5MB cada)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2">
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleDocumentUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Selecione um ou mais arquivos (PDF, JPG, PNG - mÃ¡x. 5MB cada)
              </p>
            </div>

            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Documentos Anexados:</Label>
                <div className="space-y-2">
                  {uploadedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{doc.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(doc.size)}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(doc.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ConvÃªnio */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do ConvÃªnio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insurance_provider">ConvÃªnio</Label>
              <Input
                id="insurance_provider"
                {...register('insurance_provider')}
                placeholder="Nome do convÃªnio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_number">NÃºmero da Carteirinha</Label>
              <Input
                id="insurance_number"
                {...register('insurance_number')}
                placeholder="NÃºmero da carteirinha"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campos EspecÃ­ficos por Especialidade */}
      {watch('specialty') && (
        <Card>
          <CardHeader>
            <CardTitle>Dados EspecÃ­ficos - {watch('specialty')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {watch('specialty') === 'Curativos' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Ãrea da LesÃ£o</Label>
                    <Input
                      id="area"
                      {...register('specialty_data.curativos.area')}
                      placeholder="Ex: 5cm x 3cm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profundidade">Profundidade</Label>
      <Select onValueChange={(value) => setValue('specialty_data.curativos.profundidade', value as string)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a profundidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="superficial">Superficial</SelectItem>
                        <SelectItem value="parcial">Espessura Parcial</SelectItem>
                        <SelectItem value="total">Espessura Total</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="necrose"
                      onCheckedChange={(checked) => setValue('specialty_data.curativos.necrose', !!checked)}
                    />
                    <Label htmlFor="necrose">PresenÃ§a de Necrose</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sinais_infeccao"
                      onCheckedChange={(checked) => setValue('specialty_data.curativos.sinais_infeccao', !!checked)}
                    />
                    <Label htmlFor="sinais_infeccao">Sinais de InfecÃ§Ã£o</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dor_nivel">NÃ­vel de Dor (0-10)</Label>
                  <Input
                    id="dor_nivel"
                    type="number"
                    min="0"
                    max="10"
                    {...register('specialty_data.curativos.dor_nivel', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes_curativos">ObservaÃ§Ãµes</Label>
                  <Textarea
                    id="observacoes_curativos"
                    {...register('specialty_data.curativos.observacoes')}
                    placeholder="ObservaÃ§Ãµes especÃ­ficas sobre o curativo, evoluÃ§Ã£o da lesÃ£o, etc."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {watch('specialty') === 'Dermatologia' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Informações especÃ­ficas para procedimentos dermatolÃ³gicos.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="procedimento">Procedimento</Label>
                    <Input
                      id="procedimento"
                      {...register('specialty_data.dermatologia.procedimento')}
                      placeholder="Ex: Laser CO2, Peeling quÃ­mico, Microagulhamento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parametros">ParÃ¢metros</Label>
                    <Input
                      id="parametros"
                      {...register('specialty_data.dermatologia.parametros')}
                      placeholder="Ex: 10W, 2 passes, 1.5mm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fototipo">Fototipo (1-6)</Label>
                    <Select onValueChange={(value) => setValue('specialty_data.dermatologia.fototipo', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fototipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((tipo) => (
                          <SelectItem key={tipo} value={tipo.toString()}>
                            Fototipo {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acne_grau">Grau da Acne (1-4)</Label>
                    <Select onValueChange={(value) => setValue('specialty_data.dermatologia.acne_grau', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o grau" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((grau) => (
                          <SelectItem key={grau} value={grau.toString()}>
                            Grau {grau}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manchas">Manchas</Label>
                  <Textarea
                    id="manchas"
                    {...register('specialty_data.dermatologia.manchas')}
                    placeholder="DescriÃ§Ã£o das manchas presentes (localizaÃ§Ã£o, cor, tamanho)"
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes_dermatologia">ObservaÃ§Ãµes</Label>
                  <Textarea
                    id="observacoes_dermatologia"
                    {...register('specialty_data.dermatologia.observacoes')}
                    placeholder="ObservaÃ§Ãµes especÃ­ficas sobre o procedimento dermatolÃ³gico"
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {watch('specialty') === 'Cirurgia Plástica' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Dados especÃ­ficos para procedimentos de Cirurgia Plástica.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Cirurgia</Label>
                    <Input
                      id="tipo"
                      {...register('specialty_data.cirurgias.tipo')}
                      placeholder="Ex: Abdominoplastia, Rinoplastia, LipoaspiraÃ§Ã£o"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anestesia">Tipo de Anestesia</Label>
      <Select onValueChange={(value) => setValue('specialty_data.cirurgias.anestesia', value as string)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de anestesia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="sedacao">Sedação</SelectItem>
                        <SelectItem value="geral">Geral</SelectItem>
                        <SelectItem value="raqui">Raquianestesia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suturas">Suturas</Label>
                  <Input
                    id="suturas"
                    {...register('specialty_data.cirurgias.suturas')}
                    placeholder="Ex: Mononylon 4-0, Vicryl 3-0, PDS 2-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pos_operatorio">Pós-operatório</Label>
                  <Textarea
                    id="pos_operatorio"
                    {...register('specialty_data.cirurgias.pos_operatorio')}
                    placeholder="InstruÃ§Ãµes e cuidados Pós-operatórios detalhados"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes_cirurgias">ObservaÃ§Ãµes</Label>
                  <Textarea
                    id="observacoes_cirurgias"
                    {...register('specialty_data.cirurgias.observacoes')}
                    placeholder="ObservaÃ§Ãµes especÃ­ficas sobre a cirurgia, complicaÃ§Ãµes, etc."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {!['Curativos', 'Dermatologia', 'Cirurgia Plástica'].includes(selectedSpecialty) && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Especialidade selecionada: {selectedSpecialty}. Campos especÃ­ficos nÃ£o disponÃ­veis para esta especialidade.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

  {/* Consentimentos */}
  <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Consentimentos e AutorizaÃ§Ãµes
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Consentimentos necessÃ¡rios para o tratamento</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Os consentimentos sÃ£o necessÃ¡rios para o processamento dos dados e comunicaÃ§Ã£o com o paciente.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <input
                id="consent_data_processing"
                type="checkbox"
                {...register('consent_data_processing')}
                className="mt-1 h-4 w-4"
              />
              <div className="space-y-1">
                <Label htmlFor="consent_data_processing" className="text-sm font-medium">
                  Consentimento para Processamento de Dados *
                </Label>
                <p className="text-xs text-muted-foreground">
                  Autorizo o processamento dos meus dados pessoais para fins de tratamento mÃ©dico, 
                  conforme a Lei Geral de ProteÃ§Ã£o de Dados (LGPD).
                </p>
              </div>
            </div>
            {errors.consent_data_processing && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.consent_data_processing.message}
              </p>
            )}

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <input
                id="consent_whatsapp"
                type="checkbox"
                {...register('consent_whatsapp')}
                className="mt-1 h-4 w-4"
              />
              <div className="space-y-1">
                <Label htmlFor="consent_whatsapp" className="text-sm font-medium">
                  ComunicaÃ§Ã£o via WhatsApp
                </Label>
                <p className="text-xs text-muted-foreground">
                  Autorizo receber comunicaÃ§Ãµes, lembretes de consultas e Informações sobre 
                  tratamentos via WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <input
                id="consent_email"
                type="checkbox"
                {...register('consent_email')}
                className="mt-1 h-4 w-4"
              />
              <div className="space-y-1">
                <Label htmlFor="consent_email" className="text-sm font-medium">
                  ComunicaÃ§Ã£o via E-mail
                </Label>
                <p className="text-xs text-muted-foreground">
                  Autorizo receber comunicaÃ§Ãµes, resultados de exames e Informações sobre 
                  tratamentos via e-mail.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

  {/* Passo 3: Campos EspecÃ­ficos e Consentimentos */}
  {currentStep === 3 && (
    <div className="space-y-6">
      {/* Campos EspecÃ­ficos por Especialidade */}
      {selectedSpecialty && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Dados EspecÃ­ficos - {selectedSpecialty}
              <Badge variant="secondary">{selectedSpecialty}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSpecialty === 'Curativos' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Preencha as Informações especÃ­ficas sobre o curativo e lesÃ£o do paciente.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area">Ãrea da LesÃ£o</Label>
                    <Input
                      id="area"
                      {...register('specialty_data.curativos.area')}
                      placeholder="Ex: 5cm x 3cm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profundidade">Profundidade</Label>
      <Select onValueChange={(value) => setValue('specialty_data.curativos.profundidade', value as string)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a profundidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="superficial">Superficial</SelectItem>
                        <SelectItem value="parcial">Espessura Parcial</SelectItem>
                        <SelectItem value="total">Espessura Total</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="necrose"
                      onCheckedChange={(checked) => setValue('specialty_data.curativos.necrose', !!checked)}
                    />
                    <Label htmlFor="necrose">PresenÃ§a de Necrose</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sinais_infeccao"
                      onCheckedChange={(checked) => setValue('specialty_data.curativos.sinais_infeccao', !!checked)}
                    />
                    <Label htmlFor="sinais_infeccao">Sinais de InfecÃ§Ã£o</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dor_nivel">NÃ­vel de Dor (0-10)</Label>
                    <Input
                      id="dor_nivel"
                      type="number"
                      min="0"
                      max="10"
                      {...register('specialty_data.curativos.dor_nivel', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observacoes_curativos">ObservaÃ§Ãµes</Label>
                  <Textarea
                    id="observacoes_curativos"
                    {...register('specialty_data.curativos.observacoes')}
                    placeholder="ObservaÃ§Ãµes especÃ­ficas sobre o curativo, evoluÃ§Ã£o da lesÃ£o, etc."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {selectedSpecialty === 'Dermatologia' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Informações especÃ­ficas para procedimentos dermatolÃ³gicos.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="procedimento">Procedimento</Label>
                    <Input
                      id="procedimento"
                      {...register('specialty_data.dermatologia.procedimento')}
                      placeholder="Ex: Laser CO2, Peeling quÃ­mico, Microagulhamento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parametros">ParÃ¢metros</Label>
                    <Input
                      id="parametros"
                      {...register('specialty_data.dermatologia.parametros')}
                      placeholder="Ex: 10W, 2 passes, 1.5mm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fototipo">Fototipo (1-6)</Label>
                    <Select onValueChange={(value) => setValue('specialty_data.dermatologia.fototipo', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fototipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((tipo) => (
                          <SelectItem key={tipo} value={tipo.toString()}>
                            Fototipo {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acne_grau">Grau da Acne (1-4)</Label>
                    <Select onValueChange={(value) => setValue('specialty_data.dermatologia.acne_grau', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o grau" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((grau) => (
                          <SelectItem key={grau} value={grau.toString()}>
                            Grau {grau}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manchas">Manchas</Label>
                  <Textarea
                    id="manchas"
                    {...register('specialty_data.dermatologia.manchas')}
                    placeholder="DescriÃ§Ã£o das manchas presentes (localizaÃ§Ã£o, cor, tamanho)"
                    rows={2}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observacoes_dermatologia">ObservaÃ§Ãµes</Label>
                  <Textarea
                    id="observacoes_dermatologia"
                    {...register('specialty_data.dermatologia.observacoes')}
                    placeholder="ObservaÃ§Ãµes especÃ­ficas sobre o procedimento dermatolÃ³gico"
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {selectedSpecialty === 'Cirurgia Plástica' && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Dados especÃ­ficos para procedimentos de Cirurgia Plástica.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Cirurgia</Label>
                    <Input
                      id="tipo"
                      {...register('specialty_data.cirurgias.tipo')}
                      placeholder="Ex: Abdominoplastia, Rinoplastia, LipoaspiraÃ§Ã£o"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anestesia">Tipo de Anestesia</Label>
      <Select onValueChange={(value) => setValue('specialty_data.cirurgias.anestesia', value as string)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de anestesia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="sedacao">Sedação</SelectItem>
                        <SelectItem value="geral">Geral</SelectItem>
                        <SelectItem value="raqui">Raquianestesia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="suturas">Suturas</Label>
                  <Input
                    id="suturas"
                    {...register('specialty_data.cirurgias.suturas')}
                    placeholder="Ex: Mononylon 4-0, Vicryl 3-0, PDS 2-0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pos_operatorio">Pós-operatório</Label>
                  <Textarea
                    id="pos_operatorio"
                    {...register('specialty_data.cirurgias.pos_operatorio')}
                    placeholder="InstruÃ§Ãµes e cuidados Pós-operatórios detalhados"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="observacoes_cirurgias">ObservaÃ§Ãµes</Label>
                  <Textarea
                    id="observacoes_cirurgias"
                    {...register('specialty_data.cirurgias.observacoes')}
                    placeholder="ObservaÃ§Ãµes especÃ­ficas sobre a cirurgia, complicaÃ§Ãµes, etc."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {!['Curativos', 'Dermatologia', 'Cirurgia Plástica'].includes(selectedSpecialty) && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Especialidade selecionada: {selectedSpecialty}. Campos especÃ­ficos nÃ£o disponÃ­veis para esta especialidade.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      
    </div>
  )}

  {/* Navigation Buttons */}
  <div className="flex justify-between">
    <div>
      {currentStep > 1 && (
        <Button type="button" variant="outline" onClick={prevStep}>
          Voltar
        </Button>
      )}
    </div>
    
    <div className="flex space-x-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>

      <Button type="button" onClick={nextStep}>
        PrÃ³ximo
      </Button>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? 'Atualizar Paciente' : 'Cadastrar Paciente'}
      </Button>
    </div>
  </div>
</form>

{/* Comprovante de Cadastro */}
      {showReceipt && registeredPatient && (
        <PatientRegistrationReceipt
          patient={registeredPatient}
          onClose={() => {
            setShowReceipt(false);
            setRegisteredPatient(null);
            onSuccess?.();
          }}
          onPatientActivated={(activatedPatient) => {
            setRegisteredPatient(activatedPatient);
            toast.success('Paciente ativado com sucesso!');
          }}
        />
      )}
        {/* DiÃ¡logo de duplicidade */}
        <Dialog open={dupDialogOpen} onOpenChange={setDupDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>PossÃ­vel duplicidade encontrada</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Encontramos pacientes com dados semelhantes. VocÃª pode mesclar os dados ou criar um novo cadastro.
              </p>
              <div className="border rounded-md divide-y">
                {dupCandidates.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{p.full_name}</div>
                      <div className="text-sm text-muted-foreground">CPF: {p.cpf} â€¢ Email: {p.email} â€¢ Telefone: {p.phone}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant={selectedMergeId === p.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedMergeId(p.id)}>
                        {selectedMergeId === p.id ? 'Selecionado' : 'Selecionar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setDupDialogOpen(false)}>Cancelar</Button>
              <Button variant="secondary" onClick={handleForceCreate}>Criar novo mesmo assim</Button>
              <Button onClick={handleMerge} disabled={!selectedMergeId}>Mesclar com selecionado</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
export default PatientForm;











