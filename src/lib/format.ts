export const fmtNum = (n: number): string =>
  Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',')

export const parseKg = (s: string): number => parseFloat(s.replace(',', '.'))

export const fmtRest = (sec: number): string =>
  sec >= 60 ? `${Math.floor(sec / 60)}min${sec % 60 ? ` ${sec % 60}s` : ''}` : `${sec}s`

export const fmtClock = (s: number): string => {
  s = Math.max(0, Math.floor(s))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

let counter = 0
export const uid = (prefix = 'id'): string => `${prefix}-${Date.now().toString(36)}-${counter++}`
