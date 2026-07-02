import React, { useEffect, useState } from 'react';

function ProprietariLista() {
  const [proprietari, setProprietari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [cittaFilter, setCittaFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    if (cittaFilter) {
      params.append('citta', cittaFilter);
    }
    
    fetch(`/api/proprietari?${params.toString()}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch proprietari');
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
  }, [page, size, searchTerm, cittaFilter]);

  const goToPreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const goToNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page when search changes
  };

  const handleCittaChange = (e) => {
    setCittaFilter(e.target.value);
    setPage(0); // Reset to first page when city filter changes
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCittaFilter('');
    setPage(0);
  };

  // Helper to format date in Italian style
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return <p>Caricamento proprietari...</p>;
  if (error) return <p>Errore: {error}</p>;

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>Elenco Proprietari</h2>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Cerca per nome, cognome, telefono, email o codice fiscale..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ padding: '8px', flex: '1', minWidth: '200px' }}
        />
        
        <input
          type="text"
          placeholder="Filtra per città..."
          value={cittaFilter}
          onChange={handleCittaChange}
          style={{ padding: '8px', flex: '1', minWidth: '200px' }}
        />
        
        <button onClick={clearFilters} style={{ padding: '8px 16px' }}>
          Cancella Filtri
        </button>
      </div>

      {proprietari.length === 0 ? (
        <p>Nessun proprietario trovato.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f4f8', textAlign: 'left' }}>
              <th style={{ padding: '12px 8px' }}>NOME E COGNOME</th>
              <th style={{ padding: '12px 8px' }}>EMAIL</th>
              <th style={{ padding: '12px 8px' }}>TELEFONO</th>
              <th style={{ padding: '12px 8px' }}>CITTÀ</th>
              <th style={{ padding: '12px 8px' }}>DATA REGISTRAZIONE</th>
              <th style={{ padding: '12px 8px' }}>NUMERO ANIMALI</th>
              <th style={{ padding: '12px 8px', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {proprietari.map((proprietario) => {
              const fullName = `${proprietario.nome} ${proprietario.cognome}`;

              return (
                <tr key={proprietario.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: '#2196F3',
                        color: '#fff',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        userSelect: 'none',
                      }}
                      title={fullName}
                    >
                      {proprietario.nome.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: '600' }}>{fullName}</span>
                  </td>
                  <td style={{ padding: '10px 8px' }}>{proprietario.email}</td>
                  <td style={{ padding: '10px 8px' }}>{proprietario.telefono}</td>
                  <td style={{ padding: '10px 8px' }}>{proprietario.citta}</td>
                  <td style={{ padding: '10px 8px' }}>{formatDate(proprietario.dataRegistrazione)}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <span
                      style={{
                        backgroundColor: proprietario.numeroAnimali > 0 ? '#4CAF50' : '#9E9E9E',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'inline-block',
                        minWidth: '30px',
                        textAlign: 'center',
                      }}
                    >
                      {proprietario.numeroAnimali}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', cursor: 'pointer' }}>
                    &#x22EE; {/* vertical ellipsis */}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={goToPreviousPage} disabled={page === 0}>
          Precedente
        </button>
        <span>
          Pagina <strong>{page + 1}</strong> di <strong>{totalPages}</strong>
        </span>
        <button onClick={goToNextPage} disabled={page >= totalPages - 1}>
          Successiva
        </button>
      </div>
    </div>
  );
}

export default ProprietariLista;