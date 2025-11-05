import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Plus, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  User,
  Stethoscope,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/ui/page-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';

import { AppointmentService, Appointment, AppointmentFilters } from '@/services/appointmentService';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { cn } from '@/lib/utils';

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'cancelled', label: 'Cancelado' }
];

const specialtyOptions = [
  { value: '', label: 'Todas as especialidades' },
  { value: 'Curativos', label: 'Curativos' },
  { value: 'Dermatologia', label: 'Dermatologia' },
  { value: 'Cirurgias', label: 'Cirurgias' }
];

export default function Appointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState<AppointmentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Agendamentos', href: '/appointments' }
  ];

  // Get date range for current view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Fetch appointments
  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['appointments', filters, currentDate],
    queryFn: () => AppointmentService.getAppointments({
      ...filters,
      date_from: format(monthStart, 'yyyy-MM-dd'),
      date_to: format(monthEnd, 'yyyy-MM-dd')
    })
  });

  // Filter appointments by search term
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.patient?.full_name?.toLowerCase().includes(searchLower) ||
      appointment.professional?.full_name?.toLowerCase().includes(searchLower) ||
      appointment.notes?.toLowerCase().includes(searchLower)
    );
  });

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(appointment =>
      isSameDay(new Date(appointment.date_time), date)
    );
  };

  // Get appointments for selected date or today
  const selectedDateAppointments = selectedDate 
    ? getAppointmentsForDate(selectedDate)
    : getAppointmentsForDate(new Date());

  const handlePreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
  await AppointmentService.updateAppointment(appointmentId, { status: newStatus as 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' });
      refetch();
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await AppointmentService.deleteAppointment(appointmentId);
        refetch();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const renderCalendarView = () => {
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const dayAppointments = getAppointmentsForDate(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                    !isCurrentMonth && "text-muted-foreground bg-gray-50/50",
                    isToday(day) && "bg-blue-50 border-blue-200",
                    isSelected && "bg-primary/10 border-primary"
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isToday(day) && "text-blue-600"
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map(appointment => (
                      <div
                        key={appointment.id}
                        className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                      >
                        {format(new Date(appointment.date_time), 'HH:mm')} - {appointment.patient?.full_name}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayAppointments.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {format(new Date(appointment.date_time), 'HH:mm')} - 
                {format(new Date(new Date(appointment.date_time).getTime() + appointment.duration * 60000), 'HH:mm')}
              </span>
              <StatusBadge type={appointment.status} />
            </div>
            
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.patient?.full_name}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{appointment.specialty}</span>
              <span className="text-muted-foreground">•</span>
              <span>{appointment.professional?.full_name}</span>
            </div>
            
            {appointment.notes && (
              <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              {appointment.status === 'scheduled' && (
                <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'confirmed')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar
                </DropdownMenuItem>
              )}
              {appointment.status !== 'cancelled' && (
                <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'cancelled')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => handleDeleteAppointment(appointment.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agendamentos"
        description="Gerencie os agendamentos e consultas"
        breadcrumbs={breadcrumbs}
        action={
          <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <AppointmentForm
                onSuccess={() => {
                  setShowNewAppointment(false);
                  refetch();
                }}
                onCancel={() => setShowNewAppointment(false)}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, profissional ou observações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.specialty || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, specialty: value || undefined }))}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Especialidade" />
              </SelectTrigger>
              <SelectContent>
                {specialtyOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filters.status || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendário
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <Filter className="h-4 w-4 mr-2" />
                Lista
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {viewMode === 'calendar' ? renderCalendarView() : (
            <div>
              {filteredAppointments.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="Nenhum agendamento encontrado"
                  description="Não há agendamentos para os filtros selecionados."
                />
              ) : (
                filteredAppointments.map(renderAppointmentCard)
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Hoje'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateAppointments.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum agendamento para esta data
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateAppointments.map(appointment => (
                    <div key={appointment.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {format(new Date(appointment.date_time), 'HH:mm')}
                        </span>
                        <StatusBadge type={appointment.status} />
                      </div>
                      <p className="text-sm">{appointment.patient?.full_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {appointment.specialty}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
