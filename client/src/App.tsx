import { lazy, Suspense, useState } from 'react'
import { useAirtableFilter } from '@/hooks'
import { Loading, ErrorMessage, CaselawList } from '@/components'
import { HeaderComponent } from '@/components/Header'
import { HighlightTitle } from '@/components/ui'
import { useTranslation } from 'react-i18next'

const AsylumApplicationsPage = lazy(() =>
  import('@/components/Indicators/AsylumApplicationsPage').then(m => ({ default: m.AsylumApplicationsPage })),
)
import { FilterAction, FilterPanel } from '@/components/Filter'
import { useAirtableCaselaw } from '@/hooks/useAirtableCaselaw'
import type { HeaderNavigationItemType } from '@/types'

function App() {
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
  const [activeTab, setActiveTab] = useState<HeaderNavigationItemType>('caselaw')
  const { t } = useTranslation()
  useAirtableFilter()

  return (
    <div className="app mx-auto my-0 w-full xl:max-w-315">
      <HeaderComponent setActiveTab={setActiveTab} />
      <main className="main-content px-4 xl:px-0">
        {activeTab === 'caselaw' && (
          <>
            <HighlightTitle
              title={t('caselaw.highlightTitle')}
            />
            <div className="flex flex-wrap xl:gap-10">
              <div className="flex-auto xl:w-72 xl:shrink-0 xl:flex-none">
                <FilterPanel
                  onApplyFilters={fetchFilteredCaselaws}
                  minDate={dateBounds.minDate}
                  maxDate={dateBounds.maxDate}
                  count={caselawRecords.length}
                />
              </div>
              <div className="w-full flex-auto xl:w-222">
                <div>
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
        )}

        {activeTab === 'statistics' && (
          <Suspense fallback={<Loading />}>
            <AsylumApplicationsPage />
          </Suspense>
        )}
      </main>
    </div>
  )
}

export default App
