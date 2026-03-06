import {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
} from 'react'
import Airtable from 'airtable'
import { createAirtableService } from '@/services/airtableService'
import { AIRTABLE_CONFIG } from '@/constants/config'

const AirtableContext = createContext<ReturnType<typeof createAirtableService> | null>(null)

interface AirtableProviderProps {
  children: ReactNode
}
export function AirtableProvider({ children }: AirtableProviderProps) {
  const service = useMemo(() => {
    const base = new Airtable({
      apiKey: AIRTABLE_CONFIG.apiKey,
    }).base(AIRTABLE_CONFIG.baseId)
    return createAirtableService(base)
  }, [])
  return (
    <AirtableContext.Provider value={service}>
      {children}
    </AirtableContext.Provider>
  )
}
