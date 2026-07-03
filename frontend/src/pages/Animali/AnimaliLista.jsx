import React, { useEffect, useState } from 'react';

// ---- MOCK DATI ----
const MOCK_ANIMALI = {
  content: [
    { id: 1, nome: 'Fido', specie: 'cane', razza: 'Labrador', proprietario: 'Mario Rossi', dataNascita: '2020-05-15', microchip: '123456789012345', sesso: 'M', stato: 'SANO' },
    { id: 2, nome: 'Mimì', specie: 'gatto', razza: 'Persiano', proprietario: 'Laura Bianchi', dataNascita: '2021-08-22', microchip: '987654321098765', sesso: 'F', stato: 'IN_CURA' },
    { id: 3, nome: 'Rex', specie: 'cane', razza: 'Pastore Tedesco', proprietario: 'Giuseppe Verdi', dataNascita: '2019-11-10', microchip: null, sesso: 'M', stato: 'MALATO' },
    { id: 4, nome: 'Luna', specie: 'gatto', razza: 'Siamese', proprietario: 'Maria Neri', dataNascita: '2022-03-05', microchip: '567890123456789', sesso: 'F', stato: 'DECEDUTO' },
    { id: 5, nome: 'Pippo', specie: 'altro', razza: 'Coniglio Nano', proprietario: 'Antonio Ferrari', dataNascita: '2023-01-20', microchip: '345678901234567', sesso: 'M', stato: 'SANO' },
    { id: 6, nome: 'Bella', specie: 'cane', razza: 'Barboncino', proprietario: 'Sofia Esposito', dataNascita: '2021-12-10', microchip: '234567890123456', sesso: 'F', stato: 'IN_CURA' },
    { id: 7, nome: 'Leo', specie: 'gatto', razza: 'Europeo', proprietario: 'Francesco Romano', dataNascita: '2022-07-18', microchip: '456789012345678', sesso: 'M', stato: 'SANO' },
    { id: 8, nome: 'Daisy', specie: 'altro', razza: 'Criceto', proprietario: 'Elena Greco', dataNascita: '2023-09-01', microchip: null, sesso: 'F', stato: 'DECEDUTO' },
    { id: 9, nome: 'Thor', specie: 'cane', razza: 'Mastino', proprietario: 'Marco Ferri', dataNascita: '2018-06-25', microchip: '678901234567890', sesso: 'M', stato: 'MALATO' },
    { id: 10, nome: 'Mia', specie: 'gatto', razza: 'Maine Coon', proprietario: 'Chiara De Luca', dataNascita: '2020-11-30', microchip: '789012345678901', sesso: 'F', stato: 'SANO' }
  ],
  totalPages: 3,
  totalElements: 25,
  size: 10,
  number: 0
};
// ---- FINE MOCK ----

function AnimaliLista() {
  const [animali, setAnimali] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [specieFilter, setSpecieFilter] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  // Funzione per mappare lo stato dell'animale
  const getStatoInfo = (stato) => {
    const map = {
      'SANO': { label: 'Sano', className: 'badge-sano' },
      'MALATO': { label: 'Malato', className: 'badge-malato' },
      'IN_CURA': { label: 'In cura', className: 'badge-in-cura' },
      'DECEDUTO': { label: 'Deceduto', className: 'badge-deceduto' }
    };
    return map[stato] || { label: 'Sconosciuto', className: 'badge-sconosciuto' };
  };

  // Caricamento dati mock
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...MOCK_ANIMALI.content];
      if (specieFilter) filtered = filtered.filter(a => a.specie === specieFilter);
      if (appliedSearchTerm) {
        const term = appliedSearchTerm.toLowerCase();
        filtered = filtered.filter(a =>
          a.nome.toLowerCase().includes(term) ||
          (a.microchip && a.microchip.includes(term)) ||
          a.proprietario.toLowerCase().includes(term)
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
      setAnimali(paginated);
      setTotalPages(Math.ceil(filtered.length / size));
      setLoading(false);
    }, 500);
  }, [page, size, appliedSearchTerm, specieFilter, sortBy, sortDir]);

  const goToPreviousPage = () => { if (page > 0) setPage(page - 1); };
  const goToNextPage = () => { if (page < totalPages - 1) setPage(page + 1); };

  const getIconLetter = (specie) => specie ? specie.charAt(0).toUpperCase() : '?';

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

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
            Altro
          </button>
        </div>
        <div className="toolbar-actions">
          <div className="search-box-wrapper">
            <div className="search-icon-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Cerca per nome, microchip o proprietario..."
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
                  <th>STATO</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {animali.map((animale) => {
                  const isFemale = animale.sesso?.toLowerCase() === 'f';
                  const isMale = animale.sesso?.toLowerCase() === 'm';
                  
                  let avatarClass = 'avatar-default';
                  if (isFemale) avatarClass = 'avatar-female';
                  else if (isMale) avatarClass = 'avatar-male';

                  return (
                    <tr key={animale.id}>
                      <td>
                        <div className="cell-content">
                          <div className={`avatar-circle ${avatarClass}`}>
                            {getIconLetter(animale.specie)}
                          </div>
                          <span className={`name-colored ${isFemale ? 'name-female' : 'name-male'}`}>
                            {animale.nome}
                          </span>
                        </div>
                      </td>
                      {/* ... resto delle colonne ... */}
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

export default AnimaliLista;