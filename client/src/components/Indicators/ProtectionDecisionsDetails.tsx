import { Tabs } from "radix-ui";
import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import type { AppealLegalAidRecord, FirstInstanceRecord, SecondInstanceRecord } from '@/hooks/useProtectionDecisions'
import { aggregateDecisionsByYear } from '@/hooks/useProtectionDecisions'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { ChartContainer, IndicatorInfoButton } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { DecisionsEvolutionBarChart } from './DecisionsEvolutionBarChart'

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
      <td className="px-4 py-2 text-right text-sm">{value.toLocaleString('fr-FR')}</td>
      <td className="px-4 py-2 text-right text-sm text-gray-400">{pct}</td>
    </tr>
  )
}

function DecisionsContent({
  records,
  instanceLabel,
  isFirstInstance,
  appealsLegalAid,
}: {
  records: (FirstInstanceRecord | SecondInstanceRecord)[]
  instanceLabel: string
  isFirstInstance: boolean
  appealsLegalAid?: AppealLegalAidRecord[]
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
  const [donutView, setDonutView] = useState<'protection' | 'legalAid'>('protection')

  const data = useMemo(() => yearly.find(r => r.year === selectedYear), [yearly, selectedYear])

  const toggle = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  const donutData = useMemo(() => {
    if (!data) return []
    return [
      { name: t('statistics.positiveOutcomeInternationalProtection'), value: data.positive, color: GRANTED_COLOR },
      { name: t('statistics.negativeOutcomeDecisions'), value: data.negative, color: REJECTED_COLOR },
    ].filter(d => d.value > 0)
  }, [data, t])

  const showLegalAidToggle = !isFirstInstance && (appealsLegalAid?.length ?? 0) > 0

  const legalAidData = useMemo(() => {
    if (!showLegalAidToggle) return []
    const rec = appealsLegalAid!.find(r => r.year === selectedYear)
    if (!rec) return []
    return [
      { name: t('statistics.withLegalAid'), value: rec.with_legal_aid, color: GRANTED_COLOR },
      { name: t('statistics.withoutLegalAid'), value: rec.without_legal_aid, color: REJECTED_COLOR },
    ].filter(d => d.value > 0)
  }, [showLegalAidToggle, appealsLegalAid, selectedYear, t])

  const showingLegalAid = showLegalAidToggle && donutView === 'legalAid'
  const activeDonutData = showingLegalAid ? legalAidData : donutData
  const activeDonutTitle = showingLegalAid ? t('statistics.legalAidView') : chartTitle

  if (!data) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-700">{instanceLabel}</h3>
        <div className="flex gap-2">
          {showLegalAidToggle && (
            <select
              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm"
              value={donutView}
              onChange={e => setDonutView(e.target.value as 'protection' | 'legalAid')}
            >
              <option value="protection">{t('statistics.protectionDecisionView')}</option>
              <option value="legalAid">{t('statistics.legalAidView')}</option>
            </select>
          )}
          <select
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {[...years].reverse().map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Tree table */}
        <div className="lg:col-span-3 min-w-0 overflow-x-auto rounded-lg border border-gray-200">
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
                      {isFirstInstance
                        ? (
                          <>
                            <TreeRow label={t('statistics.exclusionRefugeeStatus')} value={data.exclusion_from_refugee_status} total={data.total} depth={2} expandable={false} />
                            <TreeRow label={t('statistics.negativeFirstInstance')} value={data.negative_first_instance} total={data.total} depth={2} expandable={false} />
                            <TreeRow label={t('statistics.negativeAccelerated')} value={data.negative_accelerated} total={data.total} depth={2} expandable={false} />
                          </>
                        )
                        : (
                          <>
                            <TreeRow label={t('statistics.maintenanceFirstInstanceSubsidiaryProtection')} value={data.maintenance_first_instance_subsidiary_protection} total={data.total} depth={2} expandable={false} />
                            <TreeRow label={t('statistics.rejectedManifestlyUnfounded')} value={data.rejected_as_manifestly_unfounded} total={data.total} depth={2} expandable={false} />
                            <TreeRow label={t('statistics.rejectedManifestlyUnfoundedSafeCountry')} value={data.rejected_as_manifestly_unfounded_safe_country} total={data.total} depth={2} expandable={false} />
                            <TreeRow label={t('statistics.exclusionRefugeeStatus')} value={data.exclusion_from_refugee_status} total={data.total} depth={2} expandable={false} />
                            <TreeRow label={t('statistics.negativeSecondInstanceImplicitWithdrawals')} value={data.negative_second_instance_implicit_withdrawals} total={data.total} depth={2} expandable={false} />
                            <TreeRow label={t('statistics.revocationProtectionStatus')} value={data.revocation_of_protection_status} total={data.total} depth={2} expandable={false} />
                            <TreeRow label={t('statistics.rejectedOther')} value={data.rejected_other} total={data.total} depth={2} expandable={false} />
                          </>
                        )}
                    </>
                  )}

                  {/* Rejection as inadmissible */}
                  <TreeRow
                    label={t('statistics.rejectionInadmissible')}
                    value={data.rejection_inadmissible}
                    total={data.total}
                    depth={1}
                    expandable
                    expanded={expanded.inadmissible}
                    onToggle={() => toggle('inadmissible')}
                  />
                  {expanded.inadmissible && (
                    <>
                      {isFirstInstance
                        ? (
                          <TreeRow label={t('statistics.borderProcedure')} value={data.border_procedure} total={data.total} depth={2} expandable={false} />
                        )
                        : (
                          <>
                            <TreeRow label={t('statistics.borderProcedureSafeThirdCountry')} value={data.border_procedure_safe_third_country} total={data.total} depth={2} expandable={false} />
                            <TreeRow label={t('statistics.borderProcedureAlbania')} value={data.border_procedure_albania} total={data.total} depth={2} expandable={false} />
                            <TreeRow label={t('statistics.borderProcedureNorthMacedonia')} value={data.border_procedure_north_macedonia} total={data.total} depth={2} expandable={false} />
                          </>
                        )}
                      <TreeRow label={t('statistics.dublinRegulation')} value={data.dublin_regulation} total={data.total} depth={2} expandable={false} />
                      <TreeRow label={t('statistics.subsequentApplicants')} value={data.subsequent_applications} total={data.total} depth={2} expandable={false} />
                      <TreeRow label={t('statistics.formalGrounds')} value={data.formal_grounds_rejections} total={data.total} depth={2} expandable={false} />
                      {!isFirstInstance && (
                        <TreeRow label={t('statistics.lateAppeals')} value={data.late_appeals} total={data.total} depth={2} expandable={false} />
                      )}
                    </>
                  )}

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
        <div className="lg:col-span-2 flex flex-col items-center justify-start gap-4 rounded-lg border border-gray-200 p-5">
          <p className="text-sm font-bold text-gray-900 mb-4">{activeDonutTitle}</p>
          <ChartContainer config={{}} className="h-52 w-full">
            <PieChart>
              <Pie
                data={activeDonutData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                labelLine={false}
              >
                {activeDonutData.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => (value != null ? Number(value).toLocaleString('fr-FR') : '')} />
            </PieChart>
          </ChartContainer>
          <div className="w-full space-y-2 px-2">
            {activeDonutData.map((d) => {
              const donutTotal = activeDonutData.reduce((sum, e) => sum + e.value, 0)
              return (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-gray-700">{d.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{donutTotal > 0 ? `${Math.round((d.value / donutTotal) * 100)}%` : ''}</span>
                  <span className="text-sm font-semibold text-gray-800">{d.value.toLocaleString('fr-FR')}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Evolution bar chart */}
      <div className="rounded-lg border border-gray-200 p-5">
        <h3 className="mb-2 text-sm font-bold text-gray-900">{t('statistics.protectionDecisionsEvolution')}</h3>
        <DecisionsEvolutionBarChart yearly={yearly} />
      </div>
    </div>
  )
}


export function ProtectionDecisionsDetails({
  firstInstance,
  secondInstance,
  appealsLegalAid,
  loading,
  error,
  customText,
}: {
  firstInstance: FirstInstanceRecord[]
  secondInstance: SecondInstanceRecord[]
  appealsLegalAid?: AppealLegalAidRecord[]
  loading: boolean
  error: string | null
  customText?: IndicatorCustomText | null
}) {
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.firstSecondInstanceDecisionsGreece')
  const subtitle = isGr ? customText?.subtitle_gr : customText?.subtitle_en
  const explanatoryTitle = isGr ? customText?.explanatory_text_title_gr : customText?.explanatory_text_title_en
  const explanatoryText = isGr ? customText?.explanatory_text_gr : customText?.explanatory_text_en
  const information = isGr ? customText?.information_gr : customText?.information_en

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  return (<Tabs.Root className="TabsRoot" defaultValue="tab1">
    <div className="mx-auto my-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Card header */}
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold whitespace-pre-line" style={{ color: '#04356C' }}>{title}</h2>
            <IndicatorInfoButton text={information} />
          </div>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">{subtitle}</p>}
        </div>

        {/* Card body */}
        <div className="space-y-6 p-6">

          {/* Tab Trigger */}
          <Tabs.List className="rounded-md bg-gray-100 p-1 mt-6 w-max flex items-center">
            <Tabs.Trigger className="rounded-sm px-3 py-1.5 leading-none data-[state=active]:shadow data-[state=active]:bg-[#04356C] data-[state=active]:text-white" value="tab1">
              {t('statistics.firstInstanceDecisions')}
            </Tabs.Trigger>
            {" > "}
            <Tabs.Trigger className="rounded-sm px-3 py-1.5 leading-none data-[state=active]:shadow data-[state=active]:bg-[#04356C] data-[state=active]:text-white" value="tab2">
              {t('statistics.appealsDecisions')}
            </Tabs.Trigger>
          </Tabs.List>

          {/* Main Content */}
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
              appealsLegalAid={appealsLegalAid}
            />
          </Tabs.Content>

          {/* Explanatory text */}
          {(explanatoryTitle || explanatoryText) && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 space-y-1.5">
              {explanatoryTitle && (
                <h3 className="text-sm font-semibold whitespace-pre-line" style={{ color: '#04356C' }}>{explanatoryTitle}</h3>
              )}
              {explanatoryText && (
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line text-justify">{explanatoryText}</p>
              )}
            </div>
          )}
        </div>

        {/* Card footer */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="space-y-1 border-t border-gray-100 bg-gray-50/60 px-6 py-3 text-xs text-gray-500">
            <div className="flex justify-between">
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
              <p className="italic text-gray-400 whitespace-pre-line">{customText.sourceText}</p>
            )}
          </div>
        )}
      </div>
    </div>
  </Tabs.Root>)
}
