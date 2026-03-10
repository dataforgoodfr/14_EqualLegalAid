import { useEffect, useState } from 'react'
import { useAirtableCaselaw, useAirtableFilter } from '@/hooks'
import { Header, Loading, ErrorMessage, CaselawList } from '@/components'
import './App.css'
import { Button } from './components/ui/button'
import { FilterPanel } from '@/components/Filter'
/**
 * Main application component
 */
function App() {
  const { caselawRecords, loading, error, refetchCaselawRecords } = useAirtableCaselaw()
  const [sortDesc, setSortDesc] = useState(true) // true = recent first (desc), false = oldest first (asc)
  const handleSortToggle = () => {
    setSortDesc(!sortDesc)
  }
 useAirtableFilter()


  return (
    <div className="app">
      <Header recordCount={caselawRecords.length} loading={loading} error={error} onRefresh={refetchCaselawRecords} />
      <Button onClick={handleSortToggle}>Sort</Button>

      <main className="main-content">
        {loading && <Loading />}
        {error && <ErrorMessage message={error} onRetry={refetchCaselawRecords} />}
        {!loading && !error && (
          <div className="flex xl:gap-10">
            <div className="flex-auto">
              <FilterPanel />
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
