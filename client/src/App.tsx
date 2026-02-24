import { useState } from 'react';
import { useAirtable } from './hooks/useAirtable';
import { Header, Loading, ErrorMessage, CaselawList } from './components';
import './App.css';
import { Button } from './components/ui/button';
import { ColoredText } from './components/ColoredText/ColoredText';

/**
 * Main application component
 */
function App() {
  const { records, loading, error, refetch } = useAirtable();
  const [sortDesc, setSortDesc] = useState(true); // true = recent first (desc), false = oldest first (asc)

  const handleSortToggle = () => {
    setSortDesc(!sortDesc);
  };

  return (
    <div className="App">
      <Header recordCount={records.length} loading={loading} error={error} onRefresh={refetch} />

      <Button onClick={handleSortToggle}>Sort</Button>
      <ColoredText>
        Find all the decision to <span>get the best chance</span>
      </ColoredText>
      <main className="main-content">
        {loading && <Loading />}

        {error && <ErrorMessage message={error} onRetry={refetch} />}

        {!loading && !error && <CaselawList records={records} sortDesc={sortDesc} />}
      </main>
    </div>
  );
}

export default App;
