import React, { createContext, useContext } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']

export interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>
  signUp: (email: string, password: string, fullName: string, role: 'professional' | 'patient') => Promise<{ error: AuthError | Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

