import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableControls } from '../../hooks/useTableControls';  // ← CORRETTO
import { useApi } from '../../services/apiService';
import ListaTable from '../../components/ListaTable/ListaTable';

// ==============================
// MOCK DATI PRENOTAZIONI
// ==============================
const MOCK_PRENOTAZIONI = [
  {
    id: 1,
    dataPrenotazione: '2024-07-05T09:00:00',
    dataOraAppuntamento: '2024-07-10T10:30:00',
    motivo: 'Visita di controllo',
    statoPrenotazione: 'Confermata',
    priorita: 'Media',
    note: 'Richiesto esame del sangue',
    animaleNome: 'Fido',
    proprietarioNome: 'Mario Rossi'
  },
  {
    id: 2,
    dataPrenotazione: '2024-07-06T14:30:00',
    dataOraAppuntamento: '2024-07-10T09:00:00',
    motivo: 'Vaccinazione',
    statoPrenotazione: 'Completata',
    priorita: 'Bassa',
    note: '',
    animaleNome: 'Mimì',
    proprietarioNome: 'Laura Bianchi'
  },
  {
    id: 3,
    dataPrenotazione: '2024-07-07T11:00:00',
    dataOraAppuntamento: '2024-07-11T14:30:00',
    motivo: 'Visita specialistica',
    statoPrenotazione: 'Attesa',
    priorita: 'Alta',
    note: 'Richiesta ecografia',
    animaleNome: 'Rex',
    proprietarioNome: 'Giuseppe Verdi'
  },
  {
    id: 4,
    dataPrenotazione: '2024-07-08T16:00:00',
    dataOraAppuntamento: '2024-07-12T11:00:00',
    motivo: 'Visita d\'urgenza',
    statoPrenotazione: 'Confermata',
    priorita: 'Alta',
    note: 'Animale con febbre',
    animaleNome: 'Luna',
    proprietarioNome: 'Maria Neri'
  },
  {
    id: 5,
    dataPrenotazione: '2024-07-09T08:30:00',
    dataOraAppuntamento: '2024-07-12T16:15:00',
    motivo: 'Controllo post-operatorio',
    statoPrenotazione: 'Annullata',
    priorita: 'Bassa',
    note: 'Annullato dal proprietario',
    animaleNome: 'Pippo',
    proprietarioNome: 'Antonio Ferrari'
  },
  {
    id: 6,
    dataPrenotazione: '2024-07-10T10:15:00',
    dataOraAppuntamento: '2024-07-13T08:00:00',
    motivo: 'Vaccinazione',
    statoPrenotazione: 'Attesa',
    priorita: 'Media',
    note: '',
    animaleNome: 'Bella',
    proprietarioNome: 'Sofia Esposito'
  },
  {
    id: 7,
    dataPrenotazione: '2024-07-10T13:45:00',
    dataOraAppuntamento: '2024-07-13T15:30:00',
    motivo: 'Visita di controllo',
    statoPrenotazione: 'Confermata',
    priorita: 'Bassa',
    note: 'Controllo peso',
    animaleNome: 'Leo',
    proprietarioNome: 'Francesco Romano'
  },
  {
    id: 8,
    dataPrenotazione: '2024-07-11T09:20:00',
    dataOraAppuntamento: '2024-07-14T10:00:00',
    motivo: 'Visita d\'urgenza',
    statoPrenotazione: 'Attesa',
    priorita: 'Alta',
    note: 'Vomito e diarrea',
    animaleNome: 'Daisy',
    proprietarioNome: 'Elena Greco'
  },
  {
    id: 9,
    dataPrenotazione: '2024-07-11T12:00:00',
    dataOraAppuntamento: '2024-07-14T13:00:00',
    motivo: 'Visita specialistica',
    statoPrenotazione: 'Confermata',
    priorita: 'Media',
    note: 'Visita cardiologica',
    animaleNome: 'Thor',
    proprietarioNome: 'Marco Ferri'
  },
  {
    id: 10,
    dataPrenotazione: '2024-07-12T07:30:00',
    dataOraAppuntamento: '2024-07-15T09:30:00',
    motivo: 'Vaccinazione',
    statoPrenotazione: 'Attesa',
    priorita: 'Bassa',
    note: '',
    animaleNome: 'Mia',
    proprietarioNome: 'Chiara De Luca'
  }
];

