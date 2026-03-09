import { useAirtable } from './hooks/useAirtable'
import { Header, Loading, ErrorMessage, CaselawList } from './components'
import './App.css'
import { Button } from './components/ui/button'

/**
 * Main application component
 */
function App() {
  const {
    records,
    loading,
    error,
    pagination,
    sortDirection,
    setSortDirection,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setPageSize,
    refetch,
  } = useAirtable()

  const handleSortToggle = () => {
    setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
  }

  const recordSummary = !loading && !error
    ? `${records.length} ${records.length === 1 ? 'record' : 'records'} on page ${pagination.currentPage}${pagination.isLastPageKnown ? ` of ${pagination.knownPageCount}` : ` of ${pagination.knownPageCount}+`}`
    : undefined

  return (
    <div className="App">
      <Header recordSummary={recordSummary} loading={loading} error={error} onRefresh={refetch} />

      <Button onClick={handleSortToggle}>Sort</Button>
      <main className="main-content">
        {loading && <Loading />}

        {error && <ErrorMessage message={error} onRetry={refetch} />}

        {!loading && !error && <CaselawList records={records} onNextPage={goToNextPage} onPreviousPage={goToPreviousPage} onPageChange={goToPage} onPageSizeChange={setPageSize} pagination={pagination} />}
      </main>
    </div>
  )
}

export default App
