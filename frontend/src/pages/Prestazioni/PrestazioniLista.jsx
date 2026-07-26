import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../services/apiService';
import ListaTable from '../../components/ListaTable/ListaTable';
import { useTableControls } from '../../hooks/useTableControls';
import { useSearchControls } from '../../hooks/useSearchControls';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

function PrestazioniLista() {
  const { get } = useApi();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [allPrestazioni, setAllPrestazioni] = useState([]);

  // Table controls
  const {
    page, size, sortBy, sortDir,
    setPage, handleSizeChange, handleSort
  } = useTableControls({
    defaultSortBy: 'nomePrestazione',
    defaultSortDir: 'asc',
    defaultPageSize: 10
  });

  // Search controls
  const {
    searchTerm, searchFields,
    handleSearchChange, handleSearchSubmit, handleSearchClear
  } = useSearchControls(['nomePrestazione', 'descrizione']);

  const memoizedFilters = useMemo(() => ({
    search: searchTerm
  }), [searchTerm]);

  // Fetch prestazioni data
  const { data, loading, error, totalElements, totalPages } = usePaginatedFetch(
    '/api/prestazioni',
    { page, size, sortBy, sortDir, filters: memoizedFilters }
  );

  // Fetch all prestazioni for stats calculation
  useEffect(() => {
    const fetchAllPrestazioni = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);

        // Fetch all prestazioni without pagination for stats
        const response = await get('/api/prestazioni?size=1000');
        if (response.ok) {
          const result = await response.json();
          const prestazioniData = Array.isArray(result) ? result : (result.content || []);
          setAllPrestazioni(prestazioniData);

          // Calculate stats
          const totalCount = prestazioniData.length;
          const activeCount = prestazioniData.filter(p => p.stato === 'ATTIVO').length;
          const inactiveCount = prestazioniData.filter(p => p.stato === 'DISABILITATO').length;

          // Calculate average cost and duration
          const validCosts = prestazioniData
            .map(p => {
              if (typeof p.costoBase === 'string') return parseFloat(p.costoBase);
              if (typeof p.costoBase === 'object') return parseFloat(p.costoBase?.amount || p.costoBase?.value || 0);
              return p.costoBase || 0;
            })
            .filter(c => !isNaN(c));

          const validDurations = prestazioniData
            .map(p => p.durataStimata || 0)
            .filter(d => !isNaN(d));

          const averageCost = validCosts.length > 0 ? validCosts.reduce((sum, c) => sum + c, 0) / validCosts.length : 0;
          const averageDuration = validDurations.length > 0 ? validDurations.reduce((sum, d) => sum + d, 0) / validDurations.length : 0;

          setStats({
            totalCount,
            activeCount,
            inactiveCount,
            averageCost: averageCost.toFixed(2),
            averageDuration: Math.round(averageDuration)
          });
        } else {
          throw new Error('Failed to fetch prestazioni for stats');
        }
      } catch (err) {
        console.error('Error fetching prestazioni stats:', err);
        setStatsError(err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchAllPrestazioni();
  }, [get]);

  const handleCreatePrestazione = () => {
    navigate('/prestazioni/create');
  };

  const handleEditPrestazione = (prestazioneId) => {
    navigate(`/prestazioni/edit/${prestazioneId}`);
  };

  const columns = [
    {
      Header: 'Nome Prestazione',
      accessor: 'nomePrestazione',
      sortable: true,
      width: '25%'
    },
    {
      Header: 'Descrizione',
      accessor: 'descrizione',
      sortable: false,
      width: '30%'
    },
    {
      Header: 'Durata (min)',
      accessor: 'durataStimata',
      sortable: true,
      width: '10%',
      Cell: ({ value }) => value + ' min'
    },
    {
      Header: 'Costo Base',
      accessor: 'costoBase',
      sortable: true,
      width: '10%',
      Cell: ({ value }) => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : typeof value === 'object' ? parseFloat(value.amount || value.value) : value;
        return '€' + (isNaN(numericValue) ? '0.00' : numericValue.toFixed(2));
      }
    },
    {
      Header: 'Stato',
      accessor: 'stato',
      sortable: true,
      width: '10%'
    },
    {
      Header: 'Colore',
      accessor: 'colore',
      sortable: false,
      width: '10%',
      Cell: ({ value }) => (
        <div style={{
          width: '20px',
          height: '20px',
          backgroundColor: value || '#ccc',
          borderRadius: '50%',
          border: '1px solid #ddd'
        }} />
      )
    }
  ];

  // Stats content for display
  const statsContent = (
    <div className="stats-grid" style={{ marginBottom: 'var(--space-5)' }}>
      {statsLoading ? (
        <div className="stats-loading">
          <LoadingSpinner size="small" />
        </div>
      ) : statsError ? (
        <div className="stats-error">
          <ErrorMessage error={statsError} />
        </div>
      ) : stats ? (
        <>
          <div className="stat-card">
            <div className="stat-number stat-primary">{stats.totalCount}</div>
            <div className="stat-label">Totale Prestazioni</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-success">
              {stats.activeCount}
            </div>
            <div className="stat-label">Attive</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-gray">
              {stats.inactiveCount}
            </div>
            <div className="stat-label">Disabilitate</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-info">
              €{stats.averageCost}
            </div>
            <div className="stat-label">Costo Medio</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-info">
              {stats.averageDuration} min
            </div>
            <div className="stat-label">Durata Media</div>
          </div>
        </>
      ) : null}
    </div>
  );

  return (
    <div className="lista-page">
      <div className="lista-header">
        <h2>Gestione Prestazioni</h2>
        <div className="lista-actions">
          <button
            onClick={handleCreatePrestazione}
            className="btn btn-primary"
          >
            + Nuova Prestazione
          </button>
        </div>
      </div>

      {statsContent}

      <div className="lista-controls">
        <div className="search-control">
          <input
            type="text"
            placeholder="Cerca prestazioni..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="form-control search-input"
          />
          <button onClick={handleSearchSubmit} className="btn btn-secondary">
            <i className="fas fa-search" />
          </button>
          {searchTerm && (
            <button onClick={handleSearchClear} className="btn btn-text">
              <i className="fas fa-times" />
            </button>
          )}
        </div>
      </div>

      <div className="lista-content">
        <ListaTable
          columns={columns}
          data={data}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
          onSizeChange={handleSizeChange}
          onSortChange={handleSort}
          onRowClick={handleEditPrestazione}
          emptyMessage="Nessuna prestazione trovata"
        />
      </div>
    </div>
  );
}

export default PrestazioniLista;