import { useState } from 'react'
import { useAirtableFilter } from '@/hooks'
import { Loading, ErrorMessage, CaselawList } from '@/components'
import { HighlightTitle } from '@/components/ui'
import { useTranslation } from 'react-i18next'

import { FilterAction, FilterPanel } from '@/components/Filter'
import { useAirtableCaselaw } from '@/hooks/useAirtableCaselaw'

export default function DecisionPage() {
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
          <div className="xl:sticky xl:top-20 xl:max-h-[calc(100vh-100px)] xl:overflow-y-auto">
            <FilterPanel
              onApplyFilters={fetchFilteredCaselaws}
              minDate={dateBounds.minDate}
              maxDate={dateBounds.maxDate}
              count={caselawRecords.length}
            />
          </div>
        </div>
        <div className="w-full flex-auto xl:w-222">
          <div className="sticky top-0 z-10 bg-white pb-2 xl:top-14">
            <FilterAction
              count={caselawRecords.length}
              setSort={value => setSortDesc(value)}
              setFindSpecificCaseLaw={findSpecificCaseLawBasedOnId}
            />
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
