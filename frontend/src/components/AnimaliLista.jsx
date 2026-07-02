import React, { useEffect, useState } from 'react';

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

  // Dati di stato placeholder associati all'id dell'animale (sostituire con dati reali se disponibili)
  const statusMap = {
    // id: { label: string, color: string }
    1: { label: 'Sano', color: '#4CAF50' },          // verde
    2: { label: 'Vaccino in Sospeso', color: '#FF9800' }, // arancione
    3: { label: 'In Trattamento', color: '#F44336' }, // rosso
    4: { label: 'Controllo', color: '#2196F3' },     // blu
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
    
    fetch(`/api/animali?${params.toString()}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch animali');
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
  }, [page, size, appliedSearchTerm, specieFilter, sortBy, sortDir]);

  const goToPreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const goToNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  // Funzione ausiliaria per ottenere la lettera iniziale dell'icona dalla specie
  const getIconLetter = (specie) => {
    if (!specie) return '?';
    return specie.charAt(0).toUpperCase();
  };

  // Funzione ausiliaria per formattare la data nello stile italiano
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Funzione per gestire il cambio di ordinamento
  const handleSort = (columnName) => {
    if (sortBy === columnName) {
      // Se stiamo già ordinando per questa colonna, invertiamo la direzione
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      // Altrimenti impostiamo la nuova colonna e la direzione predefinita
      setSortBy(columnName);
      setSortDir('asc');
    }
    // Resetta alla prima pagina quando cambia l'ordinamento
    setPage(0);
  };

  // Funzione per ottenere l'indicatore di ordinamento
  const getSortIndicator = (columnName) => {
    if (sortBy !== columnName) return null;
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading) return <p>Caricamento animali...</p>;
  if (error) return <p>Errore: {error}</p>;

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>Elenco Pazienti</h2>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setSpecieFilter('');
              setSearchTerm('');
              setAppliedSearchTerm('');
              setPage(0);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: specieFilter === '' ? '#2196F3' : '#f0f4f8',
              color: specieFilter === '' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: specieFilter === '' ? '600' : 'normal'
            }}
          >
            Tutti
          </button>
          
          <button
            onClick={() => {
              setSpecieFilter('cane');
              setSearchTerm('');
              setAppliedSearchTerm('');
              setPage(0);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: specieFilter === 'cane' ? '#2196F3' : '#f0f4f8',
              color: specieFilter === 'cane' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: specieFilter === 'cane' ? '600' : 'normal'
            }}
          >
            Cane
          </button>
          
          <button
            onClick={() => {
              setSpecieFilter('gatto');
              setSearchTerm('');
              setAppliedSearchTerm('');
              setPage(0);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: specieFilter === 'gatto' ? '#2196F3' : '#f0f4f8',
              color: specieFilter === 'gatto' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: specieFilter === 'gatto' ? '600' : 'normal'
            }}
          >
            Gatto
          </button>
          
          <button
            onClick={() => {
              setSpecieFilter('altro');
              setSearchTerm('');
              setAppliedSearchTerm('');
              setPage(0);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: specieFilter === 'altro' ? '#2196F3' : '#f0f4f8',
              color: specieFilter === 'altro' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: specieFilter === 'altro' ? '600' : 'normal'
            }}
          >
            Altro
          </button>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Cerca per nome animale, microchip o nome proprietario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                setAppliedSearchTerm(searchTerm);
                setPage(0); // Reset to first page when search is submitted
              }
            }}
            style={{ padding: '8px', flex: '1', minWidth: '200px' }}
          />
          
          <button 
            onClick={() => {
              setSearchTerm('');
              setAppliedSearchTerm('');
              setPage(0);
            }}
            style={{ padding: '8px 16px' }}
          >
            Cancella Filtri
          </button>
        </div>
      </div>

      {animali.length === 0 ? (
        <p>Nessun animale trovato.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f4f8', textAlign: 'left' }}>
              <th style={{ padding: '12px 8px', cursor: 'pointer' }} onClick={() => handleSort('nome')}>NOME ANIMALE{getSortIndicator('nome')}</th>
              <th style={{ padding: '12px 8px', cursor: 'pointer' }} onClick={() => handleSort('razza')}>RAZZA{getSortIndicator('razza')}</th>
              <th style={{ padding: '12px 8px', cursor: 'pointer' }} onClick={() => handleSort('proprietario')}>PROPRIETARIO{getSortIndicator('proprietario')}</th>
              <th style={{ padding: '12px 8px', cursor: 'pointer' }} onClick={() => handleSort('dataNascita')}>DATA DI NASCITA{getSortIndicator('dataNascita')}</th>
              <th style={{ padding: '12px 8px', cursor: 'pointer' }} onClick={() => handleSort('microchip')}>MICROCHIP{getSortIndicator('microchip')}</th>
              <th style={{ padding: '12px 8px' }}>STATO</th>
              <th style={{ padding: '12px 8px', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {animali.map((animale, index) => {
              const isFemale = animale.sesso?.toLowerCase() === 'f';
              const nameColor = isFemale ? '#E91E63' : '#2196F3'; // pink or blue
              const status = statusMap[animale.id] || { label: 'Stato', color: '#9E9E9E' };

              return (
                <tr key={animale.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: '#cfd8dc',
                        color: '#37474f',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        userSelect: 'none',
                      }}
                      title={animale.specie}
                    >
                      {getIconLetter(animale.specie)}
                    </div>
                    <span style={{ color: nameColor, fontWeight: '600' }}>{animale.nome}</span>
                  </td>
                  <td style={{ padding: '10px 8px' }}>{animale.razza || '-'}</td>
                  <td style={{ padding: '10px 8px' }}>{animale.proprietario || '-'}</td>
                  <td style={{ padding: '10px 8px' }}>{formatDate(animale.dataNascita)}</td>
                  <td style={{ padding: '10px 8px' }}>{animale.microchip || '-'}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <span
                      style={{
                        backgroundColor: status.color,
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'inline-block',
                        minWidth: '90px',
                        textAlign: 'center',
                      }}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', cursor: 'pointer' }}>
                    &#x22EE; {/* ellissi verticale */}
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

export default AnimaliLista;
