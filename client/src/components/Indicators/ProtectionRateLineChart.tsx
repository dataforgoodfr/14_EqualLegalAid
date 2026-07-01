import { t } from 'i18next'
import { LineChart, CartesianGrid, Tooltip, XAxis, YAxis, Legend, Line } from 'recharts'
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '../ui'
import type { ChartConfig } from '@/components/ui'
import type { ProtectionRatePerMonthRecord } from '@/hooks'

export function ProtectionRateLineChart({ protectionRatePerMonthRecord }: { protectionRatePerMonthRecord: ProtectionRatePerMonthRecord[] }) {
  const chartConfig = {
    first_instance_protection_rate: { 
      label: t('statistics.firstInstanceProtectionRate'),
      color: '#04356C'
    },
    second_instance_protection_rate: { 
      label: t('statistics.secondInstanceProtectionRate'),
      color: '#076c04'
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <LineChart data={protectionRatePerMonthRecord}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="display_date" />
        <YAxis />
        <Tooltip
          content={<ChartTooltipContent labelFormatter={label => t('statistics.periodCoveredLabel', { period: label })} />}
        />
        <Legend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="first_instance_protection_rate" stroke={chartConfig.first_instance_protection_rate.color} />
        <Line type="monotone" dataKey="second_instance_protection_rate" stroke={chartConfig.second_instance_protection_rate.color} />
      </LineChart>
    </ChartContainer>
  )
}
