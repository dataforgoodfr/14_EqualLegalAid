import { useTranslation } from 'react-i18next'
import { StatCard } from '@/components/ui'
import type { KeyFigureCard, KeyFiguresData } from '@/hooks/useKeyFigures'

const fmt = (n: number | null) =>
  n != null ? n.toLocaleString('en-US') : '—'

function KeyFigureStatCard({ card, isGr }: { card: KeyFigureCard; isGr: boolean }) {
  const label = isGr ? card.label_gr : card.label_en
  return <StatCard label={label} value={fmt(card.value)} />
}

export function KeyFiguresHeader({ data }: { data: KeyFiguresData }) {
  const { i18n } = useTranslation()
  const isGr = i18n.language === 'el'

  const title = isGr ? data.title_gr : data.title_en
  const subtitle = isGr ? data.subtitle_gr : data.subtitle_en
  const last_update_title = isGr ? data.last_updated_title_gr : data.last_updated_title_en

  return (
    <div className="py-8 space-y-6 border-b border-gray-200">

      {/* Title + description */}
      {(title || subtitle) && (
        <div className="space-y-3">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 leading-snug whitespace-pre-line">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Key figures */}
      <div className="space-y-3 rounded-xl border border-gray-300 p-4">
        <p className="text-xs text-gray-500">
          {last_update_title}
          {data.last_updated_on ? ` : ${data.last_updated_on}` : ''}
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KeyFigureStatCard card={data.arrivalsEurope} isGr={isGr} />
          <KeyFigureStatCard card={data.arrivalsGreece} isGr={isGr} />
          <KeyFigureStatCard card={data.applicationsGreece} isGr={isGr} />
          <KeyFigureStatCard card={data.successfulDecisions} isGr={isGr} />
        </div>
      </div>
    </div>
  )
}
