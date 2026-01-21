import { useState, useEffect } from 'react';
import { createAirtableService } from '../services/airtableService';
import { AIRTABLE_CONFIG, APP_CONFIG } from '../constants/config';
import type { AirtableRecord } from '../types';

/**
 * Custom hook for fetching and managing Airtable records
 */
export const useAirtable = () => {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const airtableService = createAirtableService(AIRTABLE_CONFIG);
      const fetchedRecords = await airtableService.fetchRecords(
        APP_CONFIG.defaultView,
        APP_CONFIG.maxRecords
      );

      setRecords(fetchedRecords);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch records from Airtable';
      setError(errorMessage);
      console.error('Airtable error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
  };
};
