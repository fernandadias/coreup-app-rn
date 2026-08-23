import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { loadAnamnese, saveAnamnese, clearAnamnese } from '../storage/perfil'
import type { Anamnese, Plano } from '../data/types'

interface PerfilContextValue {
  /** null = ainda não preenchida → gate manda pra tela de Anamnese. */
  anamnese: Anamnese | null
  /** v1: todas as testadoras são alunas da consultoria. Vem daqui, não hardcoded na tela. */
  plano: Plano
  nome: string
  loading: boolean
  salvarAnamnese: (a: Anamnese) => Promise<void>
  resetAnamnese: () => Promise<void>
}

const PerfilContext = createContext<PerfilContextValue | null>(null)

export function PerfilProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth()
  const [anamnese, setAnamnese] = useState<Anamnese | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    loadAnamnese().then((a) => {
      if (alive) {
        setAnamnese(a)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const salvarAnamnese = async (a: Anamnese) => {
    await saveAnamnese(a)
    setAnamnese(a)
  }

  const resetAnamnese = async () => {
    await clearAnamnese()
    setAnamnese(null)
  }

  const nome =
    (session?.user.user_metadata?.nome as string | undefined)?.trim() ||
    session?.user.email?.split('@')[0] ||
    'Aluna'

  return (
    <PerfilContext.Provider value={{ anamnese, plano: 'aluna', nome, loading, salvarAnamnese, resetAnamnese }}>
      {children}
    </PerfilContext.Provider>
  )
}

export function usePerfil(): PerfilContextValue {
  const ctx = useContext(PerfilContext)
  if (!ctx) throw new Error('usePerfil precisa estar dentro de <PerfilProvider>')
  return ctx
}
