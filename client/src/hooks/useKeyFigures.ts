import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import type { AirtableRecord } from '@/types'

export interface KeyFigureCard {
  label_en: string
  label_gr: string
  value: number | null
}

export interface KeyFiguresData {
  title_en: string
  title_gr: string
  subtitle_en: string
  subtitle_gr: string
  last_updated_title_en: string
  last_updated_title_gr: string
  last_updated_on: string
  arrivalsEurope: KeyFigureCard
  arrivalsGreece: KeyFigureCard
  applicationsGreece: KeyFigureCard
  successfulDecisions: KeyFigureCard
  loading: boolean
  error: string | null
}

const toNumOrNull = (v: unknown): number | null => {
  if (v == null) return null
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/,/g, ''))
    return isNaN(n) ? null : n
  }
  return null
}

const toStr = (v: unknown): string =>
  typeof v === 'string' ? v : String(v ?? '')

const EMPTY_CARD: KeyFigureCard = { label_en: '', label_gr: '', value: null }

const cardFrom = (rec?: AirtableRecord): KeyFigureCard => ({
  label_en: toStr(rec?.fields['Title_EN']),
  label_gr: toStr(rec?.fields['Title_GR']),
  value: rec ? toNumOrNull(rec.fields['Fixed_figure']) : null,
})

const initialState: KeyFiguresData = {
  title_en: '',
  title_gr: '',
  subtitle_en: '',
  subtitle_gr: '',
  last_updated_title_en: '',
  last_updated_title_gr: '',
  last_updated_on: '',
  arrivalsEurope: EMPTY_CARD,
  arrivalsGreece: EMPTY_CARD,
  applicationsGreece: EMPTY_CARD,
  successfulDecisions: EMPTY_CARD,
  loading: true,
  error: null,
}

export const useKeyFigures = () => {
  const airtableService = useAirtableService()
  const [data, setData] = useState<KeyFiguresData>(initialState)

  const fetchAll = useCallback(async () => {
    try {
      const customTextsRecords = await airtableService.fetchRecordsFromTable({
        tableName: 'Indicators_custom_texts',
        selectConfig: {
          filterByFormula:
            "OR({Name}='Intro', {Name}='KeyFigures-Intro',{Name}='KeyFigures-ArrivalsEurope',{Name}='KeyFigures-ArrivalsGreece',{Name}='KeyFigures-ApplicationsGreece',{Name}='KeyFigures-SuccessfulDecisions')",
        },
      })

      // Index custom texts by Name
      const byName = new Map(
        customTextsRecords.map(r => [toStr(r.fields['Name']), r]),
      )

      const intro = byName.get('Intro')
      const lastUpdatedOn = byName.get('KeyFigures-Intro')

      setData({
        title_en: toStr(intro?.fields['Title_EN']),
        title_gr: toStr(intro?.fields['Title_GR']),
        subtitle_en: toStr(intro?.fields['Subtitle_EN']),
        subtitle_gr: toStr(intro?.fields['Subtitle_GR']),
        last_updated_title_en: toStr(lastUpdatedOn?.fields['Title_EN']),
        last_updated_title_gr: toStr(lastUpdatedOn?.fields['Title_GR']),
        last_updated_on: toStr(lastUpdatedOn?.fields['Last_updated_on']),
        arrivalsEurope: cardFrom(byName.get('KeyFigures-ArrivalsEurope')),
        arrivalsGreece: cardFrom(byName.get('KeyFigures-ArrivalsGreece')),
        applicationsGreece: cardFrom(byName.get('KeyFigures-ApplicationsGreece')),
        successfulDecisions: cardFrom(byName.get('KeyFigures-SuccessfulDecisions')),
        loading: false,
        error: null,
      })
    }
    catch (err) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch key figures',
      }))
    }
  }, [airtableService])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return data
}
