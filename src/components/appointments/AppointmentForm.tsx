import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock, User, Stethoscope, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

import { AppointmentService, CreateAppointmentData, AvailableSlot } from '@/services/appointmentService';
import { PatientService } from '../../services/patientService';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Selecione um paciente'),
  specialty: z.enum(['Curativos', 'Dermatologia', 'Cirurgias'], {
    required_error: 'Selecione uma especialidade'
  }),
  date: z.date({
    required_error: 'Selecione uma data'
  }),
  slot: z.string().min(1, 'Selecione um horário'),
  duration: z.number().min(15).max(240),
  notes: z.string().optional()
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<CreateAppointmentData>;
}

const specialtyOptions = [
  { value: 'Curativos', label: 'Curativos' },
  { value: 'Dermatologia', label: 'Dermatologia' },
  { value: 'Cirurgias', label: 'Cirurgias' }
];

const durationOptions = [
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' }
];

export function AppointmentForm({ onSuccess, onCancel, initialData }: AppointmentFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      duration: 60,
      ...initialData
    }
  });

  // Fetch patients for selection
  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => PatientService.getAll()
  });

  // Load available slots when specialty, date, or duration changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedSpecialty || !selectedDate) return;

      setLoadingSlots(true);
      try {
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const slots = await AppointmentService.getAvailableSlots(
          selectedSpecialty,
          dateString,
          selectedDuration
        );
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error loading slots:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    if (selectedSpecialty && selectedDate && selectedDuration) {
      void fetchSlots();
    }
  }, [selectedSpecialty, selectedDate, selectedDuration]);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const selectedSlot = availableSlots.find(slot => 
        `${slot.professional_id}-${slot.time}` === data.slot
      );

      if (!selectedSlot) {
        throw new Error('Horário selecionado não encontrado');
      }

      const appointmentData: CreateAppointmentData = {
        patient_id: data.patient_id,
        professional_id: selectedSlot.professional_id,
        specialty: data.specialty,
        date_time: `${format(data.date, 'yyyy-MM-dd')}T${selectedSlot.time}:00`,
        duration: data.duration,
        notes: data.notes
      };

      await AppointmentService.createAppointment(appointmentData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialty(value);
    setValue('specialty', value as AppointmentFormData['specialty']);
    setValue('slot', ''); // Reset slot selection
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setValue('date', date);
      setValue('slot', ''); // Reset slot selection
    }
  };

  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    setSelectedDuration(duration);
    setValue('duration', duration);
    setValue('slot', ''); // Reset slot selection
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 90); // Allow booking up to 90 days in advance
    return date < today || date > maxDate;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Agendar Consulta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label htmlFor="patient_id" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Paciente
              </Label>
              <Select onValueChange={(value) => setValue('patient_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {loadingPatients ? (
                    <div className="flex items-center justify-center p-4">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : (
                    patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.full_name} - {patient.cpf}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.patient_id && (
                <p className="text-sm text-red-500">{errors.patient_id.message}</p>
              )}
            </div>

            {/* Specialty Selection */}
            <div className="space-y-2">
              <Label htmlFor="specialty" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Especialidade
              </Label>
              <Select onValueChange={handleSpecialtyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {specialtyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.specialty && (
                <p className="text-sm text-red-500">{errors.specialty.message}</p>
              )}
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Data
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: ptBR })
                    ) : (
                      "Selecione uma data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    disabled={isDateDisabled}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            {/* Duration Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duração
              </Label>
              <Select onValueChange={handleDurationChange} defaultValue="60">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Available Slots */}
          {selectedSpecialty && selectedDate && (
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horários Disponíveis
              </Label>
              
              {loadingSlots ? (
                <div className="flex items-center justify-center p-8">
                  <LoadingSpinner />
                  <span className="ml-2">Carregando horários...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <label
                      key={`${slot.professional_id}-${slot.time}`}
                      className="cursor-pointer"
                    >
                      <input
                        type="radio"
                        {...register('slot')}
                        value={`${slot.professional_id}-${slot.time}`}
                        className="sr-only"
                      />
                      <div className="p-3 border rounded-lg hover:bg-gray-50 has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:checked]:border-primary">
                        <div className="font-medium">{slot.time}</div>
                        <div className="text-sm text-muted-foreground">
                          {slot.professional_name}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum horário disponível para esta data</p>
                  <p className="text-sm">Tente selecionar outra data</p>
                </div>
              )}
              
              {errors.slot && (
                <p className="text-sm text-red-500">{errors.slot.message}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações (opcional)
            </Label>
            <Textarea
              {...register('notes')}
              placeholder="Observações sobre o agendamento..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Agendando...
                </>
              ) : (
                'Agendar Consulta'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
