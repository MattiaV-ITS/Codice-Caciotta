import { useState, useEffect, useMemo } from 'react';
import { useApi } from '../services/apiService';

export function usePaginatedFetch(endpoint, { page, size, sortBy, sortDir, filters }) {
  const { get } = useApi();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Create memoized filters with stable reference when content doesn't change
  const memoizedFilters = useMemo(() => {
    const filtered = {};
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        filtered[key] = value;
      }
    });
    return filtered;
  }, [
    // Individual dependencies for maximum stability
    filters?.search,
    filters?.stato,
    filters?.specie, 
    filters?.citta,
    filters?.animaleId // Add other potential filter fields
  ]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page,
          size,
          sortBy,
          sortDir,
          ...memoizedFilters
        });

        const response = await get(`${endpoint}?${params.toString()}`);
        const json = await response.json();
        
        if (isMounted) {
          setData(json.content || []);
          setTotalPages(json.page?.totalPages || 0);
          setTotalCount(json.page?.totalElements || 0);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [endpoint, page, size, sortBy, sortDir, memoizedFilters, get]);

  return { data, loading, error, totalPages, totalCount };
}
