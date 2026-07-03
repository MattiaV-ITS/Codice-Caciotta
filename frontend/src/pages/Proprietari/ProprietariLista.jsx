import React, { useEffect, useState } from 'react';

// ---- MOCK DATI PROPRIETARI (35) ----
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
    { id: 10, codiceFiscale: 'DLCCHR90L10O250M', nome: 'Chiara', cognome: 'De Luca', email: 'chiara.deluca@email.it', telefono: '3423456789', indirizzo: 'Via XX Settembre 7', citta: 'Bari', dataRegistrazione: '2023-10-01T09:00:00', statoAttivita: 'Attivo' },
    { id: 11, codiceFiscale: 'RSSMRA80A01F205X', nome: 'Andrea', cognome: 'Ricci', email: 'andrea.ricci@email.it', telefono: '3434567890', indirizzo: 'Via Po 15', citta: 'Parma', dataRegistrazione: '2023-11-05T11:30:00', statoAttivita: 'Attivo' },
    { id: 12, codiceFiscale: 'BNCLRA85B02G210Y', nome: 'Giulia', cognome: 'Gallo', email: 'giulia.gallo@email.it', telefono: '3445678901', indirizzo: 'Via Adige 8', citta: 'Verona', dataRegistrazione: '2023-12-12T09:45:00', statoAttivita: 'Inattivo' },
    { id: 13, codiceFiscale: 'VRDGPP90C03H215Z', nome: 'Paolo', cognome: 'Russo', email: 'paolo.russo@email.it', telefono: '3456789012', indirizzo: 'Via Tevere 22', citta: 'Perugia', dataRegistrazione: '2024-01-20T14:15:00', statoAttivita: 'Attivo' },
    { id: 14, codiceFiscale: 'NRIMRA75D04I220W', nome: 'Elena', cognome: 'Martini', email: 'elena.martini@email.it', telefono: '3467890123', indirizzo: 'Via Arno 5', citta: 'Pisa', dataRegistrazione: '2024-02-28T16:00:00', statoAttivita: 'Attivo' },
    { id: 15, codiceFiscale: 'FRRANT88E05J225V', nome: 'Roberto', cognome: 'Costa', email: 'roberto.costa@email.it', telefono: '3478901234', indirizzo: 'Via Po 30', citta: 'Torino', dataRegistrazione: '2024-03-15T10:30:00', statoAttivita: 'Inattivo' },
    { id: 16, codiceFiscale: 'ESPSFA92F06K230T', nome: 'Sara', cognome: 'Barbieri', email: 'sara.barbieri@email.it', telefono: '3489012345', indirizzo: 'Via Adige 12', citta: 'Bologna', dataRegistrazione: '2024-04-01T08:15:00', statoAttivita: 'Attivo' },
    { id: 17, codiceFiscale: 'ROMFRN89G07L235S', nome: 'Luca', cognome: 'Fontana', email: 'luca.fontana@email.it', telefono: '3490123456', indirizzo: 'Via Tevere 18', citta: 'Roma', dataRegistrazione: '2024-05-10T13:45:00', statoAttivita: 'Attivo' },
    { id: 18, codiceFiscale: 'GRCELN95H08M240P', nome: 'Anna', cognome: 'Marchetti', email: 'anna.marchetti@email.it', telefono: '3501234567', indirizzo: 'Via Arno 9', citta: 'Firenze', dataRegistrazione: '2024-06-22T11:00:00', statoAttivita: 'Inattivo' },
    { id: 19, codiceFiscale: 'FRRMAR88I09N245O', nome: 'Giovanni', cognome: 'Mancini', email: 'giovanni.mancini@email.it', telefono: '3512345678', indirizzo: 'Via Po 25', citta: 'Milano', dataRegistrazione: '2024-07-15T15:30:00', statoAttivita: 'Attivo' },
    { id: 20, codiceFiscale: 'DLCCHR90L10O250M', nome: 'Francesca', cognome: 'Leoni', email: 'francesca.leoni@email.it', telefono: '3523456789', indirizzo: 'Via Adige 3', citta: 'Verona', dataRegistrazione: '2024-08-05T09:00:00', statoAttivita: 'Attivo' },
    { id: 21, codiceFiscale: 'RSSMRA80A01F205X', nome: 'Alessandro', cognome: 'Giordano', email: 'alessandro.giordano@email.it', telefono: '3534567890', indirizzo: 'Via Tevere 40', citta: 'Perugia', dataRegistrazione: '2024-09-18T12:45:00', statoAttivita: 'Inattivo' },
    { id: 22, codiceFiscale: 'BNCLRA85B02G210Y', nome: 'Valentina', cognome: 'Gatti', email: 'valentina.gatti@email.it', telefono: '3545678901', indirizzo: 'Via Arno 15', citta: 'Pisa', dataRegistrazione: '2024-10-01T14:00:00', statoAttivita: 'Attivo' },
    { id: 23, codiceFiscale: 'VRDGPP90C03H215Z', nome: 'Stefano', cognome: 'Bruno', email: 'stefano.bruno@email.it', telefono: '3556789012', indirizzo: 'Via Po 50', citta: 'Torino', dataRegistrazione: '2024-11-12T16:30:00', statoAttivita: 'Attivo' },
    { id: 24, codiceFiscale: 'NRIMRA75D04I220W', nome: 'Martina', cognome: 'Ferrara', email: 'martina.ferrara@email.it', telefono: '3567890123', indirizzo: 'Via Adige 20', citta: 'Bologna', dataRegistrazione: '2024-12-25T08:45:00', statoAttivita: 'Inattivo' },
    { id: 25, codiceFiscale: 'FRRANT88E05J225V', nome: 'Nicola', cognome: 'Rinaldi', email: 'nicola.rinaldi@email.it', telefono: '3578901234', indirizzo: 'Via Tevere 35', citta: 'Roma', dataRegistrazione: '2025-01-08T10:15:00', statoAttivita: 'Attivo' },
    { id: 26, codiceFiscale: 'ESPSFA92F06K230T', nome: 'Monica', cognome: 'Santoro', email: 'monica.santoro@email.it', telefono: '3589012345', indirizzo: 'Via Arno 25', citta: 'Firenze', dataRegistrazione: '2025-02-14T13:30:00', statoAttivita: 'Attivo' },
    { id: 27, codiceFiscale: 'ROMFRN89G07L235S', nome: 'Davide', cognome: 'Moretti', email: 'davide.moretti@email.it', telefono: '3590123456', indirizzo: 'Via Po 60', citta: 'Milano', dataRegistrazione: '2025-03-22T11:45:00', statoAttivita: 'Inattivo' },
    { id: 28, codiceFiscale: 'GRCELN95H08M240P', nome: 'Caterina', cognome: 'Rizzo', email: 'caterina.rizzo@email.it', telefono: '3601234567', indirizzo: 'Via Adige 30', citta: 'Verona', dataRegistrazione: '2025-04-05T09:30:00', statoAttivita: 'Attivo' },
    { id: 29, codiceFiscale: 'FRRMAR88I09N245O', nome: 'Giorgio', cognome: 'Lombardi', email: 'giorgio.lombardi@email.it', telefono: '3612345678', indirizzo: 'Via Tevere 45', citta: 'Perugia', dataRegistrazione: '2025-05-18T15:00:00', statoAttivita: 'Attivo' },
    { id: 30, codiceFiscale: 'DLCCHR90L10O250M', nome: 'Serena', cognome: 'Grassi', email: 'serena.grassi@email.it', telefono: '3623456789', indirizzo: 'Via Arno 35', citta: 'Pisa', dataRegistrazione: '2025-06-01T12:00:00', statoAttivita: 'Inattivo' },
    { id: 31, codiceFiscale: 'RSSMRA80A01F205X', nome: 'Fabio', cognome: 'Marini', email: 'fabio.marini@email.it', telefono: '3634567890', indirizzo: 'Via Po 70', citta: 'Torino', dataRegistrazione: '2025-07-12T10:45:00', statoAttivita: 'Attivo' },
    { id: 32, codiceFiscale: 'BNCLRA85B02G210Y', nome: 'Silvia', cognome: 'Conte', email: 'silvia.conte@email.it', telefono: '3645678901', indirizzo: 'Via Adige 40', citta: 'Bologna', dataRegistrazione: '2025-08-25T14:30:00', statoAttivita: 'Attivo' },
    { id: 33, codiceFiscale: 'VRDGPP90C03H215Z', nome: 'Matteo', cognome: 'Pellegrini', email: 'matteo.pellegrini@email.it', telefono: '3656789012', indirizzo: 'Via Tevere 55', citta: 'Roma', dataRegistrazione: '2025-09-08T08:15:00', statoAttivita: 'Inattivo' },
    { id: 34, codiceFiscale: 'NRIMRA75D04I220W', nome: 'Elisa', cognome: 'Simonetti', email: 'elisa.simonetti@email.it', telefono: '3667890123', indirizzo: 'Via Arno 45', citta: 'Firenze', dataRegistrazione: '2025-10-20T16:00:00', statoAttivita: 'Attivo' },
    { id: 35, codiceFiscale: 'FRRANT88E05J225V', nome: 'Daniele', cognome: 'Amato', email: 'daniele.amato@email.it', telefono: '3678901234', indirizzo: 'Via Po 80', citta: 'Milano', dataRegistrazione: '2025-11-05T11:30:00', statoAttivita: 'Attivo' }
  ],
  totalPages: 4,
  totalElements: 35,
  size: 10,
  number: 0
};
// ---- FINE MOCK ----

