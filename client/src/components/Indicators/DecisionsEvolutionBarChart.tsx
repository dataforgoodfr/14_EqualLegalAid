import { t } from 'i18next'
import { Bar, BarChart, CartesianGrid, Legend, LabelList, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartLegendContent, ChartTooltipContent, CHART_AXIS_PROPS, CHART_GRID_PROPS } from '@/components/ui'
import type { ChartConfig } from '@/components/ui'
import type { DecisionsYearly } from '@/hooks/useProtectionDecisions'

const GRANTED_LIGHT = '#3F9FD8'
const GRANTED_DARK = '#0B4C82'
const REJECTED_DARK = '#04356C'
const REJECTED_MID = '#6BB8E8'
const REJECTED_LIGHT = '#9AD0F2'

// Static label rendered above each stack's top segment, naming the bar
// ("Protection granted" / "Rejected") rather than its value — the color
// legend below already covers the per-type breakdown.
function StackGroupLabel({ x, y, width, text }: { x?: string | number, y?: string | number, width?: string | number, text: string }) {
  const nx = Number(x)
  const ny = Number(y)
  const nw = Number(width)
  if (!Number.isFinite(nx) || !Number.isFinite(ny) || !Number.isFinite(nw)) return null
  return (
    <text x={nx + nw / 2} y={ny - 6} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">
      {text}
    </text>
  )
}

export function DecisionsEvolutionBarChart({ yearly }: { yearly: DecisionsYearly[] }) {
  const chartConfig = {
    refugee_status: { label: t('statistics.refugeeStatus'), color: GRANTED_LIGHT },
    subsidiary_protection: { label: t('statistics.subsidiaryProtection'), color: GRANTED_DARK },
    rejection_on_merits: { label: t('statistics.rejectionOnMerits'), color: REJECTED_DARK },
    rejection_inadmissible: { label: t('statistics.rejectionInadmissible'), color: REJECTED_MID },
    withdrawals_archived: { label: t('statistics.withdrawalsArchived'), color: REJECTED_LIGHT },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <BarChart data={yearly} margin={{ top: 20, right: 8, left: 8, bottom: 4 }}>
        <CartesianGrid {...CHART_GRID_PROPS} />
        <XAxis dataKey="year" {...CHART_AXIS_PROPS} />
        <YAxis {...CHART_AXIS_PROPS} />
        <Tooltip content={<ChartTooltipContent labelFormatter={label => t('statistics.yearLabel', { year: label })} />} />
        <Legend content={<ChartLegendContent />} />
        <Bar dataKey="refugee_status" stackId="granted" fill={chartConfig.refugee_status.color} radius={[0, 0, 0, 0]} />
        <Bar dataKey="subsidiary_protection" stackId="granted" fill={chartConfig.subsidiary_protection.color} radius={[4, 4, 0, 0]}>
          <LabelList dataKey="subsidiary_protection" content={props => <StackGroupLabel {...props} text={t('statistics.protectionGranted')} />} />
        </Bar>
        <Bar dataKey="rejection_on_merits" stackId="rejected" fill={chartConfig.rejection_on_merits.color} radius={[0, 0, 0, 0]} />
        <Bar dataKey="rejection_inadmissible" stackId="rejected" fill={chartConfig.rejection_inadmissible.color} radius={[0, 0, 0, 0]} />
        <Bar dataKey="withdrawals_archived" stackId="rejected" fill={chartConfig.withdrawals_archived.color} radius={[4, 4, 0, 0]}>
          <LabelList dataKey="withdrawals_archived" content={props => <StackGroupLabel {...props} text={t('statistics.rejected')} />} />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
