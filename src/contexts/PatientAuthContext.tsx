import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { PatientAuthContext, PatientAuthContextType, PatientProfile, PatientSession } from './PatientAuthContextBase';

interface PatientAuthProviderProps {
  children: ReactNode;
}

export const PatientAuthProvider: React.FC<PatientAuthProviderProps> = ({ children }) => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [session, setSession] = useState<PatientSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar sessão do localStorage na inicialização
  useEffect(() => {
    const loadStoredSession = () => {
      try {
        const storedSession = localStorage.getItem('patient_session');
        const storedPatient = localStorage.getItem('patient_profile');
        
        if (storedSession && storedPatient) {
          const sessionData = JSON.parse(storedSession);
          const patientData = JSON.parse(storedPatient);
          
          // Verificar se a sessão não expirou
          if (sessionData.expires_at > Date.now()) {
            setSession(sessionData);
            setPatient(patientData);
          } else {
            // Sessão expirada, limpar dados
            localStorage.removeItem('patient_session');
            localStorage.removeItem('patient_profile');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar sessão armazenada:', error);
        localStorage.removeItem('patient_session');
        localStorage.removeItem('patient_profile');
      } finally {
        setLoading(false);
      }
    };

    loadStoredSession();
  }, []);

  

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Primeiro, verificar se o paciente existe
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('email', email)
        .single();

      if (patientError || !patientData) {
        return { success: false, error: 'Paciente não encontrado. Verifique seu email ou entre em contato com a clínica.' };
      }

      // Verificar se o paciente tem acesso ao portal habilitado
      if (!patientData.portal_access_enabled) {
        return { success: false, error: 'Acesso ao portal não habilitado. Entre em contato com a clínica.' };
      }

      // Autenticar com Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email ou senha incorretos.' };
        }
        return { success: false, error: authError.message };
      }

      if (!authData.session) {
        return { success: false, error: 'Erro ao criar sessão.' };
      }

      // Criar sessão do paciente
      const patientSession: PatientSession = {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at ? authData.session.expires_at * 1000 : Date.now() + 3600000,
        patient_id: patientData.id,
      };

      // Preparar perfil do paciente
      const patientProfile: PatientProfile = {
        id: patientData.id,
        full_name: patientData.full_name,
        email: patientData.email,
        phone: patientData.phone,
        birth_date: patientData.birth_date,
        cpf: patientData.cpf,
        avatar_url: patientData.avatar_url,
        address: patientData.address,
        emergency_contact: patientData.emergency_contact,
        medical_info: patientData.medical_info,
        preferences: patientData.preferences || {
          notifications_email: true,
          notifications_sms: false,
          language: 'pt-BR',
        },
      };

      // Armazenar dados
      setSession(patientSession);
      setPatient(patientProfile);
      localStorage.setItem('patient_session', JSON.stringify(patientSession));
      localStorage.setItem('patient_profile', JSON.stringify(patientProfile));

      toast.success(`Bem-vindo(a), ${patientProfile.full_name}!`);
      return { success: true };

    } catch (error) {
      console.error('Erro no login do paciente:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Fazer logout no Supabase Auth
      await supabase.auth.signOut();
      
      // Limpar dados locais
      setSession(null);
      setPatient(null);
      localStorage.removeItem('patient_session');
      localStorage.removeItem('patient_profile');
      
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (data: Partial<PatientProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!patient || !session) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('patients')
        .update(data)
        .eq('id', patient.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Atualizar dados locais
      const updatedPatient = { ...patient, ...data };
      setPatient(updatedPatient);
      localStorage.setItem('patient_profile', JSON.stringify(updatedPatient));

      toast.success('Perfil atualizado com sucesso');
      return { success: true };

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/portal/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      toast.success('Email de recuperação enviado. Verifique sua caixa de entrada.');
      return { success: true };

    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!session) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      toast.success('Senha alterada com sucesso');
      return { success: true };

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    }
  };

  const refreshSession = useCallback(async (): Promise<void> => {
    if (!session) return;

    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: session.refresh_token,
      });

      if (error || !data.session) {
        // Sessão inválida, fazer logout
        await signOut();
        return;
      }

      const newSession: PatientSession = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 3600000,
        patient_id: session.patient_id,
      };

      setSession(newSession);
      localStorage.setItem('patient_session', JSON.stringify(newSession));

    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
      await signOut();
    }
  }, [session, signOut]);

  // Auto-refresh da sessão (posicionado após refreshSession para evitar TDZ)
  useEffect(() => {
    if (session) {
      const timeUntilExpiry = session.expires_at - Date.now();
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000);

      const refreshTimer = setTimeout(() => {
        refreshSession();
      }, refreshTime);

      return () => clearTimeout(refreshTimer);
    }
  }, [session, refreshSession]);

  const value: PatientAuthContextType = {
    patient,
    session,
    loading,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    changePassword,
    refreshSession,
  };

  return (
    <PatientAuthContext.Provider value={value}>
      {children}
    </PatientAuthContext.Provider>
  );
};

export default PatientAuthProvider;
