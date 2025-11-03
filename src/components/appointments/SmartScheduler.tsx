import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope, 
  MapPin, 
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format, addDays, isSameDay, isAfter, isBefore, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Professional {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  avatar?: string;
  working_hours: {
    [key: string]: { start: string; end: string; available: boolean };
  };
  blocked_times: BlockedTime[];
}

interface BlockedTime {
  id: string;
  start_time: Date;
  end_time: Date;
  reason: string;
  type: 'vacation' | 'meeting' | 'personal' | 'maintenance';
}

interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  professional_id: string;
  professional_name: string;
  specialty: string;
  date_time: Date;
  duration: number; // em minutos
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  location: string;
  created_at: Date;
}

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

interface SmartSchedulerProps {
  onAppointmentCreate?: (appointment: Omit<Appointment, 'id' | 'created_at'>) => void;
  professionals?: Professional[];
  existingAppointments?: Appointment[];
}

const specialties = [
  'Curativos',
  'Dermatologia', 
  'Cirurgia Plástica',
  'Enfermagem',
  'Fisioterapia',
  'Nutrição',
  'Psicologia',
  'Clínica Geral'
];

const appointmentDurations = {
  'Curativos': 30,
  'Dermatologia': 45,
  'Cirurgia Plástica': 60,
  'Enfermagem': 30,
  'Fisioterapia': 45,
  'Nutrição': 45,
  'Psicologia': 50,
  'Clínica Geral': 30
};

const mockProfessionals: Professional[] = [
  {
    id: 'prof_1',
    name: 'Dr. João Silva',
    specialty: 'Dermatologia',
    email: 'joao@clinica.com',
    phone: '(11) 99999-9999',
    working_hours: {
      monday: { start: '08:00', end: '18:00', available: true },
      tuesday: { start: '08:00', end: '18:00', available: true },
      wednesday: { start: '08:00', end: '18:00', available: true },
      thursday: { start: '08:00', end: '18:00', available: true },
      friday: { start: '08:00', end: '17:00', available: true },
      saturday: { start: '08:00', end: '12:00', available: true },
      sunday: { start: '00:00', end: '00:00', available: false }
    },
    blocked_times: []
  },
  {
    id: 'prof_2',
    name: 'Dra. Maria Santos',
    specialty: 'Cirurgia Plástica',
    email: 'maria@clinica.com',
    phone: '(11) 88888-8888',
    working_hours: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '16:00', available: true },
      saturday: { start: '00:00', end: '00:00', available: false },
      sunday: { start: '00:00', end: '00:00', available: false }
    },
    blocked_times: []
  },
  {
    id: 'prof_3',
    name: 'Enf. Ana Costa',
    specialty: 'Curativos',
    email: 'ana@clinica.com',
    phone: '(11) 77777-7777',
    working_hours: {
      monday: { start: '07:00', end: '19:00', available: true },
      tuesday: { start: '07:00', end: '19:00', available: true },
      wednesday: { start: '07:00', end: '19:00', available: true },
      thursday: { start: '07:00', end: '19:00', available: true },
      friday: { start: '07:00', end: '19:00', available: true },
      saturday: { start: '07:00', end: '15:00', available: true },
      sunday: { start: '00:00', end: '00:00', available: false }
    },
    blocked_times: []
  }
];

