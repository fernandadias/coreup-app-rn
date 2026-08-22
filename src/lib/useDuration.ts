import { useEffect, useState } from 'react'

// segundos decorridos desde startedAt, atualizado a cada 1s
export function useDuration(startedAt: number): number {
  const [elapsed, setElapsed] = useState(() => Math.floor((Date.now() - startedAt) / 1000))
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(id)
  }, [startedAt])
  return elapsed
}
