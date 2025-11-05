import React, { useEffect, useState } from 'react'
import { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { MockAuthService, MockUser } from '@/services/mockAuthService'
import { AuthContext, useAuth, Profile, AuthContextType } from './AuthContextBase'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const enableDemoAuth = (import.meta.env.VITE_ENABLE_DEMO_AUTH ?? (import.meta.env.DEV ? 'true' : 'false')) === 'true'

  useEffect(() => {
    if (enableDemoAuth) {
      const mockSession = localStorage.getItem('mockSession')
      if (mockSession) {
        const mockUser = JSON.parse(mockSession) as MockUser
        setUser({ id: mockUser.id, email: mockUser.email } as User)
        setProfile({
          id: mockUser.id,
          email: mockUser.email,
          full_name: mockUser.full_name,
          role: mockUser.role,
          specialty: mockUser.specialty,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        setSession({} as Session)
      }
      setLoading(false)
      return
    }

    // Supabase auth state listener for non-demo mode
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, currentSession: Session | null) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)
    })
    setLoading(false)
    return () => { authListener?.subscription?.unsubscribe() }
  }, [enableDemoAuth])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    // Demo mode: use mock auth
    if (enableDemoAuth) {
      const mockUser = MockAuthService.authenticate(email, password)
      if (mockUser) {
        localStorage.setItem('mockSession', JSON.stringify(mockUser))
        setUser({ id: mockUser.id, email: mockUser.email } as User)
        setProfile({
          id: mockUser.id,
          email: mockUser.email,
          full_name: mockUser.full_name,
          role: mockUser.role,
          specialty: mockUser.specialty,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        setSession({} as Session)
        setLoading(false)
        return { error: null }
      }
    }

    // Non-demo: Supabase authentication only
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      setLoading(false)
      return { error }
    } catch (err: unknown) {
      setLoading(false)
      const error = err instanceof Error ? err : new Error('Unknown error')
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'professional' | 'patient') => {
    setLoading(true)

    if (enableDemoAuth) {
      const newMockUser: MockUser = {
        id: Date.now().toString(),
        email,
        full_name: fullName,
        role,
      }
      console.log('Mock user created:', newMockUser)
      setLoading(false)
      return { error: null }
    }

    // Non-demo: Supabase sign up
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      })
      setLoading(false)
      return { error }
    } catch (err: unknown) {
      setLoading(false)
      const error = err instanceof Error ? err : new Error('Unknown error')
      return { error }
    }
  }

  const signOut = async () => {
    setLoading(true)
    if (enableDemoAuth) {
      localStorage.removeItem('mockSession')
    } else {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
    setSession(null)
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }

    // Mock profile update
    if (profile) {
      const updatedProfile = { ...profile, ...updates }
      setProfile(updatedProfile)
      
      // Update localStorage session
      const mockSession = localStorage.getItem('mockSession')
      if (mockSession) {
        const mockUser = JSON.parse(mockSession) as MockUser
        const updatedMockUser = { ...mockUser, ...updates }
        localStorage.setItem('mockSession', JSON.stringify(updatedMockUser))
      }
    }

    return { error: null }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'professional' | 'patient')[]
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['admin', 'professional', 'patient'],
  fallback = <div>Acesso negado</div>
}) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div>Carregando...</div>
  }

  if (!user || !profile) {
    return <div>Faça login para acessar esta página</div>
  }

  if (!allowedRoles.includes(profile.role)) {
    return fallback
  }

  return <>{children}</>
}