export function SmartScheduler({ 
  onAppointmentCreate, 
  professionals = mockProfessionals,
  existingAppointments = []
}: SmartSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredProfessionals = selectedSpecialty 
    ? professionals.filter(prof => prof.specialty === selectedSpecialty)
    : [];

  const selectedProfessionalData = professionals.find(prof => prof.id === selectedProfessional);

  useEffect(() => {
    if (selectedProfessional && selectedDate) {
      generateAvailableSlots();
    }
  }, [selectedProfessional, selectedDate, existingAppointments]);

  const getDayOfWeek = (date: Date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  const generateAvailableSlots = () => {
    if (!selectedProfessionalData) return;

    const dayOfWeek = getDayOfWeek(selectedDate);
    const workingHours = selectedProfessionalData.working_hours[dayOfWeek];

    if (!workingHours.available) {
      setAvailableSlots([]);
      return;
    }

    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);
    
    const startTime = setMinutes(setHours(selectedDate, startHour), startMinute);
    const endTime = setMinutes(setHours(selectedDate, endHour), endMinute);
    
    const duration = appointmentDurations[selectedSpecialty as keyof typeof appointmentDurations] || 30;
    const slotInterval = 15; // Intervalos de 15 minutos

    let currentTime = startTime;
    
    while (isBefore(currentTime, endTime)) {
      const timeString = format(currentTime, 'HH:mm');
      const slotEndTime = addDays(currentTime, 0);
      slotEndTime.setMinutes(slotEndTime.getMinutes() + duration);

      // Verificar se o slot não ultrapassa o horário de trabalho
      if (isAfter(slotEndTime, endTime)) {
        break;
      }

      // Verificar se há conflito com agendamentos existentes
      const hasConflict = existingAppointments.some(appointment => {
        if (appointment.professional_id !== selectedProfessional) return false;
        if (!isSameDay(new Date(appointment.date_time), selectedDate)) return false;
        
        const appointmentStart = new Date(appointment.date_time);
        const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);
        
        return (
          (currentTime >= appointmentStart && currentTime < appointmentEnd) ||
          (slotEndTime > appointmentStart && slotEndTime <= appointmentEnd) ||
          (currentTime <= appointmentStart && slotEndTime >= appointmentEnd)
        );
      });

      // Verificar se há bloqueios
      const isBlocked = selectedProfessionalData.blocked_times.some(blocked => {
        const blockedStart = new Date(blocked.start_time);
        const blockedEnd = new Date(blocked.end_time);
        
        return (
          (currentTime >= blockedStart && currentTime < blockedEnd) ||
          (slotEndTime > blockedStart && slotEndTime <= blockedEnd)
        );
      });

      // Verificar se é no passado
      const isPast = isBefore(currentTime, new Date());

      slots.push({
        time: timeString,
        available: !hasConflict && !isBlocked && !isPast,
        reason: hasConflict ? 'Ocupado' : isBlocked ? 'Bloqueado' : isPast ? 'Passado' : undefined
      });

      currentTime = new Date(currentTime.getTime() + slotInterval * 60000);
    }

    setAvailableSlots(slots);
  };

  const handleScheduleAppointment = async () => {
    if (!patientName.trim()) {
      toast.error('Nome do paciente é obrigatório');
      return;
    }

    if (!selectedTime) {
      toast.error('Selecione um horário');
      return;
    }

    setIsLoading(true);

    try {
      const [hour, minute] = selectedTime.split(':').map(Number);
      const appointmentDateTime = setMinutes(setHours(selectedDate, hour), minute);
      const duration = appointmentDurations[selectedSpecialty as keyof typeof appointmentDurations] || 30;

      const appointment: Omit<Appointment, 'id' | 'created_at'> = {
        patient_id: `patient_${Date.now()}`, // Em produção, seria o ID real do paciente
        patient_name: patientName,
        professional_id: selectedProfessional,
        professional_name: selectedProfessionalData?.name || '',
        specialty: selectedSpecialty,
        date_time: appointmentDateTime,
        duration,
        status: 'scheduled',
        notes,
        location: 'Consultório Principal'
      };

      onAppointmentCreate?.(appointment);

      // Reset form
      setPatientName('');
      setPatientPhone('');
      setNotes('');
      setSelectedTime('');
      
      toast.success('Agendamento realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao realizar agendamento');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'no_show': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const todayAppointments = existingAppointments.filter(appointment => 
    isSameDay(new Date(appointment.date_time), selectedDate)
  ).sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulário de Agendamento */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5" />
              <span>Novo Agendamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_name">Nome do Paciente *</Label>
                <Input
                  id="patient_name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Digite o nome do paciente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient_phone">Telefone</Label>
                <Input
                  id="patient_phone"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade *</Label>
              <select
                id="specialty"
                value={selectedSpecialty}
                onChange={(e) => {
                  setSelectedSpecialty(e.target.value);
                  setSelectedProfessional('');
                  setSelectedTime('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma especialidade</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            {selectedSpecialty && (
              <div className="space-y-2">
                <Label htmlFor="professional">Profissional *</Label>
                <select
                  id="professional"
                  value={selectedProfessional}
                  onChange={(e) => {
                    setSelectedProfessional(e.target.value);
                    setSelectedTime('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um profissional</option>
                  {filteredProfessionals.map(professional => (
                    <option key={professional.id} value={professional.id}>
                      {professional.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedProfessionalData && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">{selectedProfessionalData.name}</h3>
                    <p className="text-sm text-blue-700">{selectedProfessionalData.specialty}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-blue-600 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {selectedProfessionalData.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Data do Agendamento *</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setSelectedTime('');
                  }
                }}
                disabled={(date) => isBefore(date, new Date()) || date < new Date()}
                locale={ptBR}
                className="rounded-md border"
              />
            </div>

            {selectedProfessional && availableSlots.length > 0 && (
              <div className="space-y-2">
                <Label>Horários Disponíveis</Label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      size="sm"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className="text-xs"
                      title={slot.reason}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
                {availableSlots.every(slot => !slot.available) && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum horário disponível para esta data
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre o agendamento"
                rows={3}
              />
            </div>

            <Button 
              onClick={handleScheduleAppointment}
              disabled={isLoading || !patientName || !selectedSpecialty || !selectedProfessional || !selectedTime}
              className="w-full"
            >
              {isLoading ? 'Agendando...' : 'Agendar Consulta'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Agenda do Dia */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Agenda - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum agendamento para esta data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-sm">
                            {format(new Date(appointment.date_time), 'HH:mm')}
                          </span>
                          <Badge className={getStatusColor(appointment.status)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(appointment.status)}
                              <span className="capitalize">{appointment.status}</span>
                            </span>
                          </Badge>
                        </div>
                        <p className="font-medium text-sm">{appointment.patient_name}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Stethoscope className="h-3 w-3" />
                          <span>{appointment.specialty}</span>
                          <User className="h-3 w-3 ml-2" />
                          <span>{appointment.professional_name}</span>
                        </div>
                        {appointment.notes && (
                          <p className="text-xs text-gray-500 mt-1">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo da Especialidade */}
        {selectedSpecialty && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações da Especialidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Duração típica:</span>
                  <span>{appointmentDurations[selectedSpecialty as keyof typeof appointmentDurations] || 30} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Profissionais disponíveis:</span>
                  <span>{filteredProfessionals.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}