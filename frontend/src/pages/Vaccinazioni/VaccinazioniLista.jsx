import React, { useEffect, useState } from 'react';
import { formatDate } from '../../utils';
import { useTableControls } from '../../utils/useTableControls';
import { useApi } from '../../services/apiService';

function VaccinazioniLista() {
  const { get } = useApi();
  const [vaccinazioni, setVaccinazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [statoFilter, setStatoFilter] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const { 
    sortBy, 
    sortDir, 
    page, 
    size, 
    handleSort, 
    handleSizeChange, 
    getSortIndicator, 
    goToPreviousPage, 
    goToNextPage,
    setPage
  } = useTableControls({
    defaultSortBy: 'dataScadenza',
    defaultSortDir: 'asc', 
    defaultPageSize: 15
  });

  const pageSizeOptions = [5, 10, 15, 20];



  // Map backend status to frontend display
  const getStatusInfo = (status) => {
    // Handle case where status might be missing or have different casing
    const normalizedStatus = status ? String(status).toUpperCase() : '';
    
    const map = {
      'VALIDO': { label: 'Valido', className: 'badge-valido' },
      'PROSSIMO': { label: 'In scadenza', className: 'badge-prossimo' },
      'SCADUTO': { label: 'Scaduto', className: 'badge-scaduto' }
    };
    return map[normalizedStatus] || { label: 'Sconosciuto', className: 'badge-sconosciuto' };
  };



  useEffect(() => {
    setLoading(true);

    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);
    
    if (appliedSearchTerm) {
      params.append('search', appliedSearchTerm);
    }
    
    if (statoFilter) {
      params.append('stato', statoFilter);
    }

    // Always use the main endpoint since we're calculating status dynamically
    const endpoint = '/api/vaccinazioni';

    get(`${endpoint}?${params.toString()}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Errore nel fetching dei dati delle vaccinazioni');
        }
        return response.json();
      })
      .then(data => {
        // Main endpoint returns paginated response with backend-calculated status
        const vaccinazioniData = data.content || data;
        
        // Debug: Log the first vaccination to check if statoVaccinazione field is present
        if (vaccinazioniData.length > 0) {
          console.log('Sample vaccination data:', vaccinazioniData[0]);
        }
        
        // Store total count before filtering for pagination info
        const totalCount = data.page?.totalElements || vaccinazioniData.length;
        
        setTotalPages(data.page?.totalPages || 1);
        setPage(data.page?.number || 0);
        
        // Apply search filter if term is provided
        let filteredVaccinazioni = vaccinazioniData;
        if (appliedSearchTerm) {
          const searchLower = appliedSearchTerm.toLowerCase();
          filteredVaccinazioni = vaccinazioniData.filter(vaccinazione => 
            (vaccinazione.nomeAnimale && vaccinazione.nomeAnimale.toLowerCase().includes(searchLower)) ||
            (vaccinazione.tipoVaccino && vaccinazione.tipoVaccino.toLowerCase().includes(searchLower)) ||
            (vaccinazione.lotto && vaccinazione.lotto.toLowerCase().includes(searchLower)) ||
            (vaccinazione.note && vaccinazione.note.toLowerCase().includes(searchLower))
          );
        }
        
        // Apply status filter if selected (using backend-calculated status)
        if (statoFilter) {
          // Map frontend filter to backend status (they are the same now)
          const statusMap = {
            'VALIDO': 'VALIDO',
            'PROSSIMO': 'PROSSIMO', 
            'SCADUTO': 'SCADUTO'
          };
          const backendStatus = statusMap[statoFilter] || statoFilter;
          filteredVaccinazioni = filteredVaccinazioni.filter(
            vaccinazione => vaccinazione.statoVaccinazione === backendStatus
          );
        }
        
        setVaccinazioni(filteredVaccinazioni);
        setTotalCount(totalCount); // Store total count for pagination display
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [page, size, appliedSearchTerm, statoFilter, sortBy, sortDir, get]);

  const clearFilters = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setStatoFilter('');
    setPage(0);
  };

  // Calculate stats using backend-calculated status
  const totali = vaccinazioni.length;
  const validi = vaccinazioni.filter(v => v.statoVaccinazione === 'VALIDO').length;
  const scaduti = vaccinazioni.filter(v => v.statoVaccinazione === 'SCADUTO').length;
  const prossimi = vaccinazioni.filter(v => v.statoVaccinazione === 'PROSSIMO').length;

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento vaccinazioni...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="form-error">Errore: {error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Elenco Vaccinazioni</h2>
          <p className="page-subtitle">Gestisci le vaccinazioni dei pazienti</p>
        </div>
        <button className="btn-add">+ Nuova Vaccinazione</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number stat-primary">{totali}</div>
          <div className="stat-label">Totale Vaccinazioni</div>
        </div>
        <div className="stat-card">
          <div className="stat-number stat-success">{validi}</div>
          <div className="stat-label">Valide</div>
        </div>
        <div className="stat-card">
          <div className="stat-number stat-warning">{prossimi}</div>
          <div className="stat-label">In Scadenza</div>
        </div>
        <div className="stat-card">
          <div className="stat-number stat-danger">{scaduti}</div>
          <div className="stat-label">Scadute</div>
        </div>
      </div>

      <div className="toolbar-wrapper">
        <div className="toolbar-filters">
          <span className="filter-label">Stato:</span>
          <button
            className={`btn-filter ${statoFilter === '' ? 'active' : ''}`}
            onClick={() => { setStatoFilter(''); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Tutti
          </button>
          <button
            className={`btn-filter btn-filter-success ${statoFilter === 'VALIDO' ? 'active' : ''}`}
            onClick={() => { setStatoFilter('VALIDO'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Valide
          </button>
          <button
            className={`btn-filter btn-filter-warning ${statoFilter === 'PROSSIMO' ? 'active' : ''}`}
            onClick={() => { setStatoFilter('PROSSIMO'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            In Scadenza
          </button>
          <button
            className={`btn-filter btn-filter-danger ${statoFilter === 'SCADUTO' ? 'active' : ''}`}
            onClick={() => { setStatoFilter('SCADUTO'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Scadute
          </button>
        </div>

        <div className="toolbar-actions">
          <div className="search-box-wrapper">
            <div className="search-icon-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Cerca per nome animale, tipo vaccino, lotto o note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') { setAppliedSearchTerm(searchTerm); setPage(0); } }}
              />
              <svg 
                className="search-icon" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="16" 
                height="16"
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
          </div>
          <button className="btn-clear-filters" onClick={clearFilters}>
            Cancella Filtri
          </button>
          <div className="page-size-selector">
            <span className="page-size-label">Righe:</span>
            <select
              className="page-size-select"
              value={size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {vaccinazioni.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💉</div>
          <div className="empty-title">Nessuna vaccinazione trovata</div>
          <p className="empty-description">
            {appliedSearchTerm || statoFilter ? 'Prova a modificare i filtri di ricerca.' : 'Inizia aggiungendo la prima vaccinazione.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th onClick={() => handleSort('tipoVaccino')}>
                    TIPO VACCINO <span className="sort-indicator">{getSortIndicator('tipoVaccino')}</span>
                  </th>
                  <th>
                    ANIMALE
                  </th>
                  <th onClick={() => handleSort('dataSomministrazione')}>
                    DATA SOMMINISTRAZIONE <span className="sort-indicator">{getSortIndicator('dataSomministrazione')}</span>
                  </th>
                  <th onClick={() => handleSort('lotto')}>
                    LOTTO <span className="sort-indicator">{getSortIndicator('lotto')}</span>
                  </th>
                  <th onClick={() => handleSort('dataScadenza')}>
                    DATA SCADENZA <span className="sort-indicator">{getSortIndicator('dataScadenza')}</span>
                  </th>
                  <th style={{ textAlign: 'center' }}>STATO</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {vaccinazioni.map((vaccinazione) => {
                  const status = getStatusInfo(vaccinazione.statoVaccinazione);

                  return (
                    <tr key={vaccinazione.id}>
                      <td>
                        <div className="cell-content">
                          <div className="avatar-circle avatar-vaccine">
                            💉
                          </div>
                          <span className="name-colored">
                            {vaccinazione.tipoVaccino}
                          </span>
                        </div>
                      </td>
                      <td>{vaccinazione.nomeAnimale || '-'}</td>
                      <td>{formatDate(vaccinazione.dataSomministrazione)}</td>
                      <td>{vaccinazione.lotto || '-'}</td>
                      <td>{formatDate(vaccinazione.dataScadenza)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge-status ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="actions-menu">
                        {vaccinazione.note && (
                          <span className="note-indicator" title={vaccinazione.note}>ℹ️</span>
                        )}
                        ⋯
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination-wrapper">
            <span className="pagination-info">
              Mostrate <strong>{vaccinazioni.length}</strong> di <strong>{totalCount}</strong> vaccinazioni
            </span>
            <div className="pagination-controls">
              <button className="pagination-btn" onClick={goToPreviousPage} disabled={page === 0}>
                Precedente
              </button>
              <span className="pagination-page-info">
                <strong>{page + 1}</strong> di <strong>{totalPages}</strong>
              </span>
              <button className="pagination-btn" onClick={() => goToNextPage(totalPages)} disabled={page >= totalPages - 1}>
                Successivo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default VaccinazioniLista;