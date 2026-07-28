import React, { useState, useEffect } from 'react';
import { useApi } from '../services/apiService';
import logger from '../utils/logger';

const FatturaSemplificataModal = ({ visitaId, proprietario, animale, onClose, onSuccess }) => {
  const { post, get } = useApi();
  const [formData, setFormData] = useState({
    codiceFiscaleOPartitaIva: '',
    indirizzoCliente: '',
    cittaCliente: '',
    dettaglioServizi: '',
    importoTotale: '0.00'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Calcola importo totale dalle prestazioni della visita
  useEffect(() => {
    const fetchImportoFromPrestazioni = async () => {
      if (!visitaId) return;
      try {
        const response = await get(`/api/visite/${visitaId}`);
        if (response.ok) {
          const visitaData = await response.json();
          const prestazioniResponse = await get('/api/prestazioni');
          if (prestazioniResponse.ok) {
            const prestazioniData = await prestazioniResponse.json();
            const prestazioniArray = Array.isArray(prestazioniData)
              ? prestazioniData
              : (prestazioniData.content && Array.isArray(prestazioniData.content)
                  ? prestazioniData.content
                  : []);
            
            // Find the prestazione matching the tipoVisita
            if (visitaData.tipoVisita) {
              const matchingPrestazione = prestazioniArray.find(
                p => p.nomePrestazione === visitaData.tipoVisita
              );
              if (matchingPrestazione && matchingPrestazione.costoBase) {
                const costo = typeof matchingPrestazione.costoBase === 'string'
                  ? parseFloat(matchingPrestazione.costoBase)
                  : matchingPrestazione.costoBase;
                setFormData(prev => ({ ...prev, importoTotale: costo.toFixed(2) }));
              }
              // Prefill dettaglioServizi with the visita type description
              setFormData(prev => ({ ...prev, dettaglioServizi: `Servizio di ${visitaData.tipoVisita}` }));
            }
          }
        }
      } catch (error) {
        logger.error('Error fetching importo from prestazioni:', error);
      }
    };

    fetchImportoFromPrestazioni();
  }, [visitaId, get]);

  // Imposta valori predefiniti basati sulla visita e proprietario
  useEffect(() => {
    const fetchProprietarioData = async () => {
      try {
        // Se proprietario è solo un nome (string), proviamo a fetchare i dati completi del proprietario
        if (typeof proprietario === 'string' && animale?.id) {
          // Fetch animale data per proprietario ID
          try {
            const response = await get(`/api/animali/${animale.id}`);
            
            if (response.ok) {
              const animaleData = await response.json();
              
              if (animaleData.idProprietario) {

                try {
                  const proprietarioResponse = await get(`/api/proprietari/${animaleData.idProprietario}`);
                  
                  if (proprietarioResponse.ok) {
                    const proprietarioData = await proprietarioResponse.json();
                    
                    // Precompila tutti i campi dal proprietario
                    if (proprietarioData.codiceFiscale) {
                      setFormData(prev => ({ ...prev, codiceFiscaleOPartitaIva: proprietarioData.codiceFiscale }));
                    }
                    if (proprietarioData.indirizzo) {
                      setFormData(prev => ({ ...prev, indirizzoCliente: proprietarioData.indirizzo }));
                    }
                    if (proprietarioData.citta) {
                      setFormData(prev => ({ ...prev, cittaCliente: proprietarioData.citta }));
                    }
                    return;
                  }
                } catch (error) {
                  logger.error('Failed to fetch proprietario data:', error);
                }
              }
            }
          } catch (error) {
            logger.error('Failed to fetch animale data:', error);
          }
        } else if (proprietario) {
          // Se il proprietario ha un codice fiscale, usalo come default
          if (proprietario.codiceFiscale) {
            setFormData(prev => ({ ...prev, codiceFiscaleOPartitaIva: proprietario.codiceFiscale }));
          }
          // Precompila indirizzo e città se disponibili
          if (proprietario.indirizzo) {
            setFormData(prev => ({ ...prev, indirizzoCliente: proprietario.indirizzo }));
          }
          if (proprietario.citta) {
            setFormData(prev => ({ ...prev, cittaCliente: proprietario.citta }));
          }
        }
      } catch (error) {
        logger.error('Error fetching proprietario data:', error);
      }
    };
    
    fetchProprietarioData();
  }, [proprietario, animale]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.codiceFiscaleOPartitaIva) {
      setError('Codice fiscale è obbligatorio');
      return false;
    }
    
    // Validazione formato codice fiscale (solo 16 caratteri, partita IVA rimossa)
    const codice = formData.codiceFiscaleOPartitaIva.trim();
    if (codice.length !== 16) {
      setError('Il codice fiscale deve essere di 16 caratteri');
      return false;
    }
    
    if (!formData.dettaglioServizi.trim()) {
      setError('Dettaglio servizi è obbligatorio');
      return false;
    }

    if (!formData.importoTotale || parseFloat(formData.importoTotale) < 0) {
      setError('Importo totale non valido');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await post(`/api/fatture/semplificata/visita/${visitaId}`, {
        codiceFiscaleCliente: formData.codiceFiscaleOPartitaIva.trim(),
        indirizzoCliente: formData.indirizzoCliente.trim(),
        cittaCliente: formData.cittaCliente.trim(),
        dettaglioServizi: formData.dettaglioServizi.trim(),
        importoTotale: parseFloat(formData.importoTotale)
      });
      
      if (!response.ok) {
        throw new Error(`Errore durante la creazione della fattura: ${response.status}`);
      }
      
      const fattura = await response.json();
      setSuccess(true);
      
      // Chiama la callback di successo
      if (onSuccess) {
        onSuccess(fattura);
      }
      
    } catch (err) {
      logger.error('Error creating fattura:', err);
      let errorMessage = 'Errore durante la creazione della fattura semplificata';
      
      // Handle specific error cases
      if (err.message && err.message.includes('Esiste già una fattura')) {
        errorMessage = err.message; // Use the backend's descriptive message
      } else if (err.response && err.response.data) {
        errorMessage = err.response.data || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (success && onClose) {
      onClose();
    } else if (!success && onClose) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Crea Fattura di Supporto</h3>
          <button className="modal-close" onClick={handleClose} disabled={isLoading}>
            ×
          </button>
        </div>
        
        {success ? (
          <div className="modal-body">
            <div className="success-message">
              <div className="success-icon">✅</div>
              <h4>Fattura di supporto creata!</h4>
              <p>I dati per la fatturazione elettronica sono stati salvati correttamente.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body">
            <div className="form-group">
              <label htmlFor="codiceFiscaleOPartitaIva">Codice Fiscale o Partita IVA *</label>
              <input
                type="text"
                id="codiceFiscaleOPartitaIva"
                name="codiceFiscaleOPartitaIva"
                className="form-control"
                value={formData.codiceFiscaleOPartitaIva}
                onChange={handleChange}
                placeholder="Inserisci codice fiscale (16 caratteri)"
                required
                disabled={isLoading}
              />
              <small className="form-hint">
                {proprietario?.codiceFiscale ? 'Codice fiscale precompilato dal proprietario' : 'Inserisci il codice fiscale del cliente (solo 16 caratteri)'}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="dettaglioServizi">Dettaglio Servizi *</label>
              <textarea
                id="dettaglioServizi"
                name="dettaglioServizi"
                className="form-control"
                value={formData.dettaglioServizi}
                onChange={handleChange}
                placeholder="Descrivi i servizi forniti (es: Visita veterinaria di controllo, Vaccinazione antirabbica, ecc.)"
                rows="3"
                required
                disabled={isLoading}
              />
              <small className="form-hint">
                Specificare il dettaglio dei servizi invece della quantità e qualità
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="importoTotale">Importo Totale (€) *</label>
              <input
                type="number"
                id="importoTotale"
                name="importoTotale"
                className="form-control"
                value={formData.importoTotale}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                disabled={isLoading}
              />
              <small className="form-hint">
                Importo precompilato dal costo della prestazione. Modificabile se necessario.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="indirizzoCliente">Indirizzo</label>
              <input
                type="text"
                id="indirizzoCliente"
                name="indirizzoCliente"
                className="form-control"
                value={formData.indirizzoCliente}
                onChange={handleChange}
                placeholder="Via e numero civico"
                disabled={isLoading}
              />
              <small className="form-hint">
                {proprietario?.indirizzo ? 'Indirizzo precompilato dal proprietario' : 'Indirizzo del cliente (opzionale)'}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="cittaCliente">Città</label>
              <input
                type="text"
                id="cittaCliente"
                name="cittaCliente"
                className="form-control"
                value={formData.cittaCliente}
                onChange={handleChange}
                placeholder="Città"
                disabled={isLoading}
              />
              <small className="form-hint">
                {proprietario?.citta ? 'Città precompilata dal proprietario' : 'Città del cliente (opzionale)'}
              </small>
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}
          </form>
        )}

        <div className="modal-footer">
          {!success ? (
            <>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose} 
                disabled={isLoading}
              >
                Annulla
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                onClick={handleSubmit} 
                disabled={isLoading}
              >
                {isLoading ? 'Creazione...' : 'Crea Fattura'}
              </button>
            </>
          ) : (
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleClose}
            >
              Chiudi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FatturaSemplificataModal;
