import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip as PieTooltip, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import type { AnnulmentRecord, InterimMeasuresRecord, LegalAidApplicationRecord } from '@/hooks/useCourtAsylumProcedures'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { ChartContainer, ChartTooltipContent, ChartLegendContent, IndicatorInfoButton } from '@/components/ui'
import type { ChartConfig } from '@/components/ui'
import { useTranslation } from 'react-i18next'

const GRANTED_COLOR = '#3F9FD8'
const REJECTED_COLOR = '#04356C'
const INADMISSIBLE_COLOR = '#6BB8E8'
const WITHDRAWALS_COLOR = '#9AD0F2'

type AnnulmentsView = 'total' | 'onMerit'

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

function AnnulmentsCard({ records }: { records: AnnulmentRecord[] }) {
  const { t } = useTranslation()
  const years = useMemo(() => records.map(r => r.year), [records])
  const latestYear = years[years.length - 1]
  const [selectedYear, setSelectedYear] = useState<number>(latestYear ?? 0)
  const [view, setView] = useState<AnnulmentsView>('total')
  const [expandedRejected, setExpandedRejected] = useState(true)

  const data = useMemo(() => records.find(r => r.year === selectedYear), [records, selectedYear])

  const isTotalView = view === 'total'
  const granted = data?.positive_decisions ?? 0
  const rejectedTotal = data
    ? data.negative_decisions_on_the_merits + data.negative_decisions_on_admissibility_grounds + data.negative_decisions_or_withdrawals
    : 0
  const rejected = isTotalView ? rejectedTotal : (data?.negative_decisions_on_the_merits ?? 0)
  const total = granted + rejected

  const donutData = useMemo(() => [
    { name: t('statistics.granted'), value: granted, color: GRANTED_COLOR },
    { name: t('statistics.rejected'), value: rejected, color: REJECTED_COLOR },
  ].filter(d => d.value > 0), [granted, rejected, t])

  if (!data) return <p className="text-muted-foreground p-6 text-sm">{t('statistics.noData')}</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-700">{t('statistics.applicationsForAnnulment')}</h3>
        <div className="flex gap-2">
          <select
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {[...years].reverse().map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm"
            value={view}
            onChange={e => setView(e.target.value as AnnulmentsView)}
          >
            <option value="total">{t('statistics.total')}</option>
            <option value="onMerit">{t('statistics.onTheMerit')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Tree table */}
        <div className="min-w-0 overflow-x-auto rounded-lg border border-gray-200 lg:col-span-3">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs tracking-wide text-gray-600 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">{t('statistics.decisionType')}</th>
                <th className="px-4 py-2 text-right">{t('statistics.count')}</th>
                <th className="px-4 py-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              <TreeRow
                label={t('statistics.protectionGranted')}
                value={granted}
                total={total}
                depth={0}
                expandable={false}
              />

              <TreeRow
                label={t('statistics.protectionRejected')}
                value={rejected}
                total={total}
                depth={0}
                expandable={isTotalView}
                expanded={isTotalView && expandedRejected}
                onToggle={() => setExpandedRejected(prev => !prev)}
              />
              {isTotalView && expandedRejected && (
                <>
                  <TreeRow label={t('statistics.rejectionOnMerits')} value={data.negative_decisions_on_the_merits} total={total} depth={1} expandable={false} />
                  <TreeRow label={t('statistics.rejectionInadmissible')} value={data.negative_decisions_on_admissibility_grounds} total={total} depth={1} expandable={false} />
                  <TreeRow label={t('statistics.withdrawalsArchived')} value={data.negative_decisions_or_withdrawals} total={total} depth={1} expandable={false} />
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

        {/* Donut panel */}
        <div className="flex flex-col items-center justify-start gap-4 lg:col-span-2">
          <p className="mb-4 text-sm font-bold text-gray-900">{t('statistics.protectionDecisions')}</p>
          <ChartContainer config={{}} className="h-52 w-full">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                labelLine={false}
              >
                {donutData.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <PieTooltip formatter={value => (value != null ? Number(value).toLocaleString('fr-FR') : '')} />
            </PieChart>
          </ChartContainer>
          <div className="w-full space-y-2 px-2">
            {donutData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-sm text-gray-700">{d.name}</span>
                <span className="ml-auto text-sm font-semibold text-gray-800">{d.value.toLocaleString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AnnulmentApplicationsLineChart({ records }: { records: AnnulmentRecord[] }) {
  const { t } = useTranslation()
  const chartConfig = {
    applications_for_annulment_submitted: {
      label: t('statistics.annulmentApplication'),
      color: GRANTED_COLOR,
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <LineChart data={records}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip content={<ChartTooltipContent labelFormatter={label => t('statistics.yearLabel', { year: label })} />} />
        <Legend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="applications_for_annulment_submitted" stroke={chartConfig.applications_for_annulment_submitted.color} />
      </LineChart>
    </ChartContainer>
  )
}

function InterimMeasuresLineChart({ records }: { records: InterimMeasuresRecord[] }) {
  const { t } = useTranslation()
  const chartConfig = {
    interim_measures_submitted: {
      label: t('statistics.interimMeasuresSubmitted'),
      color: '#7C3AED',
    },
    decisions_interim_measures: {
      label: t('statistics.decisionsInterimMeasures'),
      color: REJECTED_COLOR,
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <LineChart data={records}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip content={<ChartTooltipContent labelFormatter={label => t('statistics.yearLabel', { year: label })} />} />
        <Legend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="interim_measures_submitted" stroke={chartConfig.interim_measures_submitted.color} />
        <Line type="monotone" dataKey="decisions_interim_measures" stroke={chartConfig.decisions_interim_measures.color} />
      </LineChart>
    </ChartContainer>
  )
}

function DecisionsEvolutionLineChart({ records }: { records: AnnulmentRecord[] }) {
  const { t } = useTranslation()
  const chartConfig = {
    positive_decisions: { label: t('statistics.protectionGranted'), color: GRANTED_COLOR },
    negative_decisions_on_the_merits: { label: t('statistics.rejectionOnMerits'), color: REJECTED_COLOR },
    negative_decisions_on_admissibility_grounds: { label: t('statistics.rejectionInadmissible'), color: INADMISSIBLE_COLOR },
    negative_decisions_or_withdrawals: { label: t('statistics.withdrawalsArchived'), color: WITHDRAWALS_COLOR },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <LineChart data={records}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip content={<ChartTooltipContent labelFormatter={label => t('statistics.yearLabel', { year: label })} />} />
        <Legend content={<ChartLegendContent />} />
        {Object.entries(chartConfig).map(([key, config]) => (
          <Line key={key} type="monotone" dataKey={key} stroke={config.color} />
        ))}
      </LineChart>
    </ChartContainer>
  )
}

function LegalAidDonut({ records }: { records: LegalAidApplicationRecord[] }) {
  const { t } = useTranslation()
  const years = useMemo(() => records.map(r => r.year), [records])
  const latestYear = years[years.length - 1]
  const [selectedYear, setSelectedYear] = useState<number>(latestYear ?? 0)

  const data = useMemo(() => records.find(r => r.year === selectedYear), [records, selectedYear])

  const donutData = useMemo(() => {
    if (!data) return []
    return [
      { name: t('statistics.legalAidPositive'), value: data.positive_decisions_legal_aid, color: GRANTED_COLOR },
      { name: t('statistics.legalAidNegative'), value: data.negative_decisions_legal_aid, color: REJECTED_COLOR },
    ].filter(d => d.value > 0)
  }, [data, t])

  const total = data ? data.positive_decisions_legal_aid + data.negative_decisions_legal_aid : 0

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 p-5">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-900">{t('statistics.legalAidAnnulmentRequests')}</h3>
        <select
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm"
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
        >
          {[...years].reverse().map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {!data
        ? <p className="text-muted-foreground text-sm">{t('statistics.noData')}</p>
        : (
          <>
            <ChartContainer config={{}} className="h-48 w-full">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                >
                  {donutData.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <PieTooltip formatter={value => (value != null ? Number(value).toLocaleString('fr-FR') : '')} />
              </PieChart>
            </ChartContainer>
            <div className="w-full space-y-2 px-2">
              {donutData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-gray-700">{d.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{total > 0 ? `${Math.round((d.value / total) * 100)}%` : ''}</span>
                  <span className="text-sm font-semibold text-gray-800">{d.value.toLocaleString('fr-FR')}</span>
                </div>
              ))}
            </div>
          </>
        )}
    </div>
  )
}

export function CourtAsylumProceduresDetails({
  annulments,
  interimMeasures,
  legalAid,
  loading,
  error,
  customText,
}: {
  annulments: AnnulmentRecord[]
  interimMeasures: InterimMeasuresRecord[]
  legalAid: LegalAidApplicationRecord[]
  loading: boolean
  error: string | null
  customText?: IndicatorCustomText | null
}) {
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.courtAsylumProcedures')
  const subtitle = isGr ? customText?.subtitle_gr : customText?.subtitle_en
  const explanatoryTitle = isGr ? customText?.explanatory_text_title_gr : customText?.explanatory_text_title_en
  const explanatoryText = isGr ? customText?.explanatory_text_gr : customText?.explanatory_text_en
  const information = isGr ? customText?.information_gr : customText?.information_en

  return (
    <div className="mx-auto my-6 max-w-5xl space-y-8">
      {/* Card 1: header + annulments table/donut */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: '#04356C' }}>{title}</h2>
            <IndicatorInfoButton text={information} />
          </div>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        </div>

        <div className="p-6">
          <AnnulmentsCard records={annulments} />
        </div>
      </div>

      {/* Section 2: fluctuation of annulment applications & interim measures */}
      <div>
        <h2 className="mb-4 text-lg font-bold" style={{ color: '#04356C' }}>{t('statistics.fluctuationTitle')}</h2>
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
          {(explanatoryTitle || explanatoryText) && (
            <div className="space-y-1.5 rounded-lg bg-gray-50 px-4 py-4">
              {explanatoryTitle && (
                <h3 className="text-sm font-semibold" style={{ color: '#04356C' }}>{explanatoryTitle}</h3>
              )}
              {explanatoryText && (
                <p className="text-muted-foreground text-sm leading-relaxed">{explanatoryText}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="mb-2 text-sm font-bold text-gray-900">{t('statistics.annulmentApplications')}</h3>
              <AnnulmentApplicationsLineChart records={annulments} />
            </div>
            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="mb-2 text-sm font-bold text-gray-900">{t('statistics.interimMeasuresRequests')}</h3>
              <InterimMeasuresLineChart records={interimMeasures} />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: decisions evolution + legal aid on annulment */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-2 text-sm font-bold text-gray-900">{t('statistics.decisionsEvolution')}</h3>
          <DecisionsEvolutionLineChart records={annulments} />
        </div>
        <LegalAidDonut records={legalAid} />
      </div>

      {/* Footer — source & last updated */}
      {(customText?.source || customText?.last_updated_on) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-gray-100 px-1 py-3 text-xs text-gray-500">
          {customText.source && (
            <span>
              <span className="font-medium text-gray-600">
                {t('statistics.source')}
                :
              </span>
              {' '}
              <a href={customText.source} target="_blank" rel="noopener noreferrer" className="underline transition-colors hover:text-gray-800">
                {customText.sourceText || customText.source}
              </a>
            </span>
          )}
          {customText.last_updated_on && (
            <span>
              <span className="font-medium text-gray-600">
                {t('statistics.lastUpdated')}
                :
              </span>
              {' '}
              {customText.last_updated_on}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
