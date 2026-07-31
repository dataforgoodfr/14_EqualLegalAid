import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { AsylumApplicationByGenderAgeRecord, AsylumApplicationByNationalityRecord, AsylumApplicationRecords } from '@/hooks/useGreeceTotalApplications'
import type { IndicatorCustomText } from '@/hooks/useIndicatorCustomTexts'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltipContent,
  IndicatorInfoButton,
  CHART_GRID_PROPS,
  CHART_AXIS_PROPS,
  CHART_LINE_PROPS,
} from '@/components/ui'
import type { ChartConfig } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { useTotalApplicationsGreece, annualTotals, monthlySeries } from '@/hooks/useTotalApplicationsGreece'
import { CountryOfOriginViews } from './CountryOfOriginViews'

const COLORS = [
  '#003366', '#1E6FA5', '#3F9FD8', '#6BB8E8', '#9AD0F2', '#C5E5F8',
  '#7C3AED', '#A78BFA', '#9D4729', '#D15F36', '#065F46', '#059669',
]

// Aggregate an array of records such that there is only
// one record per year, over one or more pivot keys.
//
// This turns e.g.
//
//     [
//       {year: 2000, value: 10, country: 'US'},
//       {year: 2000, value: 20, country: 'UK'},
//       {year: 2000, value:  5, country: 'UK'},
//     ]
//
// into
//
//     [
//       {year: 2000, US: 10, UK: 25},
//     ]
function aggregateRecords(
  data: any[],
  valueKey: string,
  pivotKeys: string[]
): any[] {
  const grouped: Record<number, any> = {};
  for (const record of data) {
    const year = record.year;
    const value = Number(record[valueKey]) || 0;

    // Initialize year entry if needed
    if (!grouped[year]) {
      grouped[year] = { year };
    }

    for (const key of pivotKeys) {
      const keyValue = record[key];

      if (keyValue) {
        // Sum if key already exists
        grouped[year][keyValue] = (grouped[year][keyValue] || 0) + value;
      }
    }
  }
  return Object.values(grouped);
}

// Creates a chart config from an array of records
// and one or more pivot keys.
//
// This turns e.g.
//
//     [
//       {year: 2000, value: 10, country: 'US'},
//       {year: 2000, value: 20, country: 'UK'},
//       {year: 2000, value:  5, country: 'UK'},
//     ]
//
// into
//
//     {
//       US: {
//         label: "US",
//         color: "#ff0000",
//       },
//       UK: {
//         label: "UK",
//         color: "#00ff00",
//       }
//     }
function generateChartConfig(
  data: any[],
  pivotKeys: string[],
): ChartConfig {
  const uniqueValues = new Set<string>();

  for (const record of data) {
    for (const key of pivotKeys) {
      const value = record[key];
      if (value) {
        uniqueValues.add(String(value));
      }
    }
  }

  const configMap: ChartConfig = {};
  Array.from(uniqueValues).forEach((label, index) => {
    const color = COLORS[index % COLORS.length];
    configMap[label] = { label, color };
  });
  return configMap;
}

