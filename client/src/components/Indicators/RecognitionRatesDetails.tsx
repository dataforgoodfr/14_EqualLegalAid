import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import type { RecognitionRateRecord } from '@/hooks/useRecognitionRates'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { ChartContainer, ChartTooltipContent, ChartLegendContent, IndicatorInfoButton, CHART_GRID_PROPS, CHART_AXIS_PROPS, CHART_LINE_PROPS } from '@/components/ui'
import type { ChartConfig } from '@/components/ui'
import { useTranslation } from 'react-i18next'

const INTERNATIONAL_COLOR = '#3F9FD8'
const SUBSIDIARY_COLOR = '#04356C'
const REJECTION_COLOR = '#9AD0F2'

function TreeRow({
  label,
  value,
  total,
  depth,
  expandable,
  expanded,
  onToggle,
  isBold,
}: {
  label: string
  value: number
  total: number
  depth: number
  expandable: boolean
  expanded?: boolean
  onToggle?: () => void
  isBold?: boolean
}) {
  const pct = total > 0 ? `${Math.round((value / total) * 100)}%` : '—'
  return (
    <tr
      className={`border-t ${depth === 0 ? 'border-gray-200 bg-gray-50' : 'border-gray-100'} ${expandable ? 'cursor-pointer hover:bg-gray-50' : ''} ${isBold ? 'border-t-2 border-gray-300 font-bold' : ''}`}
      onClick={expandable ? onToggle : undefined}
    >
      <td className="px-4 py-2" style={{ paddingLeft: `${16 + depth * 20}px` }}>
        <span className="flex items-center gap-1">
          {expandable && (
            expanded
              ? <ChevronDown size={14} className="flex-shrink-0 text-gray-400" />
              : <ChevronRight size={14} className="flex-shrink-0 text-gray-400" />
          )}
          {!expandable && depth > 0 && <span className="w-[14px] flex-shrink-0" />}
          <span className={depth === 0 ? 'font-semibold text-gray-800' : 'text-sm text-gray-600'}>
            {label}
          </span>
        </span>
      </td>
      <td className="px-4 py-2 text-right text-sm">{value.toLocaleString('fr-FR')}</td>
      <td className="px-4 py-2 text-right text-sm text-gray-400">{pct}</td>
    </tr>
  )
}

function InstanceTable({ record }: { record: RecognitionRateRecord }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState<Record<'first' | 'second', boolean>>({ first: false, second: true })
  const toggle = (key: 'first' | 'second') => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const total = record.total_first + record.total_second

  return (
    <div className="min-w-0 overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-[#04356C] text-xs tracking-wide text-white uppercase">
          <tr>
            <th className="px-4 py-2 text-left">{t('statistics.decisionType')}</th>
            <th className="px-4 py-2 text-right">{t('statistics.count')}</th>
            <th className="px-4 py-2 text-right">%</th>
          </tr>
        </thead>
        <tbody>
          <TreeRow
            label={t('statistics.firstInstanceDecisions')}
            value={record.total_first}
            total={total}
            depth={0}
            expandable
            expanded={expanded.first}
            onToggle={() => toggle('first')}
          />
          {expanded.first && (
            <>
              <TreeRow label={t('statistics.refugeeStatus')} value={record.refugee_status_first} total={total} depth={1} expandable={false} />
              <TreeRow label={t('statistics.subsidiaryProtection')} value={record.subsidiary_protection_first} total={total} depth={1} expandable={false} />
              <TreeRow label={t('statistics.rejected')} value={record.rejected_first} total={total} depth={1} expandable={false} />
            </>
          )}

          <TreeRow
            label={t('statistics.appealsDecisions')}
            value={record.total_second}
            total={total}
            depth={0}
            expandable
            expanded={expanded.second}
            onToggle={() => toggle('second')}
          />
          {expanded.second && (
            <>
              <TreeRow label={t('statistics.refugeeStatus')} value={record.refugee_status_second} total={total} depth={1} expandable={false} />
              <TreeRow label={t('statistics.subsidiaryProtection')} value={record.subsidiary_protection_second} total={total} depth={1} expandable={false} />
              <TreeRow label={t('statistics.rejected')} value={record.rejected_second} total={total} depth={1} expandable={false} />
            </>
          )}

          <TreeRow
            label={t('statistics.totalDecisions')}
            value={total}
            total={total}
            depth={0}
            expandable={false}
            isBold
          />
        </tbody>
      </table>
    </div>
  )
}

