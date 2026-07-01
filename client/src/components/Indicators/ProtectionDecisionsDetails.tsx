import { Tabs } from "radix-ui";
import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import type { FirstInstanceRecord, SecondInstanceRecord } from '@/hooks/useProtectionDecisions'
import { aggregateDecisionsByYear } from '@/hooks/useProtectionDecisions'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { ChartContainer, IndicatorInfoButton } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { ProtectionRateLineChart} from './ProtectionRateLineChart'
import { protectionRatePerMonth } from '@/hooks'


const GRANTED_COLOR = '#3F9FD8'
const REJECTED_COLOR = '#04356C'

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
              ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              : <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
          )}
          {!expandable && depth > 0 && <span className="w-[14px] flex-shrink-0" />}
          <span className={depth === 0 ? 'font-semibold text-gray-800' : 'text-gray-600 text-sm'}>
            {label}
          </span>
        </span>
      </td>
      <td className="px-4 py-2 text-right text-sm">{value.toLocaleString()}</td>
      <td className="px-4 py-2 text-right text-sm text-gray-400">{pct}</td>
    </tr>
  )
}

function DecisionsContent({
  records,
  instanceLabel,
  isFirstInstance,
}: {
  records: (FirstInstanceRecord | SecondInstanceRecord)[]
  instanceLabel: string
  isFirstInstance: boolean
}) {
  const { t } = useTranslation()
  const chartTitle = isFirstInstance ? t('statistics.protectionDecisions') : t('statistics.appealsDecisions');

  const yearly = useMemo(() => aggregateDecisionsByYear(records), [records])
  const years = useMemo(() => yearly.map(r => r.year).filter(y => y > 0), [yearly])
  const latestYear = years[years.length - 1]
  const [selectedYear, setSelectedYear] = useState<number>(latestYear ?? 0)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    granted: false,
    rejected: true,
    onMerits: false,
    inadmissible: false,
    withdrawals: false,
  })

  const data = useMemo(() => yearly.find(r => r.year === selectedYear), [yearly, selectedYear])

  const toggle = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const donutData = useMemo(() => {
    if (!data) return []
    return [
      { name: t('statistics.granted'), value: data.positive, color: GRANTED_COLOR },
      { name: t('statistics.rejected'), value: data.negative, color: REJECTED_COLOR },
    ].filter(d => d.value > 0)
  }, [data, t])

  if (!data) return null

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Tree table */}
        <div className="lg:col-span-3 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 text-left">{t('statistics.decisionType')}</th>
                <th className="px-4 py-2 text-right">{t('statistics.count')}</th>
                <th className="px-4 py-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {/* Protection granted */}
              <TreeRow
                label={t('statistics.protectionGranted')}
                value={data.positive}
                total={data.total}
                depth={0}
                expandable
                expanded={expanded.granted}
                onToggle={() => toggle('granted')}
              />
              {expanded.granted && (
                <>
                  <TreeRow label={t('statistics.refugeeStatus')} value={data.refugee_status} total={data.total} depth={1} expandable={false} />
                  <TreeRow label={t('statistics.subsidiaryProtection')} value={data.subsidiary_protection} total={data.total} depth={1} expandable={false} />
                </>
              )}

              {/* Protection rejected */}
              <TreeRow
                label={t('statistics.protectionRejected')}
                value={data.negative}
                total={data.total}
                depth={0}
                expandable
                expanded={expanded.rejected}
                onToggle={() => toggle('rejected')}
              />
              {expanded.rejected && (
                <>
                  {/* Rejection on the merits */}
                  <TreeRow
                    label={t('statistics.rejectionOnMerits')}
                    value={data.rejection_on_merits}
                    total={data.total}
                    depth={1}
                    expandable
                    expanded={expanded.onMerits}
                    onToggle={() => toggle('onMerits')}
                  />
                  {expanded.onMerits && (
                    <>
                      <TreeRow label={t('statistics.rejectedUnfounded')} value={data.rejected_as_unfounded} total={data.total} depth={2} expandable={false} />
                      {isFirstInstance && (
                        <>
                          <TreeRow label={t('statistics.exclusionRefugeeStatus')} value={data.exclusion_from_refugee_status} total={data.total} depth={2} expandable={false} />
                          <TreeRow label={t('statistics.negativeFirstInstance')} value={data.negative_first_instance} total={data.total} depth={2} expandable={false} />
                          <TreeRow label={t('statistics.negativeAccelerated')} value={data.negative_accelerated} total={data.total} depth={2} expandable={false} />
                        </>
                      )}
                    </>
                  )}

                  {/* Rejection as inadmissible */}
                  <TreeRow
                    label={t('statistics.rejectionInadmissible')}
                    value={data.formal_grounds_rejections}
                    total={data.total}
                    depth={1}
                    expandable={false}
                  />

                  {/* Withdrawals */}
                  <TreeRow
                    label={t('statistics.withdrawalsArchived')}
                    value={data.withdrawals_archived}
                    total={data.total}
                    depth={1}
                    expandable={false}
                  />
                </>
              )}

              {/* Total */}
              <TreeRow
                label={t('statistics.totalDecisions')}
                value={data.total}
                total={data.total}
                depth={0}
                expandable={false}
                isBold
              />
            </tbody>
          </table>
        </div>

        {/* Donut panel */}
        <div className="lg:col-span-2 flex flex-col items-center justify-start gap-4">
          <p className="text-sm font-bold text-gray-900 mb-4">{chartTitle}</p>
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
              <Tooltip formatter={(value) => (value != null ? Number(value).toLocaleString() : '')} />
            </PieChart>
          </ChartContainer>
          <div className="w-full space-y-2 px-2">
            {donutData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-sm text-gray-700">{d.name}</span>
                <span className="ml-auto text-sm font-semibold text-gray-800">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>      
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

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.protectionDecisions')
  const subtitle = isGr ? customText?.subtitle_gr : customText?.subtitle_en
  const explanatoryTitle = isGr ? customText?.explanatory_text_title_gr : customText?.explanatory_text_title_en
  const explanatoryText = isGr ? customText?.explanatory_text_gr : customText?.explanatory_text_en
  const information = isGr ? customText?.information_gr : customText?.information_en

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  return (<Tabs.Root className="TabsRoot" defaultValue="tab1">
    <Tabs.List className="rounded-md bg-gray-100 p-1 mt-6 w-max">
      <Tabs.Trigger className="rounded-sm px-2 pt-1 data-[state=active]:shadow data-[state=active]:bg-white" value="tab1">
        {t('statistics.firstInstanceDecisions')}
      </Tabs.Trigger>
      {" > "}
      <Tabs.Trigger className="rounded-sm px-2 pt-1 data-[state=active]:shadow data-[state=active]:bg-white" value="tab2">
        {t('statistics.appealsDecisions')}
      </Tabs.Trigger>
    </Tabs.List>

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

        {/* Card body */}
        <div className="space-y-6 p-6">
          <Tabs.Content className="TabsContent" value="tab1">
            <DecisionsContent
              records={firstInstance}
              instanceLabel={t('statistics.firstInstanceDecisions')}
              isFirstInstance={true}
            />
          </Tabs.Content>
          <Tabs.Content className="TabsContent" value="tab2">
            <DecisionsContent
              records={secondInstance}
              instanceLabel={t('statistics.appealsDecisions')}
              isFirstInstance={false}
            />
          </Tabs.Content>

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

        <div className="space-y-6 p-6">
          <ProtectionRateLineChart protectionRatePerMonthRecord={protectionRatePerMonth(firstInstance, secondInstance)} />
        </div>

        {/* Card footer */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500">
            {customText.source && (
              <span>
                <span className="font-medium text-gray-600">{t('statistics.source')}:</span>
                {' '}
                <a href={customText.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800 transition-colors">
                  {customText.sourceText || customText.source}
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
  </Tabs.Root>)
}