function ByPeriod() {
  const { t } = useTranslation()
  const { records, loading, error } = useTotalApplicationsGreece()
  const [step, setStep] = useState<'year' | 'month'>('year')

  const yearly = useMemo(() => annualTotals(records), [records])
  const monthly = useMemo(() => monthlySeries(records), [records])

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />
  if (!records.length) return <p className="text-muted-foreground text-sm p-6">{t('statistics.noData')}</p>

  // Une année dont la valeur vient de la somme des mois n'a pas encore son
  // consolidé officiel : c'est l'année en cours, forcément incomplète.
  const partial = yearly.filter(y => y.fromMonthly).map(y => y.year)

  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <div className="border-border flex items-center overflow-hidden rounded-md border">
          <button
            type="button"
            onClick={() => setStep('year')}
            className={`px-2.5 py-1.5 text-xs ${step === 'year' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            {t('statistics.byYear')}
          </button>
          <button
            type="button"
            onClick={() => setStep('month')}
            className={`border-border border-l px-2.5 py-1.5 text-xs ${step === 'month' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            {t('statistics.byMonth')}
          </button>
        </div>
      </div>

      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          {step === 'year'
            ? (
              // Total officiel et non somme des mois : la source grecque révise ses
              // consolidés, les deux divergent de quelques dizaines certaines années.
              // Pas de ventilation ici, elle n'existe qu'à partir de 2022.
              <BarChart data={yearly} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                <CartesianGrid {...CHART_GRID_PROPS} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  formatter={(value: unknown) => [Number(value).toLocaleString('fr-FR'), t('statistics.totalApplicants')]}
                  labelFormatter={label => t('statistics.yearLabel', { year: label })}
                />
                <Bar dataKey="total_applications" radius={[3, 3, 0, 0]}>
                  {yearly.map(y => (
                    <Cell key={y.year} fill={y.fromMonthly ? '#9AD0F2' : '#003366'} />
                  ))}
                </Bar>
              </BarChart>
            )
            : (
              <BarChart data={monthly} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                <CartesianGrid {...CHART_GRID_PROPS} />
                <XAxis
                  dataKey="key"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  interval={0}
                  tickFormatter={k => k.endsWith('-01') ? k.slice(0, 4) : ''}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  formatter={(value, name) => [Number(value).toLocaleString('fr-FR'), name]}
                  labelFormatter={label => String(label)}
                />
                <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="first_applications" stackId="a" name={t('statistics.firstTime')} fill="#003366" />
                <Bar dataKey="subsequent_applications" stackId="a" name={t('statistics.subsequent')} fill="#6B9BD2" radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
        </ResponsiveContainer>
      </div>

      {step === 'year' && partial.length > 0 && (
        <p className="text-muted-foreground mt-2 text-xs">
          {t('statistics.partialYearNote', { years: partial.join(', ') })}
        </p>
      )}
    </div>
  )
}

function ByNationality({
  records,
}: {
  records: AsylumApplicationByNationalityRecord[]
}) {
  const { t } = useTranslation()

  // Pays survolé, depuis la ligne ou depuis la légende. Tous les autres passent
  // en gris : à 40 pays, c'est le seul moyen de suivre une trajectoire.
  const [activeCountry, setActiveCountry] = useState<string | null>(null)

  const chartData = useMemo(() => {
    return {
      config: generateChartConfig(records, ["country"]),
      records: aggregateRecords(records, "total_applications", ["country"]),
    }
  }, [records])

  // Légende ordonnée par volume décroissant, et non par ordre d'apparition en
  // base : le lecteur cherche d'abord les pays qui pèsent.
  const legendEntries = useMemo(() => {
    const totals = new Map<string, number>()
    for (const row of chartData.records) {
      for (const [key, value] of Object.entries(row)) {
        if (key === 'year') continue
        totals.set(key, (totals.get(key) ?? 0) + Number(value ?? 0))
      }
    }
    return Object.entries(chartData.config)
      .map(([key, config]) => ({ key, color: config.color as string, total: totals.get(key) ?? 0 }))
      .sort((a, b) => b.total - a.total)
  }, [chartData])

  if (records.length === 0) return <p className="text-muted-foreground text-sm p-6">{t('statistics.noData')}</p>

  const dimmed = '#e2e8f0'

  return (
    <div onMouseLeave={() => setActiveCountry(null)}>
      {/* Taller than the other charts on purpose: with a dozen+ overlapping
          country lines, more vertical room is what actually reduces visual
          overlap (see the "Country of origin" readability request). */}
      <ChartContainer config={chartData.config} className="h-[560px] w-full">
        <LineChart width={500} height={300} data={chartData.records}>
          <CartesianGrid {...CHART_GRID_PROPS} />
          <XAxis dataKey="year" {...CHART_AXIS_PROPS} />
          <YAxis width={70} {...CHART_AXIS_PROPS} />
          <Tooltip
            wrapperStyle={{ zIndex: 1000 }}
            content={(
              <ChartTooltipContent
                labelFormatter={label => t('statistics.yearLabel', { year: label })}
                multiColumn
                sortByValueDesc
              />
            )}
          />
          {legendEntries.map(({ key, color }) => {
            const isActive = activeCountry === key
            const isDimmed = activeCountry !== null && !isActive
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                {...CHART_LINE_PROPS}
                stroke={isDimmed ? dimmed : color}
                strokeWidth={isActive ? 3 : 1.5}
                // La ligne mise en avant passe au-dessus des autres.
                style={{ pointerEvents: 'stroke' }}
                onMouseEnter={() => setActiveCountry(key)}
              />
            )
          })}
        </LineChart>
      </ChartContainer>

      {/* Légende cliquable au survol — c'est la cible fiable : une courbe est trop
          fine pour être visée confortablement à la souris. */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {legendEntries.map(({ key, color, total }) => {
          const isDimmed = activeCountry !== null && activeCountry !== key
          return (
            <button
              key={key}
              type="button"
              onMouseEnter={() => setActiveCountry(key)}
              onFocus={() => setActiveCountry(key)}
              className={`flex items-center gap-1.5 text-xs transition-opacity ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
              title={total.toLocaleString('fr-FR')}
            >
              <span
                className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className={activeCountry === key ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                {key}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Rang d'une tranche d'âge d'après sa borne basse : « 0-13 » < « 14-17 » < …
// < « 65 and over ». Déduit du libellé plutôt que codé en dur, pour ne pas
// casser si ELA ajoute ou renomme une tranche.
function ageRank(label: string): number {
  const m = /\d+/.exec(label)
  return m ? Number(m[0]) : Number.MAX_SAFE_INTEGER
}

function ByPivot({
  records,
  pivotKey,
}: {
  records: AsylumApplicationByGenderAgeRecord[]
  pivotKey: 'gender' | 'age'
}) {
  const { t } = useTranslation()

  const chartData = useMemo(() => {
    const config = generateChartConfig(records, [pivotKey])
    // generateChartConfig suit l'ordre d'apparition en base, qui est arbitraire.
    // Pour l'âge on impose l'ordre des tranches, sinon 65 and over peut précéder
    // 0-13. Les couleurs sont réattribuées ensuite pour rester dégradées.
    const ordered = pivotKey === 'age'
      ? Object.fromEntries(
          Object.entries(config)
            .sort(([a], [b]) => ageRank(a) - ageRank(b))
            .map(([key, value], i) => [key, { ...value, color: COLORS[i % COLORS.length] }]),
        )
      : config
    return {
      config: ordered as ChartConfig,
      records: aggregateRecords(records, "applications", [pivotKey]),
    }
  }, [records, pivotKey])

  if (records.length === 0) return <p className="text-muted-foreground text-sm p-6">{t('statistics.noData')}</p>

  return (
    // Bâtons groupés et non empilés : à 2 (genre) ou 5 (âge) catégories, on veut
    // comparer les groupes entre eux plutôt que lire un total par année.
    <ChartContainer config={chartData.config} className="h-80 w-full">
      <BarChart width={500} height={300} data={chartData.records}>
        <CartesianGrid {...CHART_GRID_PROPS} />
        <XAxis dataKey="year" {...CHART_AXIS_PROPS} />
        <YAxis {...CHART_AXIS_PROPS} />
        <Tooltip
          wrapperStyle={{ zIndex: 1000 }}
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          content={(
            <ChartTooltipContent
              labelFormatter={label => t('statistics.yearLabel', { year: label })}
              sortByValueDesc
            />
          )}
        />
        <Legend content={<ChartLegendContent />} />
        {Object.entries(chartData.config).map(([key, config]) => (
          <Bar key={key} dataKey={key} fill={config.color} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

export function AsylumApplicationsEvolutionInGreeceDetails({
  records,
  loading,
  error,
  customText,
}: {
  records: AsylumApplicationRecords
  loading: boolean
  error: string | null
  customText?: IndicatorCustomText | null
}) {
  const { t, i18n } = useTranslation()
  const isGr = i18n.language === 'el'

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />

  const title = (isGr ? customText?.title_gr : customText?.title_en) || t('statistics.asylumEvolutionGreece')
  const subtitle = isGr ? customText?.subtitle_gr : customText?.subtitle_en
  const explanatoryTitle = isGr ? customText?.explanatory_text_title_gr : customText?.explanatory_text_title_en
  const explanatoryText = isGr ? customText?.explanatory_text_gr : customText?.explanatory_text_en
  const information = isGr ? customText?.information_gr : customText?.information_en

  return (
    <div className="mx-auto my-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        {/* Card header */}
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold whitespace-pre-line" style={{ color: '#003366' }}>{title}</h2>
            <IndicatorInfoButton text={information} />
          </div>
          {subtitle && (
            <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">{subtitle}</p>
          )}
        </div>

        {/* Card body — charts stacked sequentially instead of behind a filter */}
        <div className="space-y-8 p-6">
          {(explanatoryTitle || explanatoryText) && (
            <div className="rounded-lg border border-gray-200 p-5">
              {explanatoryTitle && (
                <h3 className="mb-2 text-sm font-bold text-gray-900 whitespace-pre-line">{explanatoryTitle}</h3>
              )}
              {explanatoryText && (
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{explanatoryText}</p>
              )}
            </div>
          )}

          {/* Un cadre par graphique — quatre visualisations à la suite se lisaient
              comme un seul bloc continu. Même traitement que l'onglet camps. */}
          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-900">{t('statistics.dataApplicationsPerYear')}</h3>
            <ByPeriod />
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-900">{t('statistics.dataApplicantsByCountryOfOrigin')}</h3>
            {/* Quatre représentations en concurrence, à départager. */}
            <CountryOfOriginViews
              records={records.byNationality}
              linesView={<ByNationality records={records.byNationality} />}
            />
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-900">{t('statistics.dataApplicantsByAgeGroup')}</h3>
            <ByPivot records={records.byGenderAge} pivotKey="age" />
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-900">{t('statistics.dataApplicantsByGender')}</h3>
            <ByPivot records={records.byGenderAge} pivotKey="gender" />
          </div>
        </div>

        {/* Card footer — source & last updated */}
        {(customText?.source || customText?.last_updated_on) && (
          <div className="space-y-1 border-t border-gray-100 bg-gray-50/60 px-6 py-3 text-xs text-gray-500">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
              {customText.source && (
                <span>
                  <span className="font-medium text-gray-600">{t('statistics.source')}:</span>
                  {' '}
                  <a
                    href={customText.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-800 transition-colors"
                  >
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
