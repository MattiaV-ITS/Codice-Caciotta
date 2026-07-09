import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTableControls } from '../../hooks/useTableControls';
import { useApi } from '../../services/apiService';
import ListaTable from '../../components/ListaTable/ListaTable';

// ==============================
// MOCK DATI PRENOTAZIONI (senza stato)
// ==============================
const MOCK_PRENOTAZIONI = [
  {
    id: 1,
    dataPrenotazione: '2024-07-05T09:00:00',
    dataOraAppuntamento: '2024-07-10T10:30:00',
    motivo: 'Visita di controllo',
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
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Stato per il modale di annullamento
  const [showModal, setShowModal] = useState(false);
  const [selectedPrenotazione, setSelectedPrenotazione] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    }
  ];

  // Funzione per aprire il modale di annullamento
  const handleRowClick = (item) => {
    setSelectedPrenotazione(item);
    setShowModal(true);
  };

  // Funzione per chiudere il modale senza annullare
  const closeModal = () => {
    setShowModal(false);
    setSelectedPrenotazione(null);
  };

  // Funzione per confermare l'annullamento
  const handleConfirmAnnulla = () => {
    if (!selectedPrenotazione) return;

    setIsDeleting(true);

    // Simula una chiamata API per annullare la prenotazione
    setTimeout(() => {
      // Rimuovi la prenotazione dalla lista
      const updatedPrenotazioni = prenotazioni.filter(p => p.id !== selectedPrenotazione.id);
      setPrenotazioni(updatedPrenotazioni);
      setTotalCount(prev => prev - 1);
      setTotalPages(Math.ceil(updatedPrenotazioni.length / size));

      // Chiudi il modale
      setIsDeleting(false);
      closeModal();

      // Messaggio di successo (opzionale)
      alert(`Prenotazione per ${selectedPrenotazione.animaleNome} annullata con successo.`);
    }, 500);
  };

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      let filtered = [...MOCK_PRENOTAZIONI];

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
  }, [page, size, appliedSearchTerm, sortBy, sortDir]);

  const clearFilters = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setPage(0);
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
        emptyMessage={appliedSearchTerm ? 'Prova a modificare i filtri di ricerca.' : 'Inizia aggiungendo la tua prima prenotazione.'}
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

      {/* ======================================== */}
      {/* MODALE DI CONFERMA ANNULLAMENTO */}
      {/* ======================================== */}
      {showModal && selectedPrenotazione && (
        <div className="visite-modal-overlay" onClick={closeModal}>
          <div className="visite-modal" onClick={(e) => e.stopPropagation()}>
            <div className="visite-modal-header">
              <h3>Annulla Prenotazione</h3>
            </div>
            <div className="visite-modal-body">
              <p>
                Sei sicuro di voler annullare la prenotazione di <strong>{selectedPrenotazione.animaleNome}</strong>?
              </p>
              <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                Proprietario: {selectedPrenotazione.proprietarioNome}
                <br />
                Data: {new Date(selectedPrenotazione.dataOraAppuntamento).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="visite-modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={isDeleting}>
                Annulla
              </button>
              <button className="btn btn-danger" onClick={handleConfirmAnnulla} disabled={isDeleting}>
                {isDeleting ? 'Annullamento...' : 'Conferma Annullamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrenotazioniLista;