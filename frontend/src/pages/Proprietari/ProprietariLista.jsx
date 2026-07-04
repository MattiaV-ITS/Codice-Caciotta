import React, { useEffect, useState } from 'react';
import { formatDate } from '../../utils';
import { useTableControls } from '../../utils/useTableControls';
import { useApi } from '../../services/apiService';

function ProprietariLista() {
  const { get } = useApi();
  const [proprietari, setProprietari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [statoFiltro, setStatoFiltro] = useState('');
  const [totalPages, setTotalPages] = useState(0);

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
    defaultSortBy: 'cognome',
    defaultSortDir: 'asc', 
    defaultPageSize: 10
  });

  const pageSizeOptions = [5, 10, 15, 20];

  const getInitials = (nome, cognome) => (nome?.charAt(0) || '') + (cognome?.charAt(0) || '');

  const getStatoInfo = (stato) => {
    if (stato === true)
      return { label: 'Attivo', className: 'badge-attivo' };
    else if (stato === false)
      return { label: 'Inattivo', className: 'badge-inattivo' };
    else
      return { label: 'Sconosciuto', className: 'badge-sconosciuto' };
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

    if (statoFiltro) {
      params.append('citta', statoFiltro);
    }

    get(`/api/proprietari?${params.toString()}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Errore nel fetching dei dati dei proprietari');
        }
        return response.json();
      })
      .then(data => {
        setProprietari(data.content);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [page, size, appliedSearchTerm, statoFiltro, sortBy, sortDir, get]);

  const clearFilters = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setStatoFiltro('');
    setPage(0);
  };

  // TODO: Implementare la logica per il conteggio dei proprietari totali, attivi e inattivi basata sui dati reali
  const totali = 5;
  const attivi = 3;
  const inattivi = 2;

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento proprietari...</span>
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
          <h2>Elenco Proprietari</h2>
          <p className="page-subtitle">Gestisci i tuoi clienti</p>
        </div>
        <button className="btn-add">+ Nuovo Proprietario</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number stat-primary">{totali}</div>
          <div className="stat-label">Totale Proprietari</div>
        </div>
        <div className="stat-card">
          <div className="stat-number stat-success">{attivi}</div>
          <div className="stat-label">Attivi</div>
        </div>
        <div className="stat-card">
          <div className="stat-number stat-gray">{inattivi}</div>
          <div className="stat-label">Inattivi</div>
        </div>
      </div>

      <div className="toolbar-wrapper">
        <div className="toolbar-filters">
          <span className="filter-label">Stato:</span>
          <button
            className={`btn-filter ${statoFiltro === '' ? 'active' : ''}`}
            onClick={() => { setStatoFiltro(''); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Tutti
          </button>
          <button
            className={`btn-filter btn-filter-success ${statoFiltro === 'Attivo' ? 'active' : ''}`}
            onClick={() => { setStatoFiltro('Attivo'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Attivi
          </button>
          <button
            className={`btn-filter btn-filter-gray ${statoFiltro === 'Inattivo' ? 'active' : ''}`}
            onClick={() => { setStatoFiltro('Inattivo'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Inattivi
          </button>
        </div>

        <div className="toolbar-actions">
          <div className="search-box-wrapper">
            <div className="search-icon-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Cerca per nome, razza, proprietario, data nascita o microchip..."
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
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
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

      {proprietari.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <div className="empty-title">Nessun proprietario trovato</div>
          <p className="empty-description">
            {appliedSearchTerm || statoFiltro ? 'Prova a modificare i filtri di ricerca.' : 'Inizia aggiungendo il tuo primo proprietario.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort('nome')}
                    style={{ cursor: 'pointer', paddingRight: '4px' }}
                  >
                    NOME <span className="sort-indicator">{getSortIndicator('nome')}</span>
                  </th>
                  <th
                    onClick={() => handleSort('cognome')}
                    style={{ cursor: 'pointer', paddingLeft: '4px' }}
                  >
                    COGNOME <span className="sort-indicator">{getSortIndicator('cognome')}</span>
                  </th>
                  <th onClick={() => handleSort('telefono')}>
                    TELEFONO <span className="sort-indicator">{getSortIndicator('telefono')}</span>
                  </th>
                  <th onClick={() => handleSort('email')}>
                    EMAIL <span className="sort-indicator">{getSortIndicator('email')}</span>
                  </th>
                  <th onClick={() => handleSort('citta')}>
                    CITTÀ <span className="sort-indicator">{getSortIndicator('citta')}</span>
                  </th>
                  <th onClick={() => handleSort('dataRegistrazione')}>
                    DATA REGISTRAZIONE <span className="sort-indicator">{getSortIndicator('dataRegistrazione')}</span>
                  </th>
                  <th style={{ textAlign: 'center' }}>STATO</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {proprietari.map((p) => {
                  const isAttivo = p.stato === true;
                  const stato = getStatoInfo(p.stato);

                  return (
                    <tr key={p.id}>
                      <td style={{ paddingRight: '4px' }}>
                        <div className="cell-content" style={{ gap: '6px' }}>
                          <div className={`avatar-circle ${isAttivo ? 'avatar-success' : 'avatar-gray'}`}>
                            {getInitials(p.nome, p.cognome)}
                          </div>
                          <span style={{ color: 'var(--gray-900)', fontWeight: '600' }}>
                            {p.nome}
                          </span>
                        </div>
                      </td>
                      <td style={{ paddingLeft: '4px' }}>
                        <span style={{ color: 'var(--gray-900)', fontWeight: '400' }}>
                          {p.cognome}
                        </span>
                      </td>
                      <td>{p.telefono}</td>
                      <td>{p.email}</td>
                      <td>{p.citta}</td>
                      <td>{formatDate(p.dataRegistrazione)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge-status ${stato.className}`}>
                          {stato.label}
                        </span>
                      </td>
                      <td className="actions-menu">⋯</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination-wrapper">
            <span className="pagination-info">
              Mostrati <strong>{proprietari.length}</strong> di <strong>{totalPages * size}</strong> proprietari
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

export default ProprietariLista;
