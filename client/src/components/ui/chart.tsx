import * as React from 'react'
import {
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

import { cn } from '@/lib/utils'

// ─── Shared chart chrome ────────────────────────────────────────────────────
// Spread these onto <CartesianGrid>/<XAxis>/<YAxis>/<Line> in each chart —
// recharts requires its own components as direct children, so these are plain
// prop objects (not wrapper components) that stay in one place to tweak.

// Solid, recessive hairline grid — no dashed "checkerboard", horizontal only.
export const CHART_GRID_PROPS = {
  strokeDasharray: '0',
  stroke: 'var(--border)',
  vertical: false,
} as const

// Minimal axis: no axis line/tick marks, muted small tick labels.
export const CHART_AXIS_PROPS = {
  axisLine: false,
  tickLine: false,
  tick: { fill: 'var(--muted-foreground)', fontSize: 11 },
  tickMargin: 8,
} as const

// 2px rounded line, no resting dots — the active dot below carries the hover state.
export const CHART_LINE_PROPS = {
  strokeWidth: 2,
  dot: false,
  activeDot: { r: 4, strokeWidth: 2, stroke: 'var(--background)' },
} as const

// Minimal legend payload shape (avoids brittle deep recharts type imports)
interface LegendPayload {
  value?: string
  dataKey?: string | number
  color?: string
}

// ─── Config ──────────────────────────────────────────────────────────────────

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    color?: string
    icon?: React.ComponentType
  }
}

type ChartContextValue = { config: ChartConfig }

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error('useChart must be used inside <ChartContainer />')
  return ctx
}

// ─── ChartContainer ───────────────────────────────────────────────────────────

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ComponentProps<typeof ResponsiveContainer>['children']
}) {
  const uid = React.useId()
  const chartId = `chart-${id ?? uid.replace(/:/g, '')}`

  // Inject CSS color variables so recharts fill="var(--color-xxx)" works
  const styleVars = Object.entries(config).reduce<Record<string, string>>((acc, [key, val]) => {
    if (val.color) acc[`--color-${key}`] = val.color
    return acc
  }, {})

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        style={styleVars as React.CSSProperties}
        className={cn(
          'flex aspect-video justify-center text-xs',
          '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground',
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          '[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border',
          '[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted',
          '[&_.recharts-layer]:outline-none',
          '[&_.recharts-surface]:outline-none',
          className,
        )}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

// ─── ChartTooltip (re-export) ─────────────────────────────────────────────────

const ChartTooltip = Tooltip

// ─── ChartTooltipContent ──────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name?: string
  dataKey?: string | number
  value?: number | string
  color?: string
  fill?: string
  payload?: Record<string, unknown>
}

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  hideLabel = false,
  hideIndicator = false,
  indicator = 'dot',
  labelFormatter,
  multiColumn = false,
  sortByValueDesc = false,
}: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
  className?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: 'dot' | 'line' | 'dashed'
  multiColumn?: boolean
  sortByValueDesc?: boolean
  labelFormatter?: (label: string | number, payload: TooltipPayloadItem[]) => React.ReactNode
}) {
  const { config } = useChart()

  if (!active || !payload?.length) return null

  const displayLabel = labelFormatter
    ? labelFormatter(label ?? '', payload)
    : label

  const items = sortByValueDesc
    ? [...payload].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
    : payload

  return (
    <div
      className={cn(
        'grid min-w-[8rem] gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
        className,
      )}
    >
      {!hideLabel && displayLabel && (
        <div className="font-medium">{displayLabel}</div>
      )}
      <div className={cn(
        "grid gap-1",
        multiColumn ? "grid-cols-2 gap-x-4 gap-y-1.5" : "grid-cols-1"
      )}>
        {items.map((item, i) => {
          const key = String(item.dataKey ?? item.name ?? 'value')
          const cfg = config[key]
          const color = item.color ?? item.fill ?? cfg?.color

          return (
            <div key={i} className="flex items-center gap-2">
              {!hideIndicator && (
                <span
                  className={cn(
                    'shrink-0 rounded-[2px]',
                    indicator === 'dot' && 'size-2.5',
                    indicator === 'line' && 'h-3 w-1',
                    indicator === 'dashed' && 'h-3 w-0 border-[1.5px] border-dashed bg-transparent',
                  )}
                  style={{
                    backgroundColor: indicator !== 'dashed' ? color : undefined,
                    borderColor: indicator === 'dashed' ? color : undefined,
                  }}
                />
              )}
              <div className="flex flex-1 items-center justify-between gap-4">
                <span className="text-muted-foreground">
                  {cfg?.label ?? item.name ?? key}
                </span>
                {item.value !== undefined && (
                  <span className="font-mono font-medium tabular-nums">
                    {typeof item.value === 'number'
                      ? item.value.toLocaleString('fr-FR')
                      : item.value}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── ChartLegend (re-export) ──────────────────────────────────────────────────

const ChartLegend = Legend

// ─── ChartLegendContent ───────────────────────────────────────────────────────

function ChartLegendContent({
  className,
  payload,
  verticalAlign = 'bottom',
  hideIcon = false,
  nameKey,
}: {
  className?: string
  payload?: LegendPayload[]
  verticalAlign?: 'top' | 'bottom' | 'middle'
  hideIcon?: boolean
  nameKey?: string
}) {
  const { config } = useChart()

  if (!payload?.length) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-4 text-xs',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload.map((item) => {
        const key = String(nameKey ?? item.dataKey ?? item.value ?? 'value')
        const cfg = config[key]

        return (
          <div key={key} className="flex items-center gap-1.5">
            {cfg?.icon && !hideIcon
              ? <cfg.icon />
              : (
                <div
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
              )}
            <span>{cfg?.label ?? item.value}</span>
          </div>
        )
      })}
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
}