function ProprietariLista() {
  const [proprietari, setProprietari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('cognome');
  const [sortDir, setSortDir] = useState('asc');
  const [totalPages, setTotalPages] = useState(0);

  const pageSizeOptions = [5, 10, 15, 20];

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
        let valA = (a[sortBy] || '').toString().toLowerCase();
        let valB = (b[sortBy] || '').toString().toLowerCase();
        
        if (sortBy === 'dataRegistrazione') {
          valA = new Date(a[sortBy] || 0).getTime();
          valB = new Date(b[sortBy] || 0).getTime();
        }
        
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
  }, [page, size, appliedSearchTerm, sortBy, sortDir]);

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0);
  };

  const goToPreviousPage = () => { if (page > 0) setPage(page - 1); };
  const goToNextPage = () => { if (page < totalPages - 1) setPage(page + 1); };

  const handleSort = (columnName) => {
    if (sortBy === columnName) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnName);
      setSortDir('asc');
    }
    setPage(0);
  };

  const getSortIndicator = (columnName) => {
    if (sortBy !== columnName) return null;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
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
          <span className="filter-label">Ordina per:</span>
          <button
            className={`btn-filter ${sortBy === 'nome' ? 'active' : ''}`}
            onClick={() => handleSort('nome')}
          >
            Nome {getSortIndicator('nome')}
          </button>
          <button
            className={`btn-filter ${sortBy === 'cognome' ? 'active' : ''}`}
            onClick={() => handleSort('cognome')}
          >
            Cognome {getSortIndicator('cognome')}
          </button>
          <button
            className={`btn-filter ${sortBy === 'citta' ? 'active' : ''}`}
            onClick={() => handleSort('citta')}
          >
            Città {getSortIndicator('citta')}
          </button>
          <button
            className={`btn-filter ${sortBy === 'dataRegistrazione' ? 'active' : ''}`}
            onClick={() => handleSort('dataRegistrazione')}
          >
            Data {getSortIndicator('dataRegistrazione')}
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
            {appliedSearchTerm ? 'Prova a modificare i filtri di ricerca.' : 'Inizia aggiungendo il tuo primo proprietario.'}
          </p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>COGNOME</th>
                  <th>TELEFONO</th>
                  <th>EMAIL</th>
                  <th>CITTÀ</th>
                  <th>DATA REGISTRAZIONE</th>
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
                            {p.nome}
                          </span>
                        </div>
                      </td>
                      <td>{p.cognome}</td>
                      <td>{p.telefono}</td>
                      <td>{p.email}</td>
                      <td>{p.citta}</td>
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