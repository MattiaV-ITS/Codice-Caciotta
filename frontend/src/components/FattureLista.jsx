import React, { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import DocumentiAllegati from './Documenti/DocumentiAllegati';

const FattureLista = ({ visitaId, animaleId }) => {
  const { get } = useApi();
  const [fatture, setFatture] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedFatturaId, setExpandedFatturaId] = useState(null);

  useEffect(() => {
    if (!visitaId) return;
    
    const fetchFatture = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await get(`/api/fatture/visita/${visitaId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setFatture([]);
          } else {
            throw new Error(`Errore durante il recupero delle fatture: ${response.status}`);
          }
        } else {
          const data = await response.json();
          setFatture(data);
        }
      } catch (err) {
        logger.error('Error fetching fatture:', err);
        setError(err.message || 'Errore durante il recupero delle fatture');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFatture();
  }, [visitaId, get]);

  if (isLoading) {
    return (
      <div className="visite-card">
        <div className="visite-card-header">
          <h3>Fatture</h3>
        </div>
        <div className="visite-card-body">
          <div className="loading-spinner"></div>
          <p>Caricamento fatture...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="visite-card">
        <div className="visite-card-header">
          <h3>Fatture</h3>
        </div>
        <div className="visite-card-body">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="visite-card">
      <div className="visite-card-header">
        <h3>Fatture</h3>
        <span className="visite-count">{fatture.length}</span>
      </div>
      <div className="visite-card-body">
        {fatture.length === 0 ? (
          <p className="visite-empty">Nessuna fattura associata a questa visita</p>
        ) : (
          <ul className="fatture-list">
            {fatture.map((fattura) => (
              <li key={fattura.id} className="fatture-list-item">
                <div className="fatture-list-header">
                  <span className="fattura-tipo-badge">
                    📄 Fattura
                  </span>
                </div>
                <div className="fatture-list-details">
                  <div className="fattura-info">
                    <span className="fattura-label">Data:</span>
                    <span className="fattura-value">
                      {new Date(fattura.dataEmissione).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  <div className="fattura-info">
                    <span className="fattura-label">Importo:</span>
                    <span className="fattura-value fattura-importo">
                      {fattura.importoTotale.toFixed(2)} €
                    </span>
                  </div>
                  {fattura.dettaglioServizi && (
                    <div className="fattura-info">
                      <span className="fattura-label">Servizi:</span>
                      <span className="fattura-value">
                        {fattura.dettaglioServizi}
                      </span>
                    </div>
                  )}
                  {fattura.codiceFiscaleCliente && (
                    <div className="fattura-info">
                      <span className="fattura-label">Codice Fiscale:</span>
                      <span className="fattura-value">
                        {fattura.codiceFiscaleCliente}
                      </span>
                    </div>
                  )}
                  {fattura.metodoPagamento && (
                    <div className="fattura-info">
                      <span className="fattura-label">Metodo Pagamento:</span>
                      <span className="fattura-value">
                        {fattura.metodoPagamento}
                      </span>
                    </div>
                  )}
                  {(fattura.indirizzoCliente || fattura.cittaCliente) && (
                    <div className="fattura-info">
                      <span className="fattura-label">Indirizzo:</span>
                      <span className="fattura-value">
                        {fattura.indirizzoCliente} {fattura.cittaCliente && `, ${fattura.cittaCliente}`}
                      </span>
                    </div>
                  )}
                  
                  {/* Pulsante per mostrare/nascondere scan fattura */}
                  {animaleId && (
                    <div style={{ marginTop: '8px' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setExpandedFatturaId(expandedFatturaId === fattura.id ? null : fattura.id)}
                        style={{ width: '100%', fontSize: '12px' }}
                      >
                        {expandedFatturaId === fattura.id ? '📄 Nascondi scan' : '🧾 Scan fattura'}
                      </button>
                      
                      {expandedFatturaId === fattura.id && (
                        <div style={{ marginTop: '8px', padding: '8px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
                          <DocumentiAllegati
                            animaleId={animaleId}
                            fatturaId={fattura.id}
                            titolo="Scan fattura"
                            nascondiSeVuoto={true}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FattureLista;