export function RecognitionRatesDetails({
  records,
  loading,
  error,
  customText,
}: {
  records: RecognitionRateRecord[]
  loading: boolean
  error: string | null
  customText?: IndicatorCustomText | null
}) {
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'

  const chartConfig = {
    international_protection_rate: { label: t('statistics.internationalProtectionRate'), color: INTERNATIONAL_COLOR },
    subsidiary_protection_rate: { label: t('statistics.subsidiaryProtectionRate'), color: SUBSIDIARY_COLOR },
    rejection_rate: { label: t('statistics.rejectionRate'), color: REJECTION_COLOR },
  } satisfies ChartConfig

  const firstYear = records[0]?.year
  const lastYear = records[records.length - 1]?.year

  const totalInternational = useMemo(
    () => records.reduce((sum, r) => sum + r.refugee_status_first + r.refugee_status_second, 0),
    [records],
  )
  const totalSubsidiary = useMemo(
    () => records.reduce((sum, r) => sum + r.subsidiary_protection_first + r.subsidiary_protection_second, 0),
    [records],
  )

  const [selectedYear, setSelectedYear] = useState<number>(lastYear ?? 0)
  const selectedRecord = useMemo(
    () => records.find(r => r.year === selectedYear) ?? records[records.length - 1],
    [records, selectedYear],
  )

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.overallProtectionRate')
  const subtitle = isGr ? customText?.subtitle_gr : customText?.subtitle_en
  const explanatoryTitle = isGr ? customText?.explanatory_text_title_gr : customText?.explanatory_text_title_en
  const explanatoryText = isGr ? customText?.explanatory_text_gr : customText?.explanatory_text_en
  const information = isGr ? customText?.information_gr : customText?.information_en

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />
  if (records.length === 0) return <p className="text-muted-foreground text-sm p-6">{t('statistics.noData')}</p>

  return (
    <div className="mx-auto my-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Card header */}
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: '#04356C' }}>{title}</h2>
            <IndicatorInfoButton text={information} />
          </div>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        </div>

        {/* Card body */}
        <div className="space-y-6 p-6">

          {/* Explanatory text */}
          {(explanatoryTitle || explanatoryText) && (
            <div className="rounded-lg bg-gray-50 px-4 py-4 space-y-1.5">
              {explanatoryTitle && (
                <h3 className="text-sm font-semibold" style={{ color: '#04356C' }}>{explanatoryTitle}</h3>
              )}
              {explanatoryText && (
                <p className="text-muted-foreground text-sm leading-relaxed">{explanatoryText}</p>
              )}
            </div>
          )}

          {/* Key figures */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-5">
              <p className="text-sm text-gray-600">
                {t('statistics.totalGrantingInternationalProtection')}
              </p>
              <p className="mt-2 text-4xl font-bold text-gray-900 leading-none tabular-nums">
                {totalInternational.toLocaleString('fr-FR')}
              </p>
              <p className="mt-1 text-xs text-gray-500">{firstYear}–{lastYear}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-5">
              <p className="text-sm text-gray-600">
                {t('statistics.totalGrantingSubsidiaryProtection')}
              </p>
              <p className="mt-2 text-4xl font-bold text-gray-900 leading-none tabular-nums">
                {totalSubsidiary.toLocaleString('fr-FR')}
              </p>
              <p className="mt-1 text-xs text-gray-500">{firstYear}–{lastYear}</p>
            </div>
          </div>

          {/* Data table by instance */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-gray-700">{t('statistics.decisionsByInstance')}</h3>
              <select
                className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm"
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
              >
                {[...records].reverse().map(r => <option key={r.year} value={r.year}>{r.year}</option>)}
              </select>
            </div>
            {selectedRecord && <InstanceTable record={selectedRecord} />}
          </div>

          {/* Evolution chart */}
          <div>
            <h3 className="mb-2 text-sm font-bold text-gray-900">{t('statistics.evolutionOfDecisionsAllInstances')}</h3>
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <LineChart data={records}>
                <CartesianGrid {...CHART_GRID_PROPS} />
                <XAxis dataKey="year" {...CHART_AXIS_PROPS} />
                <YAxis unit="%" domain={[0, 100]} {...CHART_AXIS_PROPS} />
                <Tooltip
                  content={(
                    <ChartTooltipContent
                      labelFormatter={label => t('statistics.yearLabel', { year: label })}
                    />
                  )}
                />
                <Legend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="international_protection_rate" stroke={chartConfig.international_protection_rate.color} {...CHART_LINE_PROPS} />
                <Line type="monotone" dataKey="subsidiary_protection_rate" stroke={chartConfig.subsidiary_protection_rate.color} {...CHART_LINE_PROPS} />
                <Line type="monotone" dataKey="rejection_rate" stroke={chartConfig.rejection_rate.color} {...CHART_LINE_PROPS} />
              </LineChart>
            </ChartContainer>
          </div>
        </div>

        {/* Card footer */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="space-y-1 border-t border-gray-100 bg-gray-50/60 px-6 py-3 text-xs text-gray-500">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              {customText.source && (
                <span>
                  <span className="font-medium text-gray-600">{t('statistics.source')}:</span>
                  {' '}
                  <a href={customText.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800 transition-colors">
                    {customText.source}
                  </a>
                </span>
              )}
              {customText.last_updated_on && (
                <span>
                  <span className="font-medium text-gray-600">{t('statistics.lastUpdated')}:</span>
                  {' '}
                  {customText.last_updated_on}
                </span>
              )}
            </div>
            {customText.sourceText && (
              <p className="italic text-gray-400">{customText.sourceText}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
