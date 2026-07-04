import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableControls } from '../../utils/useTableControls';
import { StatusBadge } from '../../components/common/StatusBadge';

// ==============================
// MOCK DATI VISITE
// ==============================
const MOCK_VISITE = [
  {
    id: 1,
    dataOraVisita: '2024-07-10T10:30:00',
    durata: 30,
    tipoVisita: 'Visita di controllo',
    stato: 'Completata',
    animaleNome: 'Fido',
    proprietarioNome: 'Mario Rossi'
  },
  {
    id: 2,
    dataOraVisita: '2024-07-10T14:00:00',
    durata: 20,
    tipoVisita: 'Vaccinazione',
    stato: 'Pianificata',
    animaleNome: 'Mimì',
    proprietarioNome: 'Laura Bianchi'
  },
  {
    id: 3,
    dataOraVisita: '2024-07-09T09:15:00',
    durata: 45,
    tipoVisita: 'Visita specialistica',
    stato: 'Completata',
    animaleNome: 'Rex',
    proprietarioNome: 'Giuseppe Verdi'
  },
  {
    id: 4,
    dataOraVisita: '2024-07-09T16:30:00',
    durata: 60,
    tipoVisita: 'Chirurgia',
    stato: 'In corso',
    animaleNome: 'Luna',
    proprietarioNome: 'Maria Neri'
  },
  {
    id: 5,
    dataOraVisita: '2024-07-08T11:45:00',
    durata: 15,
    tipoVisita: 'Visita di controllo',
    stato: 'Annullata',
    animaleNome: 'Pippo',
    proprietarioNome: 'Antonio Ferrari'
  },
  {
    id: 6,
    dataOraVisita: '2024-07-08T08:00:00',
    durata: 30,
    tipoVisita: 'Vaccinazione',
    stato: 'Completata',
    animaleNome: 'Bella',
    proprietarioNome: 'Sofia Esposito'
  },
  {
    id: 7,
    dataOraVisita: '2024-07-07T15:30:00',
    durata: 25,
    tipoVisita: 'Visita di controllo',
    stato: 'Pianificata',
    animaleNome: 'Leo',
    proprietarioNome: 'Francesco Romano'
  },
  {
    id: 8,
    dataOraVisita: '2024-07-07T10:00:00',
    durata: 40,
    tipoVisita: 'Visita d\'urgenza',
    stato: 'Completata',
    animaleNome: 'Daisy',
    proprietarioNome: 'Elena Greco'
  },
  {
    id: 9,
    dataOraVisita: '2024-07-06T13:00:00',
    durata: 50,
    tipoVisita: 'Visita specialistica',
    stato: 'Completata',
    animaleNome: 'Thor',
    proprietarioNome: 'Marco Ferri'
  },
  {
    id: 10,
    dataOraVisita: '2024-07-06T09:30:00',
    durata: 20,
    tipoVisita: 'Vaccinazione',
    stato: 'Annullata',
    animaleNome: 'Mia',
    proprietarioNome: 'Chiara De Luca'
  },
  {
    id: 11,
    dataOraVisita: '2024-07-05T12:15:00',
    durata: 35,
    tipoVisita: 'Visita di controllo',
    stato: 'Completata',
    animaleNome: 'Pallino',
    proprietarioNome: 'Anna Russo'
  },
  {
    id: 12,
    dataOraVisita: '2024-07-05T08:45:00',
    durata: 30,
    tipoVisita: 'Visita d\'urgenza',
    stato: 'Pianificata',
    animaleNome: 'Sissi',
    proprietarioNome: 'Luigi Esposito'
  }
];

