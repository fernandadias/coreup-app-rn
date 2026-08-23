import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { fetchProgramaRemoto, resgatarAluno, type ProgramaRemoto } from '../api/programa'
import { loadProgramaCache, saveProgramaCache } from '../storage/programa'
import { hidratarRotina } from '../data/programa'
import { programa as seedPrograma, getTreino as seedGetTreino, treinoA } from '../data/seed'
import type { RotinaResumo, TreinoData } from '../data/types'

interface ProgramaContextValue {
  /** Conta ligada a uma aluna do dash. false → tela de código. */
  vinculado: boolean
  loading: boolean
  programa: RotinaResumo[]
  coachNote: string
  getTreino: (id: string) => TreinoData | null
  /** Liga a conta via código da consultoria (app_token). Refetch no sucesso. */
  resgatar: (codigo: string) => Promise<{ ok: boolean; erro?: string }>
  refresh: () => Promise<void>
}

const ProgramaContext = createContext<ProgramaContextValue | null>(null)

export function ProgramaProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth()
  const [remoto, setRemoto] = useState<ProgramaRemoto | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const r = await fetchProgramaRemoto().catch(() => null)
    if (r) {
      setRemoto(r)
      await saveProgramaCache(r)
    }
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const cache = await loadProgramaCache() // offline-first: mostra o cache já
      if (alive && cache) setRemoto(cache)
      const r = await fetchProgramaRemoto().catch(() => null)
      if (alive && r) {
        setRemoto(r)
        await saveProgramaCache(r)
      }
      if (alive) setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [session?.user.id])

  // usa o programa real quando há plano; senão cai no seed (dev / plano ainda não montado)
  const temReal = !!remoto?.vinculado && remoto.programa.length > 0
  const programa = temReal ? remoto!.programa : seedPrograma
  const coachNote = temReal ? remoto!.coachNote : treinoA.coachNote

  const getTreino = useCallback(
    (id: string): TreinoData | null => {
      const r = remoto?.rotinas?.[id]
      return r ? hidratarRotina(r) : seedGetTreino(id)
    },
    [remoto]
  )

  const resgatar = useCallback(
    async (codigo: string) => {
      const res = await resgatarAluno(codigo)
      if (res.ok) await refresh()
      return res
    },
    [refresh]
  )

  return (
    <ProgramaContext.Provider
      value={{ vinculado: !!remoto?.vinculado, loading, programa, coachNote, getTreino, resgatar, refresh }}
    >
      {children}
    </ProgramaContext.Provider>
  )
}

export function usePrograma(): ProgramaContextValue {
  const ctx = useContext(ProgramaContext)
  if (!ctx) throw new Error('usePrograma precisa estar dentro de <ProgramaProvider>')
  return ctx
}