// ==============================
// COMPONENTE
// ==============================
function PrenotazioniLista() {
  const navigate = useNavigate();
  const [prenotazioni, setPrenotazioni] = useState([]);
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
    defaultSortBy: 'dataOraAppuntamento',
    defaultSortDir: 'asc',
    defaultPageSize: 10
  });

  const pageSizeOptions = [5, 10, 15, 20];

  const getPrioritaInfo = (priorita) => {
    const map = {
      'Alta': { label: 'Alta', className: 'badge-priorita-alta' },
      'Media': { label: 'Media', className: 'badge-priorita-media' },
      'Bassa': { label: 'Bassa', className: 'badge-priorita-bassa' }
    };
    return map[priorita] || { label: priorita || 'Media', className: 'badge-priorita-media' };
  };

  const getStatoInfo = (stato) => {
    const map = {
      'Attesa': { label: 'In attesa', className: 'badge-attesa' },
      'Confermata': { label: 'Confermata', className: 'badge-confermata' },
      'Completata': { label: 'Completata', className: 'badge-completata' },
      'Annullata': { label: 'Annullata', className: 'badge-annullata' }
    };
    return map[stato] || { label: stato || 'Sconosciuto', className: 'badge-sconosciuto' };
  };

  const customColumns = [
    {
      header: 'DATA APPUNTAMENTO',
      field: 'dataOraAppuntamento',
      sortable: true,
      render: (item) => {
        const date = new Date(item.dataOraAppuntamento);
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
    { header: 'MOTIVO', field: 'motivo', sortable: true, render: (item) => item.motivo || '-' },
    {
      header: 'PRIORITÀ',
      field: 'priorita',
      sortable: true,
      style: { textAlign: 'center' },
      render: (item) => {
        const priorita = getPrioritaInfo(item.priorita);
        return <span className={`badge-status ${priorita.className}`}>{priorita.label}</span>;
      }
    },
    {
      header: 'STATO',
      field: 'statoPrenotazione',
      sortable: false,
      style: { textAlign: 'center' },
      render: (item) => {
        const stato = getStatoInfo(item.statoPrenotazione);
        return <span className={`badge-status ${stato.className}`}>{stato.label}</span>;
      }
    }
  ];

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      let filtered = [...MOCK_PRENOTAZIONI];

      if (statoFiltro) {
        filtered = filtered.filter(p => p.statoPrenotazione === statoFiltro);
      }

      if (appliedSearchTerm) {
        const term = appliedSearchTerm.toLowerCase().trim();
        filtered = filtered.filter(p =>
          p.animaleNome?.toLowerCase().includes(term) ||
          p.proprietarioNome?.toLowerCase().includes(term) ||
          p.motivo?.toLowerCase().includes(term)
        );
      }

      filtered.sort((a, b) => {
        let valA = (a[sortBy] || '').toString().toLowerCase();
        let valB = (b[sortBy] || '').toString().toLowerCase();
        if (sortBy === 'dataOraAppuntamento') {
          valA = new Date(a[sortBy]).getTime();
          valB = new Date(b[sortBy]).getTime();
        }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });

      const start = page * size;
      const paginated = filtered.slice(start, start + size);

      setPrenotazioni(paginated);
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
    navigate(`/prenotazioni/${item.id}`);
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento prenotazioni...</span>
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
          <h2>Elenco Prenotazioni</h2>
          <p className="page-subtitle">Gestisci le prenotazioni dei tuoi pazienti</p>
        </div>
        <button className="btn-add">+ Nuova Prenotazione</button>
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
            className={`btn-filter ${statoFiltro === 'Attesa' ? 'active' : ''}`}
            onClick={() => { setStatoFiltro('Attesa'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            In attesa
          </button>
          <button
            className={`btn-filter ${statoFiltro === 'Confermata' ? 'active' : ''}`}
            onClick={() => { setStatoFiltro('Confermata'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Confermate
          </button>
          <button
            className={`btn-filter ${statoFiltro === 'Completata' ? 'active' : ''}`}
            onClick={() => { setStatoFiltro('Completata'); setSearchTerm(''); setAppliedSearchTerm(''); setPage(0); }}
          >
            Completate
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

      <ListaTable
        data={prenotazioni}
        columns={customColumns}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        getSortIndicator={getSortIndicator}
        loading={loading}
        error={error}
        emptyMessage={appliedSearchTerm || statoFiltro ? 'Prova a modificare i filtri di ricerca.' : 'Inizia aggiungendo la tua prima prenotazione.'}
        emptyIcon="📅"
        onRowClick={handleRowClick}
      />

      {prenotazioni.length > 0 && (
        <div className="pagination-wrapper">
          <span className="pagination-info">
            Mostrati <strong>{prenotazioni.length}</strong> di <strong>{totalCount}</strong> prenotazioni
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

export default PrenotazioniLista;