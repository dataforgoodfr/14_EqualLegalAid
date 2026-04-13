import { Separator } from '@/components/ui/separator'
import type { MapIndicatorRecord } from '@/hooks/useMapIndicators'
import { useTranslation } from 'react-i18next'

interface Props {
  record: MapIndicatorRecord
  perCapita: boolean
}

export function CountryMapPopup({ record, perCapita }: Props) {
  const { t } = useTranslation()
  const fmt = (n: number) =>
    perCapita
      ? n.toLocaleString('en-US', { maximumFractionDigits: 2 })
      : n.toLocaleString('en-US')

  const rows = [
    {
      label: t('statistics.totalApplicants'),
      value: perCapita ? record.total_applicants_per_capita : record.total_applicants,
    },
    {
      label: t('statistics.firstTimeShort'),
      value: perCapita ? record.first_time_applicants_per_capita : record.first_time_applicants,
    },
    {
      label: t('statistics.subsequent'),
      value: perCapita ? record.subsequent_applicants_per_capita : record.subsequent_applicants,
    },
  ]

  return (
    <div className="w-48 font-sans">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">{record.name_country}</span>
        <span className="text-muted-foreground text-xs">{record.year}</span>
      </div>
      <Separator className="mb-2" />
      {perCapita && (
        <p className="text-muted-foreground mb-1.5 text-[11px] italic">{t('statistics.perCapita')}</p>
      )}
      <dl className="space-y-1.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-xs font-semibold tabular-nums">{fmt(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
