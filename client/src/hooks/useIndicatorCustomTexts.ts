import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'

export interface IndicatorCustomText {
  id: string
  title_en: string
  title_gr: string
  subtitle_en: string
  subtitle_gr: string
  explanatory_text_title_en: string
  explanatory_text_title_gr: string
  explanatory_text_en: string
  explanatory_text_gr: string
  source: string
  last_updated_on: string
}

const toStr = (v: unknown): string =>
  typeof v === 'string' ? v : String(v ?? '')

export const useIndicatorCustomTexts = () => {
  const airtableService = useAirtableService()
  const [records, setRecords] = useState<IndicatorCustomText[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const raw = await airtableService.fetchRecordsFromTable({
        tableName: 'Indicators_custom_texts',
        selectConfig: { maxRecords: 100 },
      })
      const parsed: IndicatorCustomText[] = raw.map(r => ({
        id: r.id,
        title_en: toStr(r.fields['Title_EN']),
        title_gr: toStr(r.fields['Title_GR']),
        subtitle_en: toStr(r.fields['Subtitle_EN']),
        subtitle_gr: toStr(r.fields['Subtitle_GR']),
        explanatory_text_title_en: toStr(r.fields['Explanatory_text_title_EN']),
        explanatory_text_title_gr: toStr(r.fields['Explanatory_text_title_GR']),
        explanatory_text_en: toStr(r.fields['Explanatory_text_EN']),
        explanatory_text_gr: toStr(r.fields['Explanatory_text_GR']),
        source: toStr(r.fields['Source']),
        last_updated_on: toStr(r.fields['Last_updated_on']),
      }))
      setRecords(parsed)
    }
    catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch indicator texts')
    }
    finally {
      setLoading(false)
    }
  }, [airtableService])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  return { records, loading, error }
}
