import { useAirtable } from './hooks/useAirtable';
import { Header, Loading, ErrorMessage, DataTable } from './components';
import './App.css';

/**
 * Main application component
 */
function App() {
  const { records, loading, error, refetch } = useAirtable();

  return (
    <div className="App">
      <Header recordCount={records.length} loading={loading} error={error} onRefresh={refetch} />

      <main className="main-content">
        {loading && <Loading />}

        {error && <ErrorMessage message={error} onRetry={refetch} />}

        {!loading && !error && <DataTable records={records} />}
      </main>
    </div>
  );
}

export default App;
