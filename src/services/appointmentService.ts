import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  specialty: 'Curativos' | 'Dermatologia' | 'Cirurgias';
  date_time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  professional?: {
    id: string;
    full_name: string;
    email: string;
    specialty?: string;
  };
}

export interface CreateAppointmentData {
  patient_id: string;
  professional_id: string;
  specialty: 'Curativos' | 'Dermatologia' | 'Cirurgias';
  date_time: string;
  duration: number;
  notes?: string;
}

export interface UpdateAppointmentData {
  patient_id?: string;
  professional_id?: string;
  specialty?: 'Curativos' | 'Dermatologia' | 'Cirurgias';
  date_time?: string;
  duration?: number;
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
  professional_id: string;
  professional_name: string;
  duration: number;
}

export interface AppointmentFilters {
  specialty?: string;
  status?: string;
  professional_id?: string;
  date_from?: string;
  date_to?: string;
}

export class AppointmentService {
  // Get all appointments with filters
  static async getAppointments(filters: AppointmentFilters = {}): Promise<Appointment[]> {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(id, full_name, email, phone, cpf),
          professional:profiles!appointments_professional_id_fkey(id, full_name, email, specialty)
        `)
        .order('date_time', { ascending: true });

      // Apply filters
      if (filters.specialty) {
        // Case-insensitive match to support legacy lowercase data while UI uses capitalized values
        query = query.ilike('specialty', filters.specialty);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.professional_id) {
        query = query.eq('professional_id', filters.professional_id);
      }
      if (filters.date_from) {
        query = query.gte('date_time', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('date_time', filters.date_to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Erro ao carregar agendamentos');
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAppointments:', error);
      throw error;
    }
  }

  // Get appointment by ID
  static async getAppointmentById(id: string): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(id, full_name, email, phone, cpf),
          professional:profiles!appointments_professional_id_fkey(id, full_name, email, specialty)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching appointment:', error);
        if (error.code !== 'PGRST116') { // Not found error
          toast.error('Erro ao carregar agendamento');
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getAppointmentById:', error);
      return null;
    }
  }

  // Create new appointment
  static async createAppointment(appointmentData: CreateAppointmentData): Promise<Appointment | null> {
    try {
      // Check if slot is available
      const isAvailable = await this.isSlotAvailable(
        appointmentData.professional_id,
        appointmentData.date_time,
        appointmentData.duration
      );

      if (!isAvailable) {
        toast.error('Horário não disponível');
        return null;
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(id, full_name, email, phone, cpf),
          professional:profiles!appointments_professional_id_fkey(id, full_name, email, specialty)
        `)
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        toast.error('Erro ao criar agendamento');
        throw error;
      }

      toast.success('Agendamento criado com sucesso');
      return data;
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw error;
    }
  }

  // Update appointment
  static async updateAppointment(id: string, updateData: UpdateAppointmentData): Promise<Appointment | null> {
    try {
      // If updating date/time, check availability
      if (updateData.date_time && updateData.professional_id) {
        const isAvailable = await this.isSlotAvailable(
          updateData.professional_id,
          updateData.date_time,
          updateData.duration || 60,
          id // Exclude current appointment from check
        );

        if (!isAvailable) {
          toast.error('Horário não disponível');
          return null;
        }
      }

      const { data, error } = await supabase
        .from('appointments')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(id, full_name, email, phone, cpf),
          professional:profiles!appointments_professional_id_fkey(id, full_name, email, specialty)
        `)
        .single();

      if (error) {
        console.error('Error updating appointment:', error);
        toast.error('Erro ao atualizar agendamento');
        throw error;
      }

      toast.success('Agendamento atualizado com sucesso');
      return data;
    } catch (error) {
      console.error('Error in updateAppointment:', error);
      throw error;
    }
  }

  // Delete appointment
  static async deleteAppointment(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Erro ao excluir agendamento');
        throw error;
      }

      toast.success('Agendamento excluído com sucesso');
      return true;
    } catch (error) {
      console.error('Error in deleteAppointment:', error);
      return false;
    }
  }

  // Get available slots for a specialty
  static async getAvailableSlots(
    specialty: string,
    date: string,
    duration: number = 60
  ): Promise<AvailableSlot[]> {
    try {
      // Get professionals for the specialty
      const { data: professionals, error: profError } = await supabase
        .from('profiles')
        .select('id, full_name, specialty')
        .eq('role', 'professional')
        .ilike('specialty', specialty);

      if (profError) {
        console.error('Error fetching professionals:', profError);
        return [];
      }

      if (!professionals || professionals.length === 0) {
        return [];
      }

      const availableSlots: AvailableSlot[] = [];
      const workingHours = this.getWorkingHours();

      for (const professional of professionals) {
        // Get existing appointments for this professional on this date
        const { data: appointments, error: apptError } = await supabase
          .from('appointments')
          .select('date_time, duration')
          .eq('professional_id', professional.id)
          .gte('date_time', `${date}T00:00:00`)
          .lt('date_time', `${date}T23:59:59`)
          .neq('status', 'cancelled');

        if (apptError) {
          console.error('Error fetching appointments:', apptError);
          continue;
        }

        // Generate available slots
        const slots = this.generateAvailableSlots(
          date,
          workingHours,
          appointments || [],
          duration,
          professional
        );

        availableSlots.push(...slots);
      }

      return availableSlots.sort((a, b) => a.time.localeCompare(b.time));
    } catch (error) {
      console.error('Error in getAvailableSlots:', error);
      return [];
    }
  }

  // Check if a specific slot is available
  static async isSlotAvailable(
    professionalId: string,
    dateTime: string,
    duration: number,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    try {
      const startTime = new Date(dateTime);
      const endTime = new Date(startTime.getTime() + duration * 60000);

      let query = supabase
        .from('appointments')
        .select('id, date_time, duration')
        .eq('professional_id', professionalId)
        .neq('status', 'cancelled')
        .or(`and(date_time.lte.${startTime.toISOString()},date_time.gte.${new Date(startTime.getTime() - 4 * 60 * 60 * 1000).toISOString()}),and(date_time.gte.${startTime.toISOString()},date_time.lte.${endTime.toISOString()})`);

      if (excludeAppointmentId) {
        query = query.neq('id', excludeAppointmentId);
      }

      const { data: conflicts, error } = await query;

      if (error) {
        console.error('Error checking slot availability:', error);
        return false;
      }

      // Check for time conflicts
      for (const appointment of conflicts || []) {
        const apptStart = new Date(appointment.date_time);
        const apptEnd = new Date(apptStart.getTime() + appointment.duration * 60000);

        // Check if there's any overlap
        if (
          (startTime >= apptStart && startTime < apptEnd) ||
          (endTime > apptStart && endTime <= apptEnd) ||
          (startTime <= apptStart && endTime >= apptEnd)
        ) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in isSlotAvailable:', error);
      return false;
    }
  }

  // Get appointments for today
  static async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointments({
      date_from: `${today}T00:00:00`,
      date_to: `${today}T23:59:59`
    });
  }

  // Get upcoming appointments
  static async getUpcomingAppointments(limit: number = 10): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(id, full_name, email, phone, cpf),
          professional:profiles!appointments_professional_id_fkey(id, full_name, email, specialty)
        `)
        .gte('date_time', new Date().toISOString())
        .in('status', ['scheduled', 'confirmed'])
        .order('date_time', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching upcoming appointments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUpcomingAppointments:', error);
      return [];
    }
  }

  // Private helper methods
  private static getWorkingHours() {
    return {
      start: '08:00',
      end: '18:00',
      lunchStart: '12:00',
      lunchEnd: '13:00'
    };
  }

  private static generateAvailableSlots(
    date: string,
    workingHours: { start: string; end: string; lunchStart: string; lunchEnd: string },
    existingAppointments: Appointment[],
    duration: number,
    professional: { id: string; full_name: string }
  ): AvailableSlot[] {
    const slots: AvailableSlot[] = [];
    const slotInterval = 30; // 30-minute intervals

    // Parse working hours
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);
    const [lunchStartHour, lunchStartMinute] = workingHours.lunchStart.split(':').map(Number);
    const [lunchEndHour, lunchEndMinute] = workingHours.lunchEnd.split(':').map(Number);

    // Generate time slots
    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      // Skip lunch time
      if (
        currentHour > lunchStartHour ||
        (currentHour === lunchStartHour && currentMinute >= lunchStartMinute)
      ) {
        if (
          currentHour < lunchEndHour ||
          (currentHour === lunchEndHour && currentMinute < lunchEndMinute)
        ) {
          // Skip this slot (lunch time)
          currentMinute += slotInterval;
          if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60);
            currentMinute = currentMinute % 60;
          }
          continue;
        }
      }

      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      const slotDateTime = `${date}T${timeString}:00`;

      // Check if this slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(appointment => {
        const apptStart = new Date(appointment.date_time);
        const apptEnd = new Date(apptStart.getTime() + appointment.duration * 60000);
        const slotStart = new Date(slotDateTime);
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);

        return (
          (slotStart >= apptStart && slotStart < apptEnd) ||
          (slotEnd > apptStart && slotEnd <= apptEnd) ||
          (slotStart <= apptStart && slotEnd >= apptEnd)
        );
      });

      if (!hasConflict) {
        slots.push({
          date,
          time: timeString,
          professional_id: professional.id,
          professional_name: professional.full_name,
          duration
        });
      }

      // Move to next slot
      currentMinute += slotInterval;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    return slots;
  }
}

