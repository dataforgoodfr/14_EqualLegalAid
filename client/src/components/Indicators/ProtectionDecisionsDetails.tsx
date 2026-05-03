import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import type { FirstInstanceRecord, SecondInstanceRecord } from '@/hooks/useProtectionDecisions'
import { aggregateDecisionsByYear } from '@/hooks/useProtectionDecisions'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { ChartContainer, ChartTooltipContent, ChartLegendContent, IndicatorInfoButton } from '@/components/ui'
import type { ChartConfig } from '@/components/ui'
import { useTranslation } from 'react-i18next'

const DONUT_COLORS = {
  refugee_status: '#04356C',
  subsidiary_protection: '#3F9FD8',
  rejected_as_unfounded: '#EF4444',
  formal_grounds_rejections: '#F97316',
  explicit_withdrawals: '#FBBF24',
  implicit_withdrawals: '#D1D5DB',
}

function DecisionsContent({
  records,
  instanceLabel,
}: {
  records: (FirstInstanceRecord | SecondInstanceRecord)[]
  instanceLabel: string
}) {
  const { t } = useTranslation()

  const yearly = useMemo(() => aggregateDecisionsByYear(records), [records])
  const years = useMemo(() => yearly.map(r => r.year).filter(y => y > 0), [yearly])

  const latestYear = years[years.length - 1]
  const [selectedYear, setSelectedYear] = useState<number>(latestYear ?? 0)

  const latestData = useMemo(() => yearly.find(r => r.year === selectedYear), [yearly, selectedYear])

  const donutData = useMemo(() => {
    if (!latestData) return []
    return [
      { name: t('statistics.refugeeStatus'), value: latestData.refugee_status, key: 'refugee_status' },
      { name: t('statistics.subsidiaryProtection'), value: latestData.subsidiary_protection, key: 'subsidiary_protection' },
      { name: t('statistics.rejectedUnfounded'), value: latestData.rejected_as_unfounded, key: 'rejected_as_unfounded' },
      { name: t('statistics.formalGrounds'), value: latestData.formal_grounds_rejections, key: 'formal_grounds_rejections' },
      { name: t('statistics.explicitWithdrawals'), value: latestData.explicit_withdrawals, key: 'explicit_withdrawals' },
      { name: t('statistics.implicitWithdrawals'), value: latestData.implicit_withdrawals, key: 'implicit_withdrawals' },
    ].filter(d => d.value > 0)
  }, [latestData, t])

  const chartConfig = {
    positive: { label: t('statistics.positiveDecisions'), color: '#04356C' },
    negative: { label: t('statistics.negativeDecisions'), color: '#EF4444' },
  } satisfies ChartConfig

  const tableRows = useMemo(() => {
    if (!latestData) return []
    return [
      {
        label: t('statistics.positiveDecisions'),
        value: latestData.positive,
        isHeader: true,
        percent: latestData.total > 0 ? Math.round((latestData.positive / latestData.total) * 100) : 0,
        children: [
          { label: t('statistics.refugeeStatus'), value: latestData.refugee_status },
          { label: t('statistics.subsidiaryProtection'), value: latestData.subsidiary_protection },
        ],
      },
      {
        label: t('statistics.negativeDecisions'),
        value: latestData.negative,
        isHeader: true,
        percent: latestData.total > 0 ? Math.round((latestData.negative / latestData.total) * 100) : 0,
        children: [
          { label: t('statistics.rejectedUnfounded'), value: latestData.rejected_as_unfounded },
          { label: t('statistics.formalGrounds'), value: latestData.formal_grounds_rejections },
          { label: t('statistics.explicitWithdrawals'), value: latestData.explicit_withdrawals },
          { label: t('statistics.implicitWithdrawals'), value: latestData.implicit_withdrawals },
        ],
      },
    ]
  }, [latestData, t])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-700">{instanceLabel}</h3>
        <select
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm"
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
        >
          {[...years].reverse().map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {latestData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Hierarchical table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2 text-left">{t('statistics.decisionType')}</th>
                  <th className="px-4 py-2 text-right">{t('statistics.count')}</th>
                  <th className="px-4 py-2 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(row => (
                  <>
                    <tr key={row.label} className="border-t border-gray-200 bg-gray-50 font-semibold">
                      <td className="px-4 py-2">{row.label}</td>
                      <td className="px-4 py-2 text-right">{row.value.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-gray-500">{row.percent}%</td>
                    </tr>
                    {row.children.map(child => (
                      <tr key={child.label} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2 pl-8 text-gray-600">{child.label}</td>
                        <td className="px-4 py-2 text-right">{child.value.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-gray-400">
                          {latestData.total > 0 ? `${Math.round((child.value / latestData.total) * 100)}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
                <tr className="border-t-2 border-gray-300 font-bold">
                  <td className="px-4 py-2">{t('statistics.totalDecisions')}</td>
                  <td className="px-4 py-2 text-right">{latestData.total.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Donut chart */}
          <ChartContainer config={{}} className="h-64 w-full flex items-center justify-center">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
                labelLine={false}
              >
                {donutData.map(entry => (
                  <Cell key={entry.key} fill={DONUT_COLORS[entry.key as keyof typeof DONUT_COLORS] ?? '#ccc'} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => (value != null ? Number(value).toLocaleString() : '')} />
            </PieChart>
          </ChartContainer>
        </div>
      )}

      {/* Decisions evolution chart */}
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <LineChart data={yearly}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip content={<ChartTooltipContent labelFormatter={label => String(label)} />} />
          <Legend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="positive" stroke={chartConfig.positive.color} />
          <Line type="monotone" dataKey="negative" stroke={chartConfig.negative.color} />
        </LineChart>
      </ChartContainer>
    </div>
  )
}

export function ProtectionDecisionsDetails({
  firstInstance,
  secondInstance,
  loading,
  error,
  customText,
}: {
  firstInstance: FirstInstanceRecord[]
  secondInstance: SecondInstanceRecord[]
  loading: boolean
  error: string | null
  customText?: IndicatorCustomText | null
}) {
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'
  const [activeSubTab, setActiveSubTab] = useState(0)

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.protectionDecisions')
  const subtitle = isGr ? customText?.subtitle_gr : customText?.subtitle_en
  const explanatoryTitle = isGr ? customText?.explanatory_text_title_gr : customText?.explanatory_text_title_en
  const explanatoryText = isGr ? customText?.explanatory_text_gr : customText?.explanatory_text_en
  const information = isGr ? customText?.information_gr : customText?.information_en

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  return (
    <div className="mx-auto max-w-5xl my-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Card header */}
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold" style={{ color: '#04356C' }}>{title}</h2>
            <IndicatorInfoButton text={information} />
          </div>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {[t('statistics.firstInstanceDecisions'), t('statistics.appealsDecisions')].map((label, i) => (
            <button
              key={i}
              onClick={() => setActiveSubTab(i)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeSubTab === i
                  ? 'border-[#04356C] text-[#04356C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Card body */}
        <div className="space-y-6 p-6">
          {activeSubTab === 0 && (
            <DecisionsContent
              records={firstInstance}
              instanceLabel={t('statistics.firstInstanceDecisions')}
            />
          )}
          {activeSubTab === 1 && (
            <DecisionsContent
              records={secondInstance}
              instanceLabel={t('statistics.appealsDecisions')}
            />
          )}

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
        </div>

        {/* Card footer */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500">
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
        )}
      </div>
    </div>
  )
}
