import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'
import { MockAuthService, MockUser } from '@/services/mockAuthService'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string, role: 'professional' | 'patient') => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing mock session in localStorage
    const mockSession = localStorage.getItem('mockSession')
    if (mockSession) {
      const mockUser = JSON.parse(mockSession) as MockUser
      setUser({
        id: mockUser.id,
        email: mockUser.email,
      } as User)
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
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    
    // Try mock authentication first for development
    const mockUser = MockAuthService.authenticate(email, password)
    if (mockUser) {
      localStorage.setItem('mockSession', JSON.stringify(mockUser))
      setUser({
        id: mockUser.id,
        email: mockUser.email,
      } as User)
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

    // Fallback to Supabase authentication
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      setLoading(false)
      return { error }
    } catch (err) {
      setLoading(false)
      return { error: new Error('Erro de conexão. Usando modo de demonstração.') }
    }
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'professional' | 'patient') => {
    setLoading(true)
    
    // Mock signup for development
    const newMockUser: MockUser = {
      id: Date.now().toString(),
      email,
      full_name: fullName,
      role,
    }
    
    // In a real app, this would be saved to a database
    console.log('Mock user created:', newMockUser)
    
    setLoading(false)
    return { error: null }
  }

  const signOut = async () => {
    setLoading(true)
    localStorage.removeItem('mockSession')
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