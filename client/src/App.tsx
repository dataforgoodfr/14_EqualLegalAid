import { useState } from 'react'
import { useAirtableFilter } from '@/hooks'
import { Header, Loading, ErrorMessage, CaselawList, AsylumApplicationsPage } from '@/components'
import './App.css'
import { FilterAction, FilterPanel } from '@/components/Filter'
import { useAirtableCaselaw } from '@/hooks/useAirtableCaselaw'

type Tab = 'caselaw' | 'statistics'

/**
 * Main application component
 */
function App() {
  const {
    caselawRecords,
    loading,
    error,
    refetchCaselawRecords,
    fetchFilteredCaselaws,
    findSpecificCaseLawBasedOnId,
  } = useAirtableCaselaw()
  const [sortDesc, setSortDesc] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('caselaw')

  useAirtableFilter()

  return (
    <div className="app">
      <Header />

      {/* Tab navigation */}
      <nav className="border-border bg-background sticky top-0 z-10 flex gap-1 border-b px-6 pt-2">
        {([
          { id: 'caselaw', label: 'Caselaw Database' },
          { id: 'statistics', label: 'EU Asylum Statistics' },
        ] as { id: Tab, label: string }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'rounded-t-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border border-b-0 border-border bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main-content py-5">
        {activeTab === 'caselaw' && (
          <div className="flex xl:gap-10">
            <div className="flex-auto">
              <FilterPanel onApplyFilters={fetchFilteredCaselaws} />
            </div>
            <div className="flex-auto xl:w-222">
              <FilterAction
                count={caselawRecords.length}
                setSort={value => setSortDesc(value)}
                setFindSpecificCaseLaw={findSpecificCaseLawBasedOnId}
              />
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
        )}

        {activeTab === 'statistics' && <AsylumApplicationsPage />}
      </main>
    </div>
  )
}

export default App
