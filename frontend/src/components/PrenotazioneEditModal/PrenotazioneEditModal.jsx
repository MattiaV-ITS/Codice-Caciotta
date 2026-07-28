import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../services/apiService';
import FormModal from '../FormModal/FormModal';
import './PrenotazioneEditModal.css';

const PrenotazioneEditModal = ({ 
  prenotazione, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const { get, put } = useApi();
  const [animali, setAnimali] = useState([]);
  const [loadingAnimali, setLoadingAnimali] = useState(true);
  const [prestazioni, setPrestazioni] = useState([]);
  const [loadingPrestazioni, setLoadingPrestazioni] = useState(true);
  const [errorPrestazioni, setErrorPrestazioni] = useState(null);
  const [formData, setFormData] = useState({
    dataOraAppuntamento: '',
    tipoVisita: '',
    specificaTipoVisita: '',
    animaleId: '',
    note: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch animali on component mount
  useEffect(() => {
    const fetchAnimali = async () => {
      try {
        setLoadingAnimali(true);
        const animaliResponse = await get('/api/animali');
        if (animaliResponse.ok) {
          const animaliData = await animaliResponse.json();
          setAnimali(animaliData.content || animaliData);
        }
      } catch (error) {
        // Log only in dev mode
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching animali:', error);
        }
      } finally {
        setLoadingAnimali(false);
      }
    };
    
    fetchAnimali();
  }, [get]);

  // Fetch prestazioni for dynamic visit type options
  useEffect(() => {
    const fetchPrestazioni = async () => {
      try {
        setLoadingPrestazioni(true);
        const response = await get('/api/prestazioni');
        if (response.ok) {
          const data = await response.json();
          const prestazioniArray = Array.isArray(data)
            ? data
            : (data.content && Array.isArray(data.content)
                ? data.content
                : []);
          setPrestazioni(prestazioniArray);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching prestazioni:', error);
        }
        setErrorPrestazioni('Errore nel caricamento delle prestazioni');
      } finally {
        setLoadingPrestazioni(false);
      }
    };

    fetchPrestazioni();
  }, [get]);

  const availablePrestazioni = Array.isArray(prestazioni)
    ? prestazioni.filter(p => p.stato === true)
    : [];

  // Initialize form with prenotazione data
  useEffect(() => {
    if (prenotazione) {
      setFormData({
        dataOraAppuntamento: prenotazione.dataOraAppuntamento || '',
        tipoVisita: prenotazione.tipoVisita || '',
        specificaTipoVisita: prenotazione.tipoVisita === 'Altro' ? prenotazione.specificaTipoVisita || '' : '',
        animaleId: prenotazione.animaleId || (prenotazione.animale?.id) || '',
        note: prenotazione.note || ''
      });
    }
  }, [prenotazione]);

  // After prestazioni are loaded, check if we need to update the tipoVisita to match available options
  useEffect(() => {
    if (prenotazione && prestazioni.length > 0 && formData.tipoVisita) {
      // Check if the current tipoVisita exists in prestazioni
      const tipoVisitaExists = prestazioni.some(p => p.nomePrestazione === formData.tipoVisita);

      // If the current tipoVisita is not found in prestazioni, try to find a matching one from prenotazione
      if (!tipoVisitaExists && prenotazione.tipoVisita) {
        const matchingPrestazione = prestazioni.find(p => p.nomePrestazione === prenotazione.tipoVisita);
        if (matchingPrestazione) {
          setFormData(prev => ({
            ...prev,
            tipoVisita: matchingPrestazione.nomePrestazione
          }));
        }
      }
    }
  }, [prenotazione, prestazioni, formData.tipoVisita]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.dataOraAppuntamento) {
      newErrors.dataOraAppuntamento = 'La data e ora sono obbligatorie';
    }
    
    if (!formData.tipoVisita) {
      newErrors.tipoVisita = 'Il tipo di visita è obbligatorio';
    }
    
    if (formData.tipoVisita === 'Altro' && !formData.specificaTipoVisita) {
      newErrors.specificaTipoVisita = 'Specifica il tipo di visita';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Extract IDs with multiple fallback approaches
      const animaleId = prenotazione?.animaleId || prenotazione?.animale?.id || formData.animaleId;
      const proprietarioId = prenotazione?.proprietarioId || prenotazione?.proprietario?.id;

      if (!animaleId) {
        throw new Error('Animal ID is missing from prenotazione data');
      }
      if (!proprietarioId) {
        throw new Error('Proprietario ID is missing from prenotazione data');
      }
      
      // Include all required fields for backend deserialization (using DTO format)
      const payload = {
        dataOraAppuntamento: formData.dataOraAppuntamento,
        tipoVisita: formData.tipoVisita === 'Altro' ? formData.specificaTipoVisita : formData.tipoVisita,
        note: formData.note,
        animaleId: animaleId,
        proprietarioId: proprietarioId
      };
      
      const response = await put(`/api/prenotazioni/${prenotazione.id}`, payload);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(`Failed to update prenotazione: ${errorData.message || response.status}`);
      }

      const updatedPrenotazione = await response.json();
      // Merge the returned DTO with frontend display fields
      const enhancedPrenotazione = {
        ...updatedPrenotazione,
        animale: prenotazione.animale,
        proprietarioNome: prenotazione.proprietarioNome,
        animaleNome: prenotazione.animaleNome,
        specie: prenotazione.specie,
        // Ensure motivo matches for color mapping
        motivo: updatedPrenotazione.tipoVisita
      };
      onSuccess(enhancedPrenotazione);
      onClose();
      
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating prenotazione:', error);
      }
      alert(`Errore durante l'aggiornamento della prenotazione: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasError = (field) => touched[field] && errors[field];
  const showSpecificaTipo = formData.tipoVisita === 'Altro';

  return (
    <FormModal
      title="Modifica Prenotazione"
      onClose={onClose}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitLabel="Salva Modifiche"
      cancelLabel="Annulla"
    >
      <form onSubmit={handleSubmit} className="prenotazione-edit-form">
        <div className="form-group">
          <label htmlFor="dataOraAppuntamento">Data e Ora</label>
          <input
            type="datetime-local"
            id="dataOraAppuntamento"
            name="dataOraAppuntamento"
            value={formData.dataOraAppuntamento}
            onChange={handleChange}
            className={hasError('dataOraAppuntamento') ? 'error' : ''}
            required
          />
          {hasError('dataOraAppuntamento') && (
            <span className="error-message">{errors.dataOraAppuntamento}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="tipoVisita">Tipo di Visita</label>
          {loadingPrestazioni ? (
            <div style={{ color: 'var(--gray-500)', fontSize: '14px', padding: '8px' }}>
              Caricamento prestazioni...
            </div>
          ) : errorPrestazioni ? (
            <div style={{ color: 'var(--danger)', fontSize: '14px', padding: '8px' }}>
              {errorPrestazioni}
            </div>
          ) : (
            <select
              id="tipoVisita"
              name="tipoVisita"
              value={formData.tipoVisita}
              onChange={handleChange}
              className={hasError('tipoVisita') ? 'error' : ''}
              required
            >
              <option value="">Seleziona tipo di visita</option>
              {prestazioni.map((prestazione) => {
                const isAvailable = availablePrestazioni.some(p => p.id === prestazione.id);
                return (
                  <option 
                    key={prestazione.id} 
                    value={prestazione.nomePrestazione}
                    disabled={!isAvailable}
                  >
                    {prestazione.nomePrestazione} - €{prestazione.costoBase?.toFixed(2) || '0.00'}
                    {!isAvailable ? ' (Non disponibile)' : ''}
                  </option>
                );
              })}
              <option value="Altro">Altro (specifica)</option>
            </select>
          )}
          {hasError('tipoVisita') && (
            <span className="error-message">{errors.tipoVisita}</span>
          )}
        </div>

        {showSpecificaTipo && (
          <div className="form-group">
            <label htmlFor="specificaTipoVisita">Specifica Tipo Visita</label>
            <input
              type="text"
              id="specificaTipoVisita"
              name="specificaTipoVisita"
              value={formData.specificaTipoVisita}
              onChange={handleChange}
              placeholder="Es. Visita cardiologica"
              className={hasError('specificaTipoVisita') ? 'error' : ''}
            />
            {hasError('specificaTipoVisita') && (
              <span className="error-message">{errors.specificaTipoVisita}</span>
            )}
          </div>
        )}

        {/* Animal field removed - cannot be changed after creation */}
        {prenotazione?.animaleNome && (
          <div className="form-group">
            <label>Animale</label>
            <div className="readonly-field">
              {prenotazione.animaleNome} ({prenotazione.specie})
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="note">Note</label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Note aggiuntive sulla prenotazione"
            rows={3}
          />
        </div>
      </form>
    </FormModal>
  );
};

export default PrenotazioneEditModal;
