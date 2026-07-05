import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableControls } from '../../utils/useTableControls';
import ListaTable from '../../components/ListaTable/ListaTable';

const MOCK_VISITE = [
  { id: 1, dataOraVisita: '2024-07-10T10:30', durata: 30, tipoVisita: 'Visita di controllo', stato: 'Completata', animaleNome: 'Fido', proprietarioNome: 'Mario Rossi' },
  { id: 2, dataOraVisita: '2024-06-15T09:00', durata: 20, tipoVisita: 'Vaccinazione', stato: 'Completata', animaleNome: 'Mimì', proprietarioNome: 'Laura Bianchi' },
  { id: 3, dataOraVisita: '2024-05-20T14:30', durata: 45, tipoVisita: 'Visita di controllo', stato: 'Pianificata', animaleNome: 'Rex', proprietarioNome: 'Giuseppe Verdi' },
  { id: 4, dataOraVisita: '2024-04-10T11:00', durata: 60, tipoVisita: 'Visita d\'urgenza', stato: 'Completata', animaleNome: 'Luna', proprietarioNome: 'Maria Neri' },
  { id: 5, dataOraVisita: '2024-07-08T11:45', durata: 15, tipoVisita: 'Visita di controllo', stato: 'Pianificata', animaleNome: 'Pippo', proprietarioNome: 'Antonio Ferrari' },
  { id: 6, dataOraVisita: '2024-07-07T08:00', durata: 30, tipoVisita: 'Vaccinazione', stato: 'Completata', animaleNome: 'Bella', proprietarioNome: 'Sofia Esposito' },
  { id: 7, dataOraVisita: '2024-07-06T15:30', durata: 25, tipoVisita: 'Visita di controllo', stato: 'Pianificata', animaleNome: 'Leo', proprietarioNome: 'Francesco Romano' },
  { id: 8, dataOraVisita: '2024-07-05T10:00', durata: 40, tipoVisita: 'Visita d\'urgenza', stato: 'Completata', animaleNome: 'Daisy', proprietarioNome: 'Elena Greco' },
  { id: 9, dataOraVisita: '2024-07-04T13:00', durata: 50, tipoVisita: 'Visita specialistica', stato: 'Completata', animaleNome: 'Thor', proprietarioNome: 'Marco Ferri' },
  { id: 10, dataOraVisita: '2024-07-03T09:30', durata: 20, tipoVisita: 'Vaccinazione', stato: 'Annullata', animaleNome: 'Mia', proprietarioNome: 'Chiara De Luca' }
];

function VisiteLista() {
  const navigate = useNavigate();
  const [visite, setVisite] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [statoFiltro, setStatoFiltro] = useState('');
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
    defaultSortBy: 'dataOraVisita',
    defaultSortDir: 'desc',
    defaultPageSize: 10
  });

  const pageSizeOptions = [5, 10, 15, 20];

  const getStatoInfo = (stato) => {
    const map = {
      'Pianificata': { label: 'Pianificata', className: 'badge-pianificata' },
      'Completata': { label: 'Completata', className: 'badge-completata' },
      'In corso': { label: 'In corso', className: 'badge-in-corso' },
      'Annullata': { label: 'Annullata', className: 'badge-annullata' }
    };
    return map[stato] || { label: 'Sconosciuto', className: 'badge-sconosciuto' };
  };

  const customColumns = [
    {
      header: 'DATA',
      field: 'dataOraVisita',
      sortable: true,
      render: (item) => {
        const date = new Date(item.dataOraVisita);
        return (
          <div>
            <strong>{date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            <br />
            <span className="text-xs text-muted">{date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
    },
    { header: 'ANIMALE', field: 'animaleNome', sortable: true },
    { header: 'PROPRIETARIO', field: 'proprietarioNome', sortable: true },
    { header: 'TIPO', field: 'tipoVisita', sortable: true, render: (item) => item.tipoVisita || '-' },
    { header: 'DURATA', field: 'durata', sortable: true, render: (item) => item.durata ? `${item.durata} min` : '-' },
    {
      header: 'STATO',
      field: 'stato',
      sortable: false,
      style: { textAlign: 'center' },
      render: (item) => {
        const status = getStatoInfo(item.stato);
        return <span className={`badge-status ${status.className}`}>{status.label}</span>;
      }
    }
  ];

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      let filtered = [...MOCK_VISITE];

      if (statoFiltro) {
        filtered = filtered.filter(v => v.stato === statoFiltro);
      }

      if (appliedSearchTerm) {
        const term = appliedSearchTerm.toLowerCase().trim();
        filtered = filtered.filter(v => {
          const dateObj = new Date(v.dataOraVisita);
          const formatoTesto = dateObj.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }).toLowerCase();
          const formatoNumerico = dateObj.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          const giorno = dateObj.getDate().toString().padStart(2, '0');
          const meseBreve = dateObj.toLocaleDateString('it-IT', { month: 'short' }).toLowerCase();
          const anno = dateObj.getFullYear();
          const formatoMisto = `${giorno}/${meseBreve}/${anno}`;

          return (
            v.animaleNome?.toLowerCase().includes(term) ||
            v.proprietarioNome?.toLowerCase().includes(term) ||
            v.tipoVisita?.toLowerCase().includes(term) ||
            formatoTesto.includes(term) ||
            formatoNumerico.includes(term) ||
            formatoMisto.includes(term)
          );
        });
      }

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

      const start = page * size;
      const paginated = filtered.slice(start, start + size);

      setVisite(paginated);
      setTotalPages(Math.ceil(filtered.length / size));
      setTotalCount(filtered.length);
      setLoading(false);
    }, 500);
  }, [page, size, appliedSearchTerm, statoFiltro, sortBy, sortDir]);

  const clearFilters = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setStatoFiltro('');
    setPage(0);
  };

  const handleRowClick = (item) => {
    navigate(`/visite/${item.id}`);
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento visite...</span>
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
          <h2>Elenco Visite</h2>
          <p className="page-subtitle">Gestisci le visite dei tuoi pazienti</p>
        </div>
        <button className="btn-add">+ Nuova Visita</button>
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
            className={`btn-filter ${statoFiltro === 'Pianificata' ? 'active' : ''}`}
            onClick={() => { setStatoFiltro('Pianificata'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Pianificate
          </button>
          <button
            className={`btn-filter ${statoFiltro === 'Completata' ? 'active' : ''}`}
            onClick={() => { setStatoFiltro('Completata'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Completate
          </button>
          <button
            className={`btn-filter ${statoFiltro === 'In corso' ? 'active' : ''}`}
            onClick={() => { setStatoFiltro('In corso'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            In corso
          </button>
          <button
            className={`btn-filter ${statoFiltro === 'Annullata' ? 'active' : ''}`}
            onClick={() => { setStatoFiltro('Annullata'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Annullate
          </button>
        </div>

        <div className="toolbar-actions">
          <div className="search-box-wrapper">
            <div className="search-icon-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Cerca per data, animale, proprietario o tipo visita..."
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

      <ListaTable
        data={visite}
        columns={customColumns}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        getSortIndicator={getSortIndicator}
        loading={loading}
        error={error}
        emptyMessage={appliedSearchTerm || statoFiltro ? 'Prova a modificare i filtri di ricerca.' : 'Inizia aggiungendo la tua prima visita.'}
        emptyIcon="🩺"
        onRowClick={handleRowClick}
      />

      {visite.length > 0 && (
        <div className="pagination-wrapper">
          <span className="pagination-info">
            Mostrati <strong>{visite.length}</strong> di <strong>{totalCount}</strong> visite
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
      )}
    </div>
  );
}

export default VisiteLista;