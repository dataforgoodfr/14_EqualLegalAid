import { useState } from 'react'
import { useAirtableFilter } from '@/hooks'
import { Header, Loading, ErrorMessage, CaselawList, AsylumApplicationsPage } from '@/components'
import './App.css'
import { Button } from './components/ui/button'
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
  } = useAirtableCaselaw()
  const [sortDesc, setSortDesc] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('caselaw')

  useAirtableFilter()

  return (
    <div className="app">
      <Header
        recordCount={caselawRecords.length}
        loading={loading}
        error={error}
        onRefresh={refetchCaselawRecords}
      />
      <main className="main-content">
        {loading && <Loading />}
        {error && <ErrorMessage message={error} onRetry={refetchCaselawRecords} />}
        <div className="flex xl:gap-10">
          <div className="flex-auto">
            <FilterPanel onApplyFilters={fetchFilteredCaselaws} />
          </div>
          <div className="flex-auto xl:w-222">
            {!loading && !error && (
              <FilterAction
                count={caselawRecords.length}
                setSort={value => setSortDesc(value)}
              />
            )}

            {!loading && !error && (
              <CaselawList
                records={caselawRecords}
                sortDesc={sortDesc}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
