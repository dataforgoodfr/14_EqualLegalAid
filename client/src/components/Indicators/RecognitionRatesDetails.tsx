import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import type { RecognitionRateRecord } from '@/hooks/useRecognitionRates'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import { ChartContainer, IndicatorInfoButton } from '@/components/ui'
import { useTranslation } from 'react-i18next'

const GRANTED_COLOR = '#3F9FD8'
const REJECTED_COLOR = '#003366'

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

  const totalFirst = record.refugee_status_first + record.subsidiary_protection_first + record.rejected_first
  const totalSecond = record.refugee_status_second + record.subsidiary_protection_second + record.rejected_second
  const total = totalFirst + totalSecond

  return (
    <div className="min-w-0 overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-[#003366] text-xs tracking-wide text-white uppercase">
          <tr>
            <th className="px-4 py-2 text-left">{t('statistics.decisionType')}</th>
            <th className="px-4 py-2 text-right">{t('statistics.count')}</th>
            <th className="px-4 py-2 text-right">%</th>
          </tr>
        </thead>
        <tbody>
          <TreeRow
            label={t('statistics.firstInstanceDecisions')}
            value={totalFirst}
            total={totalFirst}
            depth={0}
            expandable
            expanded={expanded.first}
            onToggle={() => toggle('first')}
          />
          {expanded.first && (
            <>
              <TreeRow label={t('statistics.totalDecisionInternationalProtection')} value={record.refugee_status_first + record.subsidiary_protection_first} total={totalFirst} depth={1} expandable={false} />
              <TreeRow label={t('statistics.rejectionOnMerits')} value={record.rejected_first} total={totalFirst} depth={1} expandable={false} />
            </>
          )}

          <TreeRow
            label={t('statistics.secondInstanceDecisions')}
            value={totalSecond}
            total={totalSecond}
            depth={0}
            expandable
            expanded={expanded.second}
            onToggle={() => toggle('second')}
          />
          {expanded.second && (
            <>
              <TreeRow label={t('statistics.totalDecisionInternationalProtection')} value={record.refugee_status_second + record.subsidiary_protection_second} total={totalSecond} depth={1} expandable={false} />
              <TreeRow label={t('statistics.rejectionOnMerits')} value={record.rejected_second} total={totalSecond} depth={1} expandable={false} />
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

  const firstInstanceDonutData = useMemo(() => {
    if (!selectedRecord) return []
    return [
      { name: t('statistics.totalProtectionGranted'), value: selectedRecord.refugee_status_first + selectedRecord.subsidiary_protection_first, color: GRANTED_COLOR },
      { name: t('statistics.rejectionOnMerits'), value: selectedRecord.rejected_first, color: REJECTED_COLOR },
    ].filter(d => d.value > 0)
  }, [selectedRecord, t])

  const secondInstanceDonutData = useMemo(() => {
    if (!selectedRecord) return []
    return [
      { name: t('statistics.totalProtectionGranted'), value: selectedRecord.refugee_status_second + selectedRecord.subsidiary_protection_second, color: GRANTED_COLOR },
      { name: t('statistics.rejectionOnMerits'), value: selectedRecord.rejected_second, color: REJECTED_COLOR },
    ].filter(d => d.value > 0)
  }, [selectedRecord, t])

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
            <h2 className="text-xl font-bold whitespace-pre-line" style={{ color: '#003366' }}>{title}</h2>
            <IndicatorInfoButton text={information} />
          </div>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">{subtitle}</p>}
        </div>

        {/* Card body */}
        <div className="space-y-6 p-6">

          {/* Explanatory text */}
          {(explanatoryTitle || explanatoryText) && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 space-y-1.5">
              {explanatoryTitle && (
                <h3 className="text-sm font-semibold whitespace-pre-line" style={{ color: '#003366' }}>{explanatoryTitle}</h3>
              )}
              {explanatoryText && (
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line text-justify">{explanatoryText}</p>
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

          {/* Protection rate on the merit, by instance */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col items-center justify-start gap-4 rounded-lg border border-gray-200 p-5">
              <p className="mb-4 text-sm font-bold text-gray-900">{t('statistics.protectionRateFirstInstance')}</p>
              <ChartContainer config={{}} className="h-52 w-full">
                <PieChart>
                  <Pie
                    data={firstInstanceDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    labelLine={false}
                  >
                    {firstInstanceDonutData.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => (value != null ? Number(value).toLocaleString('fr-FR') : '')} />
                </PieChart>
              </ChartContainer>
              <div className="w-full space-y-2 px-2">
                {firstInstanceDonutData.map((d) => {
                  const donutTotal = firstInstanceDonutData.reduce((sum, e) => sum + e.value, 0)
                  return (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-gray-700">{d.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{donutTotal > 0 ? `${Math.round((d.value / donutTotal) * 100)}%` : ''}</span>
                      <span className="text-sm font-semibold text-gray-800">{d.value.toLocaleString('fr-FR')}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex flex-col items-center justify-start gap-4 rounded-lg border border-gray-200 p-5">
              <p className="mb-4 text-sm font-bold text-gray-900">{t('statistics.protectionRateSecondInstance')}</p>
              <ChartContainer config={{}} className="h-52 w-full">
                <PieChart>
                  <Pie
                    data={secondInstanceDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    dataKey="value"
                    labelLine={false}
                  >
                    {secondInstanceDonutData.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => (value != null ? Number(value).toLocaleString('fr-FR') : '')} />
                </PieChart>
              </ChartContainer>
              <div className="w-full space-y-2 px-2">
                {secondInstanceDonutData.map((d) => {
                  const donutTotal = secondInstanceDonutData.reduce((sum, e) => sum + e.value, 0)
                  return (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm text-gray-700">{d.name}</span>
                      <span className="ml-auto text-xs text-gray-400">{donutTotal > 0 ? `${Math.round((d.value / donutTotal) * 100)}%` : ''}</span>
                      <span className="text-sm font-semibold text-gray-800">{d.value.toLocaleString('fr-FR')}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
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
  )
}
