import { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthResult {
  error: string | null
  info?: string | null
}

interface AuthContextValue {
  session: Session | null
  loading: boolean
  signInEmail: (email: string, senha: string) => Promise<AuthResult>
  signUpEmail: (email: string, senha: string, nome: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const signInEmail: AuthContextValue['signInEmail'] = async (email, senha) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    return { error: error ? traduzir(error.message) : null }
  }

  const signUpEmail: AuthContextValue['signUpEmail'] = async (email, senha, nome) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: { data: { nome: nome.trim() } },
    })
    if (error) return { error: traduzir(error.message) }
    // sem sessão = o projeto exige confirmação de e-mail
    if (!data.session) return { error: null, info: 'Conta criada! Confirme o e-mail pra entrar.' }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, loading, signInEmail, signUpEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}

// mensagens de erro do Supabase em pt-BR (as mais comuns)
function traduzir(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Esse e-mail já tem conta.'
  if (m.includes('password should be at least')) return 'A senha é muito curta.'
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'E-mail inválido.'
  if (m.includes('email not confirmed')) return 'Confirme o e-mail antes de entrar.'
  return msg
}
