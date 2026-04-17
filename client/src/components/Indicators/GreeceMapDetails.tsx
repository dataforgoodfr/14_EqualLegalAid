import { useState } from 'react'
import type { AsylumSeekerByRegionOfGreeceRecord } from '@/hooks/useAsylumSeekerByRegionOfGreece'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

export function GreeceMapDetails({ records, loading, error }: { records: AsylumSeekerByRegionOfGreeceRecord[], loading: boolean, error: string | null }) {
  const { t } = useTranslation()
  const [selectedYear, setSelectedYear] = useState<number | null>(2020)

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  { /* ───────── Example of reocords list item ────────── */ }
  // asylum_seekers: 1578
  // region: "Thessaly"
  // year: 2026

  const yearList: number[] = [2025, 2026]
  const selectedYearRecords = [
    {
      asylum_seekers: 10,
      region: 'A',
      year: 2000,
    },
    {
      asylum_seekers: 20,
      region: 'B',
      year: 2010,
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold" style={{ color: '#04356C' }}>
        {/* {t('statistics.asylumEvolutionGreece')} */}
        Number of asylum seekers living in camps
      </h1>

      { /* Year selector */ }
      <Select
        value={selectedYear?.toString() ?? ''}
        onValueChange={(selectedValue) => {
          setSelectedYear(Number(selectedValue))
        }}
        disabled={loading || yearList.length === 0}
      >
        <SelectTrigger size="sm" className="w-24">
          <SelectValue placeholder={t('statistics.year')} />
        </SelectTrigger>
        <SelectContent>
          {yearList.map(y => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
