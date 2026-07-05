function usePaginatedFetch(endpoint, { page, size, sortBy, sortDir, filters }) {
  const { get } = useApi();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams({
      page,
      size,
      sortBy,
      sortDir,
      ...filters
    });

    get(`${endpoint}?${params.toString()}`)
      .then(res => res.json())
      .then(json => {
        setData(json.content);
        setTotalPages(json.page.totalPages);
        setTotalCount(json.page.totalElements);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

  }, [endpoint, page, size, sortBy, sortDir, filters]);

  return { data, loading, error, totalPages, totalCount };
}
