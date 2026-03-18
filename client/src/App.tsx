import { useState } from 'react'
import { useAirtableFilter } from '@/hooks'
import { Header, Loading, ErrorMessage, CaselawList, AsylumApplicationsPage } from '@/components'
import './App.css'
import { Button } from './components/ui/button'
import { FilterPanel } from '@/components/Filter'
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
  } = useAirtableCaselaw()
  const [sortDesc, setSortDesc] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('caselaw')

  useAirtableFilter()

  return (
    <div className="app">
      <Header recordCount={caselawRecords.length} loading={loading} error={error} onRefresh={refetchCaselawRecords} />

      {/* Tab navigation */}
      <nav className="flex gap-1 border-b border-border px-6 pt-2">
        {([
          { id: 'caselaw', label: 'Caselaw Database' },
          { id: 'statistics', label: 'EU Asylum Statistics' },
        ] as { id: Tab; label: string }[]).map(tab => (
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

      <main className="main-content">
        {activeTab === 'caselaw' && (
          <>
            <Button onClick={() => setSortDesc(!sortDesc)}>Sort</Button>
            {loading && <Loading />}
            {error && <ErrorMessage message={error} onRetry={refetchCaselawRecords} />}
            <div className="flex xl:gap-10">
              <div className="flex-auto">
                <FilterPanel onApplyFilters={fetchFilteredCaselaws} />
              </div>
              <div className="flex-auto xl:w-222">
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

        {activeTab === 'statistics' && <AsylumApplicationsPage />}
      </main>
    </div>
  )
}

export default App
