import React, { useEffect, useState } from 'react';

function AnimaliLista() {
  const [animali, setAnimali] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/animali')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch animali');
        }
        return response.json();
      })
      .then(data => {
        setAnimali(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Caricamento animali...</p>;
  if (error) return <p>Errore: {error}</p>;

  return (
    <div>
      <h2>Lista degli Animali</h2>

      {animali.length === 0 && <p>Nessun animale trovato.</p>}

      <ul>
        {animali.map(animale => (
          <li key={animale.id}>
            {animale.name} ({animale.species})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AnimaliLista;
