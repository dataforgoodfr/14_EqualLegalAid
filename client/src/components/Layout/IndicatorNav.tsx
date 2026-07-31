import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { NAV_COLORS, NAV_TRANSITION } from './navTokens'

export interface IndicatorItem {
  label: string
  to: string
  /** Clé de groupe, traduite à l'affichage. Les groupes sont déduits dans l'ordre
   *  de la liste : ajouter un indicateur ne demande pas de toucher à la nav. */
  group: string
}

export function IndicatorNav({
  items,
  groupLabel,
}: {
  items: IndicatorItem[]
  groupLabel: (group: string) => string
}) {
  const navigate = useNavigate()
  const location = useLocation()

  // Ordre des groupes = ordre d'apparition dans `items`, pas alphabétique.
  const groups = useMemo(() => {
    const map = new Map<string, IndicatorItem[]>()
    for (const item of items) {
      if (!map.has(item.group)) map.set(item.group, [])
      map.get(item.group)!.push(item)
    }
    return map
  }, [items])

  // Le groupe actif se déduit de l'URL, non d'un état local : sans ça un lien
  // profond ou un retour arrière ouvrirait le mauvais groupe.
  const activeItem = items.find(i => location.pathname.endsWith(`/${i.to}`))
  const activeGroup = activeItem?.group ?? items[0]?.group ?? ''
  const pills = groups.get(activeGroup) ?? []

  const go = (to: string) => navigate({ pathname: to, search: location.search })

  return (
    <div className="font-montserrat">
      {/* Niveau 1 — groupes */}
      <div
        className="flex gap-1 overflow-x-auto border-b"
        style={{ borderColor: NAV_COLORS.border }}
      >
        {Array.from(groups.entries()).map(([group, groupItems]) => {
          const isActive = group === activeGroup
          return (
            <button
              key={group}
              type="button"
              // Cliquer un groupe ouvre son premier indicateur : un onglet de groupe
              // sans sélection laisserait la zone de contenu vide.
              onClick={() => go(groupItems[0].to)}
              aria-selected={isActive}
              className="-mb-px inline-flex flex-shrink-0 items-center gap-2 border-b-[3px] px-4 py-2.5 text-[12.5px] leading-none font-bold tracking-[0.06em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 md:px-5 md:py-3"
              style={{
                borderBottomColor: isActive ? NAV_COLORS.orange : 'transparent',
                color: isActive ? NAV_COLORS.navy : NAV_COLORS.labelMuted,
                outlineColor: NAV_COLORS.orange,
                transition: NAV_TRANSITION,
              }}
            >
              {groupLabel(group)}
              <span
                className="rounded-full px-1.5 py-1 text-[10px] leading-none font-bold tabular-nums"
                style={{
                  backgroundColor: isActive ? NAV_COLORS.navy : NAV_COLORS.pill,
                  color: isActive ? '#FFFFFF' : NAV_COLORS.labelMuted,
                }}
              >
                {String(groupItems.length).padStart(2, '0')}
              </span>
            </button>
          )
        })}
      </div>

      {/* Niveau 2 — indicateurs du groupe actif */}
      <div className="flex flex-wrap gap-2 pt-5">
        {pills.map((item) => {
          const isActive = item.to === activeItem?.to
          return (
            <button
              key={item.to}
              type="button"
              onClick={() => go(item.to)}
              aria-current={isActive ? 'page' : undefined}
              className="rounded-full border border-transparent px-3.5 py-[7px] text-[13.5px] leading-[1.2] font-semibold tracking-[-0.005em] active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 md:px-4 md:py-[9px]"
              style={{
                backgroundColor: isActive ? NAV_COLORS.navy : NAV_COLORS.pill,
                color: isActive ? '#FFFFFF' : NAV_COLORS.navy,
                outlineColor: NAV_COLORS.orange,
                transition: NAV_TRANSITION,
              }}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
