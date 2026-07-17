import { useState } from 'react'
import { Loading, ErrorMessage, CaselawList } from '@/components'
import { HighlightTitle } from '@/components/ui'
import { FilterAction, FilterPanel } from '@/components/Filter'
import { useAirtableCaselaw } from '@/hooks/useAirtableCaselaw'
import { useTranslation } from 'react-i18next'
import { useAirtableFilter } from '@/hooks'
import { useEmbedMode } from '@/hooks/useEmbedMode'
import { cn } from '@/lib/utils'
export const CaselawPage = () => {
  const {
    caselawRecords,
    dateBounds,
    loading,
    error,
    refetchCaselawRecords,
    fetchFilteredCaselaws,
    findSpecificCaseLawBasedOnId,
  } = useAirtableCaselaw()
  const [sortDesc, setSortDesc] = useState(true)
  const { t } = useTranslation()
  // En embed, HeaderNavigation (sticky, top-0, 54px) est masquée. Les offsets
  // sticky ci-dessous en dépendent :
  //   - barre de filtres : se colle sous la nav → 54px, ou 0 sans elle.
  //     Sans ce 0, la bande de 54px reste à nu et les cartes y défilent.
  //   - panneau de filtres : s'aligne sur le bouton « Sort by », qui tombe
  //     72px sous le haut de la barre. D'où 54+72=126, ou 0+72=72 en embed.
  const isEmbed = useEmbedMode()
  useAirtableFilter()
  return (
    <>
      <HighlightTitle title={t('caselaw.highlightTitle')} />
      <div className="flex flex-wrap xl:gap-10">
        {/* pt = hauteur du bloc « N Decisions » de la barre (py-5 + texte + mb-6),
            pour que le 1er filtre s'aligne sur « Sort by » avant que le sticky
            ne prenne le relais. Même valeur que le 72 de xl:top-[126px]. */}
        <div className="flex-auto xl:w-72 xl:flex-none xl:shrink-0 xl:pt-[72px]">
          <div className={cn(
            'relative xl:sticky',
            isEmbed ? 'xl:top-[72px]' : 'xl:top-[126px]',
          )}>
            <div className={cn(
              'scrollbar-hidden xl:overflow-y-auto',
              isEmbed ? 'xl:max-h-[calc(100vh-72px)]' : 'xl:max-h-[calc(100vh-126px)]',
            )}>
              <FilterPanel
                onApplyFilters={fetchFilteredCaselaws}
                minDate={dateBounds.minDate}
                maxDate={dateBounds.maxDate}
                count={caselawRecords.length}
              />
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent hidden xl:block" />
          </div>
        </div>
        <div className="w-full flex-auto bg-white xl:w-222">
          <div className={cn(
            'sticky top-0 z-10 bg-white py-5 pb-2',
            !isEmbed && 'xl:top-13.5',
          )}>
            <div className="relative z-2">
              <FilterAction
                count={caselawRecords.length}
                setSort={value => setSortDesc(value)}
                setFindSpecificCaseLaw={findSpecificCaseLawBasedOnId}
              />
            </div>
            <div className="absolute top-0 -right-1.5 -left-1.5 h-full bg-white xl:-right-5 xl:-left-5" />
          </div>
          {loading && <Loading />}
          {error && <ErrorMessage message={error} onRetry={refetchCaselawRecords} />}
          {!loading && !error && (
            <CaselawList
              records={caselawRecords}
              sortDesc={sortDesc}
            />
          )}
        </div>
      </div>
    </>
  )
}
