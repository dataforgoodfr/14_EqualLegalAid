import { useAirtable } from './hooks/useAirtable';
import { Header, Loading, ErrorMessage, CaselawList } from './components';
import './App.css';
import { Button } from './components/ui/button';

/**
 * Main application component
 */
function App() {
  const { records, loading, error, refetch } = useAirtable();

  return (
    <div className="App">
      <Header recordCount={records.length} loading={loading} error={error} onRefresh={refetch} />

      <Button>Sort</Button>
      <main className="main-content">
        {loading && <Loading />}

        {error && <ErrorMessage message={error} onRetry={refetch} />}

        {!loading && !error && <CaselawList records={records} />}
      </main>
    </div>
  );
}

export default App;
