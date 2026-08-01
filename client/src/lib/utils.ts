import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toNum = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const trimmed = v.trim()
    // A lone comma followed by 1-2 digits is a decimal separator (French
    // locale, e.g. an Airtable formula field formatted as "1,90"), not a
    // thousands grouping — a real thousands group is always exactly 3 digits
    // (e.g. "1,234"), so it can't be confused with one.
    if (/^-?\d+,\d{1,2}$/.test(trimmed)) {
      const n = parseFloat(trimmed.replace(',', '.'))
      return isNaN(n) ? 0 : n
    }
    const n = parseFloat(trimmed.replace(/,/g, ''))
    return isNaN(n) ? 0 : n
  }
  return 0
}

export const toStr = (v: unknown): string =>
  typeof v === 'string' ? v : String(v ?? '')