// ==============================
// COMPONENTE
// ==============================
function VisiteLista() {
  const navigate = useNavigate();
  const [visite, setVisite] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
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
    defaultSortBy: 'dataOraVisita',
    defaultSortDir: 'desc',
    defaultPageSize: 10
  });

  const pageSizeOptions = [5, 10, 15, 20];

  // Caricamento mock
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...MOCK_VISITE];

      // Filtra per ricerca
      if (appliedSearchTerm) {
        const term = appliedSearchTerm.toLowerCase();
        filtered = filtered.filter(v =>
          v.animaleNome.toLowerCase().includes(term) ||
          v.proprietarioNome.toLowerCase().includes(term) ||
          v.tipoVisita.toLowerCase().includes(term)
        );
      }

      // Ordina
      filtered.sort((a, b) => {
        let valA = (a[sortBy] || '').toString().toLowerCase();
        let valB = (b[sortBy] || '').toString().toLowerCase();
        if (sortBy === 'dataOraVisita') {
          valA = new Date(a[sortBy]).getTime();
          valB = new Date(b[sortBy]).getTime();
        }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });

      // Pagina
      const start = page * size;
      const paginated = filtered.slice(start, start + size);

      setVisite(paginated);
      setTotalPages(Math.ceil(filtered.length / size));
      setLoading(false);
    }, 500);
  }, [page, size, appliedSearchTerm, sortBy, sortDir]);

  const clearFilters = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setPage(0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const goToVisita = (id) => {
    navigate(`/visite/${id}`);
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento visite...</span>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Elenco Visite</h2>
          <p className="page-subtitle">Gestisci le visite dei tuoi pazienti</p>
        </div>
        <button className="btn-add">+ Nuova Visita</button>
      </div>

      <div className="toolbar-wrapper">
        <div className="toolbar-actions" style={{ flex: 1 }}>
          <div className="search-box-wrapper" style={{ flex: 1 }}>
            <div className="search-icon-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Cerca per animale o proprietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setAppliedSearchTerm(searchTerm);
                    setPage(0);
                  }
                }}
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

      {visite.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🩺</div>
          <div className="empty-title">Nessuna visita trovata</div>
          <p className="empty-description">
            {appliedSearchTerm ? 'Prova a modificare i filtri di ricerca.' : 'Inizia aggiungendo la tua prima visita.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th onClick={() => handleSort('dataOraVisita')}>
                    DATA <span className="sort-indicator">{getSortIndicator('dataOraVisita')}</span>
                  </th>
                  <th onClick={() => handleSort('animaleNome')}>
                    ANIMALE <span className="sort-indicator">{getSortIndicator('animaleNome')}</span>
                  </th>
                  <th onClick={() => handleSort('proprietarioNome')}>
                    PROPRIETARIO <span className="sort-indicator">{getSortIndicator('proprietarioNome')}</span>
                  </th>
                  <th onClick={() => handleSort('tipoVisita')}>
                    TIPO <span className="sort-indicator">{getSortIndicator('tipoVisita')}</span>
                  </th>
                  <th onClick={() => handleSort('durata')}>
                    DURATA <span className="sort-indicator">{getSortIndicator('durata')}</span>
                  </th>
                  <th style={{ textAlign: 'center' }}>STATO</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {visite.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => goToVisita(v.id)}
                    className="clickable-row"
                  >
                    <td>
                      <strong>{formatDate(v.dataOraVisita)}</strong>
                      <br />
                      <span className="text-xs text-muted">{formatTime(v.dataOraVisita)}</span>
                    </td>
                    <td>{v.animaleNome || '-'}</td>
                    <td>{v.proprietarioNome || '-'}</td>
                    <td>{v.tipoVisita || '-'}</td>
                    <td>{v.durata ? `${v.durata} min` : '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <StatusBadge status={v.stato || 'Pianificata'} />
                    </td>
                    <td className="actions-menu">⋯</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination-wrapper">
            <span className="pagination-info">
              Mostrati <strong>{visite.length}</strong> di <strong>{totalPages * size}</strong> visite
            </span>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={goToPreviousPage}
                disabled={page === 0}
              >
                Precedente
              </button>
              <span className="pagination-page-info">
                <strong>{page + 1}</strong> di <strong>{totalPages}</strong>
              </span>
              <button
                className="pagination-btn"
                onClick={() => goToNextPage(totalPages)}
                disabled={page >= totalPages - 1}
              >
                Successivo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default VisiteLista;