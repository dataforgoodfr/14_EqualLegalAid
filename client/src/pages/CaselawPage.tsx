import { useState } from 'react'
import { Loading, ErrorMessage, CaselawList } from '@/components'
import { HighlightTitle } from '@/components/ui'
import { FilterAction, FilterPanel } from '@/components/Filter'
import { useAirtableCaselaw } from '@/hooks/useAirtableCaselaw'
import { useTranslation } from 'react-i18next'
import { useAirtableFilter } from '@/hooks'
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
  useAirtableFilter()
  return (
    <>
      <HighlightTitle
        title={t('caselaw.highlightTitle')}
      />
      <div className="flex flex-wrap xl:gap-10">
        <div className="flex-auto xl:w-72 xl:flex-none xl:shrink-0">
          <div className="xl:sticky xl:top-13.5 relative">
            <div className="xl:max-h-[calc(100vh-54px)] xl:overflow-y-auto scrollbar-hidden">
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
          <div className="sticky top-0 z-10 bg-white py-5 pb-2 xl:top-13.5">
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
