import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'

export interface AnnulmentRecord {
  id: string
  year: number
  applications_for_annulment_submitted: number
  positive_decisions: number
  negative_decisions_on_the_merits: number
  negative_decisions_on_admissibility_grounds: number
  negative_decisions_or_withdrawals: number
}

export interface InterimMeasuresRecord {
  id: string
  year: number
  interim_measures_submitted: number
  decisions_interim_measures: number
}

export interface LegalAidApplicationRecord {
  id: string
  year: number
  apps_legal_aid_submitted: number
  positive_decisions_legal_aid: number
  negative_decisions_legal_aid: number
}

const toNum = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/,/g, ''))
    return isNaN(n) ? 0 : n
  }
  return 0
}

const toStr = (v: unknown): string =>
  typeof v === 'string' ? v : String(v ?? '')

// year is stored as a date (format varies by table, e.g. "2021-01-01" or "01/01/2024")
const parseYear = (v: unknown): number => {
  const d = new Date(toStr(v))
  return isNaN(d.getTime()) ? 0 : d.getFullYear()
}

export function useCourtAsylumProcedures() {
  const airtableService = useAirtableService()
  const [annulments, setAnnulments] = useState<AnnulmentRecord[]>([])
  const [interimMeasures, setInterimMeasures] = useState<InterimMeasuresRecord[]>([])
  const [legalAid, setLegalAid] = useState<LegalAidApplicationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async() => {
    try {
      setLoading(true)
      setError(null)
      const [rawAnnulments, rawInterim, rawLegalAid] = await Promise.all([
        airtableService.fetchRecordsFromTable({
          tableName: 'ind11_ind13_annulments',
          selectConfig: { maxRecords: 1000 },
        }),
        airtableService.fetchRecordsFromTable({
          tableName: 'ind12_interim_measures',
          selectConfig: { maxRecords: 1000 },
        }),
        airtableService.fetchRecordsFromTable({
          tableName: 'ind14_legal_aid_applications',
          selectConfig: { maxRecords: 1000 },
        }),
      ])

      const parsedAnnulments: AnnulmentRecord[] = rawAnnulments
        .filter(r => toStr(r.fields['city']) === 'TOTAL')
        .map(r => ({
          id: r.id,
          year: parseYear(r.fields['year']),
          applications_for_annulment_submitted: toNum(r.fields['applications_for_annulment_submitted']),
          positive_decisions: toNum(r.fields['positive_decisions']),
          negative_decisions_on_the_merits: toNum(r.fields['negative_decisions_on_the_merits']),
          negative_decisions_on_admissibility_grounds: toNum(r.fields['negative_decisions_on_admissibility_grounds']),
          negative_decisions_or_withdrawals: toNum(r.fields['negative_decisions_or_withdrawals']),
        }))
        .filter(r => r.year > 0)
        .sort((a, b) => a.year - b.year)

      const parsedInterim: InterimMeasuresRecord[] = rawInterim
        .filter(r => toStr(r.fields['city']) === 'TOTAL')
        .map(r => ({
          id: r.id,
          year: parseYear(r.fields['year']),
          interim_measures_submitted: toNum(r.fields['interim_measures_submitted']),
          decisions_interim_measures: toNum(r.fields['decisions_interim_measures']),
        }))
        .filter(r => r.year > 0)
        .sort((a, b) => a.year - b.year)

      const parsedLegalAid: LegalAidApplicationRecord[] = rawLegalAid
        .filter(r => toStr(r.fields['city']) === 'TOTAL')
        .map(r => ({
          id: r.id,
          year: parseYear(r.fields['year']),
          apps_legal_aid_submitted: toNum(r.fields['apps_legal_aid_submitted']),
          positive_decisions_legal_aid: toNum(r.fields['positive_decisions_legal_aid']),
          negative_decisions_legal_aid: toNum(r.fields['negative_decisions_legal_aid']),
        }))
        .filter(r => r.year > 0)
        .sort((a, b) => a.year - b.year)

      setAnnulments(parsedAnnulments)
      setInterimMeasures(parsedInterim)
      setLegalAid(parsedLegalAid)
    }
    catch(err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch court asylum procedures data')
    }
    finally {
      setLoading(false)
    }
  }, [airtableService])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  return { annulments, interimMeasures, legalAid, loading, error }
}
