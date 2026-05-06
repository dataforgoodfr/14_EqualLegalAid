import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'

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

const toNum = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/,/g, ''))
    return isNaN(n) ? 0 : n
  }
  return 0
}

const toNumOrNull = (v: unknown): number | null => {
  if (v == null) return null
  return toNum(v)
}

// Handles both integer years (2023) and "YYYY-01-01" date strings
const parseYear = (v: unknown): number => {
  if (typeof v === 'number') return v
  const s = String(v ?? '')
  return parseInt(s.slice(0, 4), 10) || 0
}

const toStr = (v: unknown): string =>
  typeof v === 'string' ? v : String(v ?? '')

const EMPTY_CARD: KeyFigureCard = { label_en: '', label_gr: '', value: null }

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
      // Fetch KeyFigures custom text records + both dynamic data tables in parallel
      const [customTextsRecords, arrivalsGreeceRecords, applicationsRecords] =
        await Promise.all([
          airtableService.fetchRecordsFromTable({
            tableName: 'Indicators_custom_texts',
            selectConfig: {
              filterByFormula:
                "OR({Name}='Intro', {Name}='KeyFigures-Intro',{Name}='KeyFigures-ArrivalsEurope',{Name}='KeyFigures-ArrivalsGreece',{Name}='KeyFigures-ApplicationsGreece',{Name}='KeyFigures-SuccessfulDecisions')",
              },
          }),
          airtableService.fetchRecordsFromTable({
            tableName: 'v2_ind3_arrivals_greece',
            selectConfig: { fields: ['year', 'total_arrivals'] },
          }),
          airtableService.fetchRecordsFromTable({
            tableName: 'ind5_total_applications_in_greece',
            selectConfig: { fields: ['year', 'applications_for_international_protection'] },
          }),
        ])

      // Index custom texts by Name
      const byName = new Map(
        customTextsRecords.map(r => [toStr(r.fields['Name']), r]),
      )

      const intro = byName.get('Intro')
      const lastUpdatedOn = byName.get('KeyFigures-Intro');
      const europeRec = byName.get('KeyFigures-ArrivalsEurope')
      const greeceRec = byName.get('KeyFigures-ArrivalsGreece')
      const appRec = byName.get('KeyFigures-ApplicationsGreece')
      const decisionsRec = byName.get('KeyFigures-SuccessfulDecisions')

      // Dynamic: total arrivals Greece — latest year with total_arrivals > 0
      const validArrivalRecords = arrivalsGreeceRecords.filter(
        r => toNum(r.fields['total_arrivals']) > 0,
      )
      let arrivalsGreeceValue: number | null = null
      if (validArrivalRecords.length > 0) {
        const maxYear = Math.max(...validArrivalRecords.map(r => toNum(r.fields['year'])))
        arrivalsGreeceValue = validArrivalRecords
          .filter(r => toNum(r.fields['year']) === maxYear)
          .reduce((sum, r) => sum + toNum(r.fields['total_arrivals']), 0)
      }

      // Dynamic: asylum applications Greece — latest year with non-zero applications
      // year field may be an integer or a "YYYY-01-01" date string depending on the table
      const validAppRecords = applicationsRecords.filter(
        r => toNum(r.fields['applications_for_international_protection']) > 0,
      )
      let applicationsValue: number | null = null
      if (validAppRecords.length > 0) {
        const maxYear = Math.max(...validAppRecords.map(r => parseYear(r.fields['year'])))
        const latestRecord = validAppRecords.find(r => parseYear(r.fields['year']) === maxYear)
        if (latestRecord) {
          applicationsValue = toNum(latestRecord.fields['applications_for_international_protection'])
        }
      }

      setData({
        title_en: toStr(intro?.fields['Title_EN']),
        title_gr: toStr(intro?.fields['Title_GR']),
        subtitle_en: toStr(intro?.fields['Subtitle_EN']),
        subtitle_gr: toStr(intro?.fields['Subtitle_GR']),
        last_updated_title_en: toStr(lastUpdatedOn?.fields['Title_EN']),
        last_updated_title_gr: toStr(lastUpdatedOn?.fields['Title_GR']),
        last_updated_on: toStr(lastUpdatedOn?.fields['Last_updated_on']),
        arrivalsEurope: {
          label_en: toStr(europeRec?.fields['Title_EN']),
          label_gr: toStr(europeRec?.fields['Title_GR']),
          value: europeRec ? toNumOrNull(europeRec.fields['Fixed_figure']) : null,
        },
        arrivalsGreece: {
          label_en: toStr(greeceRec?.fields['Title_EN']),
          label_gr: toStr(greeceRec?.fields['Title_GR']),
          value: arrivalsGreeceValue,
        },
        applicationsGreece: {
          label_en: toStr(appRec?.fields['Title_EN']),
          label_gr: toStr(appRec?.fields['Title_GR']),
          value: applicationsValue,
        },
        successfulDecisions: {
          label_en: toStr(decisionsRec?.fields['Title_EN']),
          label_gr: toStr(decisionsRec?.fields['Title_GR']),
          value: decisionsRec ? toNumOrNull(decisionsRec.fields['Fixed_figure']) : null,
        },
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
