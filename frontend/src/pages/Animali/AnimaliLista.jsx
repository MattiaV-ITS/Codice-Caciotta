import React, { useEffect, useState } from 'react';
import { formatDate, getIconLetter } from '../../utils';
import { useTableControls } from '../../utils/useTableControls';
import { useApi } from '../../services/apiService';

function AnimaliLista() {
  const { get } = useApi();
  const [animali, setAnimali] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [specieFilter, setSpecieFilter] = useState('');
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
    goToNextPage 
  } = useTableControls({
    defaultSortBy: 'id',
    defaultSortDir: 'asc', 
    defaultPageSize: 15
  });

  const pageSizeOptions = [5, 10, 15, 20];

  const getStatoInfo = (stato) => {
    const map = {
      'SANO': { label: 'Sano', className: 'badge-sano' },
      'MALATO': { label: 'Malato', className: 'badge-malato' },
      'IN_CURA': { label: 'In cura', className: 'badge-in-cura' },
      'DECEDUTO': { label: 'Deceduto', className: 'badge-deceduto' }
    };
    return map[stato] || { label: 'Sconosciuto', className: 'badge-sconosciuto' };
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
    
    if (specieFilter) {
      params.append('specie', specieFilter);
    }
    
    get(`/api/animali?${params.toString()}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Errore nel fetching dei dati degli animali');
        }
        return response.json();
      })
      .then(data => {
        setAnimali(data.content);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [page, size, appliedSearchTerm, specieFilter, sortBy, sortDir, get]);

  const clearFilters = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setSpecieFilter('');
    setPage(0);
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento animali...</span>
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
          <h2>Elenco Pazienti</h2>
          <p className="page-subtitle">Gestisci i tuoi animali</p>
        </div>
        <button className="btn-add">+ Nuovo Animale</button>
      </div>

      <div className="toolbar-wrapper">
        <div className="toolbar-filters">
          <span className="filter-label">Specie:</span>
          <button
            className={`btn-filter ${specieFilter === '' ? 'active' : ''}`}
            onClick={() => { setSpecieFilter(''); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Tutti
          </button>
          <button
            className={`btn-filter ${specieFilter === 'cane' ? 'active' : ''}`}
            onClick={() => { setSpecieFilter('cane'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Cane
          </button>
          <button
            className={`btn-filter ${specieFilter === 'gatto' ? 'active' : ''}`}
            onClick={() => { setSpecieFilter('gatto'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Gatto
          </button>
          <button
            className={`btn-filter ${specieFilter === 'altro' ? 'active' : ''}`}
            onClick={() => { setSpecieFilter('altro'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Altri
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

      {animali.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🐾</div>
          <div className="empty-title">Nessun animale trovato</div>
          <p className="empty-description">
            {appliedSearchTerm || specieFilter ? 'Prova a modificare i filtri di ricerca.' : 'Inizia aggiungendo il tuo primo animale.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th onClick={() => handleSort('nome')}>
                    NOME ANIMALE <span className="sort-indicator">{getSortIndicator('nome')}</span>
                  </th>
                  <th onClick={() => handleSort('razza')}>
                    RAZZA <span className="sort-indicator">{getSortIndicator('razza')}</span>
                  </th>
                  <th onClick={() => handleSort('proprietario')}>
                    PROPRIETARIO <span className="sort-indicator">{getSortIndicator('proprietario')}</span>
                  </th>
                  <th onClick={() => handleSort('dataNascita')}>
                    DATA DI NASCITA <span className="sort-indicator">{getSortIndicator('dataNascita')}</span>
                  </th>
                  <th onClick={() => handleSort('microchip')}>
                    MICROCHIP <span className="sort-indicator">{getSortIndicator('microchip')}</span>
                  </th>
                  <th style={{ textAlign: 'center' }}>STATO</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {animali.map((animale) => {
                  const isFemale = animale.sesso?.toLowerCase() === 'f';
                  const isMale = animale.sesso?.toLowerCase() === 'm';
                  const isND = animale.sesso === null || animale.sesso === undefined;

                  let avatarClass = 'avatar-default';
                  if (isFemale) avatarClass = 'avatar-female';
                  else if (isMale) avatarClass = 'avatar-male';
                  else if (isND) avatarClass = 'avatar-nd';

                  const status = getStatoInfo(animale.stato);

                  return (
                    <tr key={animale.id}>
                      <td>
                        <div className="cell-content">
                          <div className={`avatar-circle ${avatarClass}`}>
                            {getIconLetter(animale.specie)}
                          </div>
                          <span className={`name-colored ${isFemale ? 'name-female' : isMale ? 'name-male' : 'name-default'}`}>
                            {animale.nome}
                          </span>
                        </div>
                      </td>
                      <td>{animale.razza || '-'}</td>
                      <td>{animale.proprietario || '-'}</td>
                      <td>{formatDate(animale.dataNascita)}</td>
                      <td>{animale.microchip || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge-status ${status.className}`}>
                          {status.label}
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
              Mostrati <strong>{animali.length}</strong> di <strong>{totalPages * size}</strong> animali
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

export default AnimaliLista;