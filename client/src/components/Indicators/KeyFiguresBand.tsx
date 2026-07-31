import { useTranslation } from 'react-i18next'
import type { KeyFigureCard, KeyFiguresData } from '@/hooks/useKeyFigures'
import { NAV_COLORS } from '@/components/Layout/navTokens'

const fmt = (n: number | null) =>
  // Espace fine insécable comme séparateur de milliers, conformément à la maquette.
  n != null ? n.toLocaleString('fr-FR').replace(/ | | /g, ' ') : '—'

// Airtable ne porte pas la période dans un champ dédié : elle est incluse dans le
// libellé (« First time applicants in Europe 2015-2025 »). On la détache pour la
// composer séparément, et on rend le libellé entier si le motif est absent.
const PERIOD_RE = /\s*(?:in\s+)?(\d{4}\s*[–-]\s*\d{4}|\d{4})\s*$/i

function splitPeriod(label: string): { label: string, period: string } {
  const m = PERIOD_RE.exec(label)
  if (!m) return { label: label.trim(), period: '' }
  return { label: label.slice(0, m.index).trim(), period: m[1].replace(/\s/g, '') }
}

function Cell({ card, isGr, bordered }: { card: KeyFigureCard, isGr: boolean, bordered: boolean }) {
  const { label, period } = splitPeriod(isGr ? card.label_gr : card.label_en)
  return (
    // Padding symétrique et non seulement à gauche : avec un contenu centré, une
    // marge d'un seul côté décalerait visuellement la colonne par rapport au trait.
    <div
      className={`px-3 text-center ${bordered ? 'md:border-l' : ''}`}
      style={bordered ? { borderColor: 'rgba(255,255,255,.16)' } : undefined}
    >
      <div
        className="text-[32px] leading-none font-bold tracking-[-0.02em] text-white tabular-nums"
      >
        {fmt(card.value)}
      </div>
      {/* min-height réserve deux lignes : sans elle les quatre valeurs ne partagent
          plus la même ligne de base dès qu'un libellé passe sur deux lignes. */}
      <div
        className="mt-2.5 text-xs leading-[1.45] font-medium"
        style={{ color: NAV_COLORS.mutedOnNavy, minHeight: '2.6em' }}
      >
        {label}
      </div>
      {period && (
        <div
          className="text-[10.5px] leading-none font-bold tracking-[0.1em] uppercase"
          style={{ color: NAV_COLORS.orangeLight }}
        >
          {period}
        </div>
      )}
    </div>
  )
}

export function KeyFiguresBand({ data }: { data: KeyFiguresData }) {
  const { i18n } = useTranslation()
  const isGr = i18n.language === 'el'
  const title = isGr ? data.title_gr : data.title_en
  const subtitle = isGr ? data.subtitle_gr : data.subtitle_en

  const cards = [data.arrivalsEurope, data.arrivalsGreece, data.applicationsGreece, data.successfulDecisions]

  return (
    <div
      className="relative left-1/2 -ml-[50vw] w-screen px-6 py-9 md:px-12 md:py-10"
      style={{ backgroundColor: NAV_COLORS.navy }}
    >
      <div className="mx-auto w-full xl:max-w-315">
        {title && (
          <div className="mb-8 text-center">
            <h2 className="font-gotham text-[28px] leading-[1.15] font-extrabold tracking-[0.01em] text-white uppercase md:text-[32px]">
              {title}
            </h2>
            <div
              className="mx-auto mt-4 h-[5px] w-[88px] rounded-[3px]"
              style={{ backgroundColor: NAV_COLORS.orange }}
            />
          </div>
        )}

        {subtitle && (
          <p
            className="font-montserrat mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed whitespace-pre-line"
            style={{ color: NAV_COLORS.mutedOnNavy }}
          >
            {subtitle}
          </p>
        )}

        <div className="font-montserrat grid grid-cols-2 items-start gap-7 md:grid-cols-4">
          {cards.map((card, i) => (
            <Cell key={i} card={card} isGr={isGr} bordered={i > 0} />
          ))}
        </div>
      </div>
    </div>
  )
}
