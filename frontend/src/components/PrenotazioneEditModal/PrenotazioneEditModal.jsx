import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../services/apiService';
import FormModal from '../FormModal/FormModal';
import './PrenotazioneEditModal.css';

const TIPI_VISITA_SELECT = [
  'Visita di controllo',
  'Vaccinazione',
  'Visita d\'urgenza',
  'Chirurgia',
  'Visita specialistica',
  'Controllo post-operatorio',
  'Visita domiciliare',
  'Altro'
];

const PrenotazioneEditModal = ({ 
  prenotazione, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const { get, put } = useApi();
  const [animali, setAnimali] = useState([]);
  const [loadingAnimali, setLoadingAnimali] = useState(true);
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
        console.error('Error fetching animali:', error);
      } finally {
        setLoadingAnimali(false);
      }
    };
    
    fetchAnimali();
  }, [get]);

  // Initialize form with prenotazione data
  useEffect(() => {
    if (prenotazione) {
      setFormData({
        dataOraAppuntamento: prenotazione.dataOraAppuntamento || '',
        tipoVisita: prenotazione.motivo || prenotazione.tipoVisita || '',
        specificaTipoVisita: prenotazione.tipoVisita === 'Altro' ? prenotazione.specificaTipoVisita || '' : '',
        note: prenotazione.note || ''
      });
    }
  }, [prenotazione]);

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
      const payload = {
        dataOraAppuntamento: formData.dataOraAppuntamento,
        tipoVisita: formData.tipoVisita === 'Altro' ? formData.specificaTipoVisita : formData.tipoVisita,
        note: formData.note
      };

      const response = await put(`/api/prenotazioni/${prenotazione.id}`, payload);
      
      if (!response.ok) {
        throw new Error(`Failed to update prenotazione: ${response.status}`);
      }

      const updatedPrenotazione = await response.json();
      onSuccess(updatedPrenotazione);
      onClose();
      
    } catch (error) {
      console.error('Error updating prenotazione:', error);
      alert(`Errore durante l\'aggiornamento della prenotazione: ${error.message}`);
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
          <select
            id="tipoVisita"
            name="tipoVisita"
            value={formData.tipoVisita}
            onChange={handleChange}
            className={hasError('tipoVisita') ? 'error' : ''}
            required
          >
            <option value="">Seleziona tipo di visita</option>
            {TIPI_VISITA_SELECT.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
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