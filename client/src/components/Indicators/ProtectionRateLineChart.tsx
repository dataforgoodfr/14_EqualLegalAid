import { t } from 'i18next'
import { LineChart, CartesianGrid, Tooltip, XAxis, YAxis, Legend, Line } from 'recharts'
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '../ui'
import type { ChartConfig } from '@/components/ui'
import type { ProtectionRatePerMonthRecord } from '@/hooks'

export function ProtectionRateLineChart({ records }: { records: ProtectionRatePerMonthRecord[] }) {
  const chartConfig = {
    protection_rate: { 
      label: t('statistics.protectionRate'),
      color: '#04356C'
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <LineChart data={records}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="display_date" />
        <YAxis />
        <Tooltip
          content={<ChartTooltipContent labelFormatter={label => t('statistics.periodCoveredLabel', { period: label })} />}
        />
        <Legend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="protection_rate" stroke={chartConfig.protection_rate.color} />
      </LineChart>
    </ChartContainer>
  )  
}
