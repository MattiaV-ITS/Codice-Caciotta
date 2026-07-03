import React, { useEffect, useState } from 'react';

function AnimaliLista() {
  const [animali, setAnimali] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Example placeholder status data keyed by animal id (replace with real data if available)
  const statusMap = {
    // id: { label: string, color: string }
    1: { label: 'Sano', color: '#4CAF50' },          // green
    2: { label: 'Vaccino in Sospeso', color: '#FF9800' }, // orange
    3: { label: 'In Trattamento', color: '#F44336' }, // red
    4: { label: 'Sano', color: '#4CAF50' },
    5: { label: 'Controllo', color: '#2196F3' },     // blue
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/animali?page=${page}&size=${size}`)
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
  }, [page, size]);

  const goToPreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const goToNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  // Helper to get first letter icon from specie
  const getIconLetter = (specie) => {
    if (!specie) return '?';
    return specie.charAt(0).toUpperCase();
  };

  // Helper to format date in Italian style
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return <p>Caricamento animali...</p>;
  if (error) return <p>Errore: {error}</p>;

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>Elenco Pazienti</h2>

      {animali.length === 0 ? (
        <p>Nessun animale trovato.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f4f8', textAlign: 'left' }}>
              <th style={{ padding: '12px 8px' }}>NOME ANIMALE</th>
              <th style={{ padding: '12px 8px' }}>RAZZA</th>
              <th style={{ padding: '12px 8px' }}>PROPRIETARIO</th>
              <th style={{ padding: '12px 8px' }}>DATA DI NASCITA</th>
              <th style={{ padding: '12px 8px' }}>MICROCHIP</th>
              <th style={{ padding: '12px 8px' }}>STATO</th>
              <th style={{ padding: '12px 8px', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {animali.map((animale, index) => {
              const isFemale = animale.sesso?.toLowerCase() === 'femmina';
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

export default AnimaliLista;
