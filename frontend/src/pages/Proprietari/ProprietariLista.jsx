import React, { useEffect, useState } from 'react';

// ---- MOCK DATI PROPRIETARI ----
const MOCK_PROPRIETARI = {
  content: [
    { id: 1, codiceFiscale: 'RSSMRA80A01F205X', nome: 'Mario', cognome: 'Rossi', email: 'mario.rossi@email.it', telefono: '3331234567', indirizzo: 'Via Roma 10', citta: 'Milano', dataRegistrazione: '2023-01-15T10:00:00', statoAttivita: 'Attivo' },
    { id: 2, codiceFiscale: 'BNCLRA85B02G210Y', nome: 'Laura', cognome: 'Bianchi', email: 'laura.bianchi@email.it', telefono: '3349876543', indirizzo: 'Via Dante 25', citta: 'Roma', dataRegistrazione: '2023-02-20T14:30:00', statoAttivita: 'Attivo' },
    { id: 3, codiceFiscale: 'VRDGPP90C03H215Z', nome: 'Giuseppe', cognome: 'Verdi', email: 'giuseppe.verdi@email.it', telefono: '3354567890', indirizzo: 'Via Manzoni 8', citta: 'Napoli', dataRegistrazione: '2023-03-10T09:15:00', statoAttivita: 'Inattivo' },
    { id: 4, codiceFiscale: 'NRIMRA75D04I220W', nome: 'Maria', cognome: 'Neri', email: 'maria.neri@email.it', telefono: '3367890123', indirizzo: 'Via Garibaldi 3', citta: 'Torino', dataRegistrazione: '2023-04-05T11:45:00', statoAttivita: 'Attivo' },
    { id: 5, codiceFiscale: 'FRRANT88E05J225V', nome: 'Antonio', cognome: 'Ferrari', email: 'antonio.ferrari@email.it', telefono: '3378901234', indirizzo: 'Via Colombo 12', citta: 'Firenze', dataRegistrazione: '2023-05-12T16:20:00', statoAttivita: 'Attivo' },
    { id: 6, codiceFiscale: 'ESPSFA92F06K230T', nome: 'Sofia', cognome: 'Esposito', email: 'sofia.esposito@email.it', telefono: '3389012345', indirizzo: 'Via Verdi 5', citta: 'Palermo', dataRegistrazione: '2023-06-18T08:30:00', statoAttivita: 'Attivo' },
    { id: 7, codiceFiscale: 'ROMFRN89G07L235S', nome: 'Francesco', cognome: 'Romano', email: 'francesco.romano@email.it', telefono: '3390123456', indirizzo: 'Via Cavour 20', citta: 'Bologna', dataRegistrazione: '2023-07-22T13:00:00', statoAttivita: 'Inattivo' },
    { id: 8, codiceFiscale: 'GRCELN95H08M240P', nome: 'Elena', cognome: 'Greco', email: 'elena.greco@email.it', telefono: '3401234567', indirizzo: 'Via Dante 30', citta: 'Genova', dataRegistrazione: '2023-08-30T10:45:00', statoAttivita: 'Attivo' },
    { id: 9, codiceFiscale: 'FRRMAR88I09N245O', nome: 'Marco', cognome: 'Ferri', email: 'marco.ferri@email.it', telefono: '3412345678', indirizzo: 'Via Mazzini 15', citta: 'Venezia', dataRegistrazione: '2023-09-14T15:30:00', statoAttivita: 'Attivo' },
    { id: 10, codiceFiscale: 'DLCCHR90L10O250M', nome: 'Chiara', cognome: 'De Luca', email: 'chiara.deluca@email.it', telefono: '3423456789', indirizzo: 'Via XX Settembre 7', citta: 'Bari', dataRegistrazione: '2023-10-01T09:00:00', statoAttivita: 'Attivo' }
  ],
  totalPages: 3,
  totalElements: 25,
  size: 10,
  number: 0
};
// ---- FINE MOCK ----

function ProprietariLista() {
  const [proprietari, setProprietari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [statoFiltro, setStatoFiltro] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('cognome');
  const [sortDir, setSortDir] = useState('asc');

  const getInitials = (nome, cognome) => (nome?.charAt(0) || '') + (cognome?.charAt(0) || '');

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatoInfo = (stato) => {
    switch (stato) {
      case 'Attivo': return { label: 'Attivo', className: 'badge-attivo' };
      case 'Inattivo': return { label: 'Inattivo', className: 'badge-inattivo' };
      default: return { label: 'Sconosciuto', className: 'badge-sconosciuto' };
    }
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...MOCK_PROPRIETARI.content];
      if (statoFiltro) filtered = filtered.filter(p => p.statoAttivita === statoFiltro);
      if (appliedSearchTerm) {
        const term = appliedSearchTerm.toLowerCase();
        filtered = filtered.filter(p =>
          p.nome.toLowerCase().includes(term) ||
          p.cognome.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term) ||
          p.telefono.includes(term) ||
          p.citta.toLowerCase().includes(term)
        );
      }
      filtered.sort((a, b) => {
        const valA = (a[sortBy] || '').toString().toLowerCase();
        const valB = (b[sortBy] || '').toString().toLowerCase();
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
      const start = page * size;
      const paginated = filtered.slice(start, start + size);
      setProprietari(paginated);
      setTotalPages(Math.ceil(filtered.length / size));
      setLoading(false);
    }, 500);
  }, [page, size, appliedSearchTerm, statoFiltro, sortBy, sortDir]);

  const goToPreviousPage = () => { if (page > 0) setPage(page - 1); };
  const goToNextPage = () => { if (page < totalPages - 1) setPage(page + 1); };

  const handleSort = (columnName) => {
    if (sortBy === columnName) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(columnName); setSortDir('asc'); }
    setPage(0);
  };

  const getSortIndicator = (columnName) => {
    if (sortBy !== columnName) return null;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setStatoFiltro('');
    setPage(0);
  };

  const totali = MOCK_PROPRIETARI.content.length;
  const attivi = MOCK_PROPRIETARI.content.filter(p => p.statoAttivita === 'Attivo').length;
  const inattivi = MOCK_PROPRIETARI.content.filter(p => p.statoAttivita === 'Inattivo').length;

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
                placeholder="Cerca per nome, cognome, email, telefono o città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') { setAppliedSearchTerm(searchTerm); setPage(0); } }}
              />
            </div>
          </div>
          <button className="btn-clear-filters" onClick={clearFilters}>
            Cancella Filtri
          </button>
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
                  <th onClick={() => handleSort('cognome')}>
                    NOME COMPLETO <span className="sort-indicator">{getSortIndicator('cognome')}</span>
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
                  <th>STATO</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {proprietari.map((p) => {
                  const isAttivo = p.statoAttivita === 'Attivo';
                  const stato = getStatoInfo(p.statoAttivita);

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="cell-content">
                          <div className={`avatar-circle ${isAttivo ? 'avatar-success' : 'avatar-gray'}`}>
                            {getInitials(p.nome, p.cognome)}
                          </div>
                          <span className="name-colored name-default">
                            {p.nome} {p.cognome}
                          </span>
                        </div>
                      </td>
                      <td>📞 {p.telefono}</td>
                      <td>✉️ {p.email}</td>
                      <td>📍 {p.citta}</td>
                      <td>{formatDate(p.dataRegistrazione)}</td>
                      <td>
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
              <button className="pagination-btn" onClick={goToNextPage} disabled={page >= totalPages - 1}>
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