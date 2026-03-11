import { useState } from 'react'
import { useAirtableFilter } from '@/hooks'
import { Header, Loading, ErrorMessage, CaselawList } from '@/components'
import './App.css'
import { Button } from './components/ui/button'
import { FilterPanel } from '@/components/Filter'
import { useAirtableCaselaw } from './hooks/useAirtableCaselaw'
/**
 * Main application component
 */
function App() {
  const { caselawRecords, loading, error, refetchCaselawRecords, fetchFilteredCaselaws } = useAirtableCaselaw()
  const [sortDesc, setSortDesc] = useState(true) // true = recent first (desc), false = oldest first (asc)

  useAirtableFilter()

  return (
    <div className="app">
      <Header recordCount={caselawRecords.length} loading={loading} error={error} onRefresh={refetchCaselawRecords} />
      <Button onClick={() => setSortDesc(!sortDesc)}>Sort</Button>

      <main className="main-content">
        {loading && <Loading />}
        {error && <ErrorMessage message={error} onRetry={refetchCaselawRecords} />}
        {!loading && !error && (
          <div className="flex xl:gap-10">
            <div className="flex-auto">
              <FilterPanel onApplyFilters={fetchFilteredCaselaws} />
            </div>
            <div className="flex-auto xl:w-222">
              <CaselawList
                records={caselawRecords}
                sortDesc={sortDesc}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
