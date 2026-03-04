import { useState } from 'react';
import { useAirtable } from './hooks/useAirtable';
import { Header, Loading, ErrorMessage, CaselawList } from './components';
import './App.css';
import { Button } from './components/ui/button';
import { FilterPanel } from './components/Filter/FilterPanel/FilterPanel'

/**
 * Main application component
 */
function App() {
  const { records, filters, loading, error, refetch } = useAirtable();
  const [sortDesc, setSortDesc] = useState(true); // true = recent first (desc), false = oldest first (asc)
  const handleSortToggle = () => {
    setSortDesc(!sortDesc);
  };
  console.log('filters', filters)
  return (
    <div className="app">
      <Header recordCount={records.length} loading={loading} error={error} onRefresh={refetch} />
      <Button onClick={handleSortToggle}>Sort</Button>

      <main className="main-content">
        {loading && <Loading />}
        {error && <ErrorMessage message={error} onRetry={refetch} />}
        {!loading && !error && (
          <div className='flex xl:gap-10'>
            <div className="flex-auto">
              <FilterPanel />
            </div>
            <div className='flex-auto xl:w-[888px]'>
              <CaselawList
                records={records}
                sortDesc={sortDesc}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
