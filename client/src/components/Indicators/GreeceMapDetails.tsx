import { useState } from 'react'
import type { yearRegionMapOfMap } from '@/hooks/useAsylumSeekerByRegionOfGreece'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

type year = number | null

export function GreeceMapDetails({ records, loading, error }: { records: yearRegionMapOfMap, loading: boolean, error: string | null }) {
  const { t } = useTranslation()
  const [selectedYear, setSelectedYear] = useState<year>(null)

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  { /* ───────── Example of records list item ────────── */ }
  // asylum_seekers: 1578
  // region: "Thessaly"
  // year: 2026

  const yearList = [...records?.keys() ?? []]

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
          {yearList?.map(y => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
