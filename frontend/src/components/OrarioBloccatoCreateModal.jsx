import React, { useState } from 'react';
import { useApi } from '../services/apiService';
import { formatDate } from '../utils/dateUtils';
import './FormModal/FormModal.css';

function OrarioBloccatoCreateModal({ onClose, onSuccess, selectedDate }) {
  const { post } = useApi();
  const [formData, setFormData] = useState({
    data: selectedDate || formatDate(new Date()),
    oraInizio: '09:00',
    oraFine: '10:00',
    motivo: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.data) {
      newErrors.data = 'La data è obbligatoria';
    }

    if (!formData.oraInizio) {
      newErrors.oraInizio = "L'orario di inizio è obbligatorio";
    }

    if (!formData.oraFine) {
      newErrors.oraFine = "L'orario di fine è obbligatorio";
    } else if (formData.oraInizio && formData.oraFine && formData.oraInizio >= formData.oraFine) {
      newErrors.oraFine = "L'orario di fine deve essere successivo all'orario di inizio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the request data
      const requestData = {
        data: formData.data,
        oraInizio: formData.oraInizio,
        oraFine: formData.oraFine,
        motivo: formData.motivo || undefined
      };

      const response = await post('/api/admin/orari/bloccati', requestData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create blocked time slot');
      }

      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error creating blocked time slot:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Si è verificato un errore durante la creazione dell\'orario bloccato'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Crea Nuovo Orario Bloccato</h3>
          <button className="modal-close" onClick={onClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="data">Data</label>
              <input
                type="date"
                id="data"
                name="data"
                value={formData.data}
                onChange={handleChange}
                className={errors.data ? 'form-error' : ''}
                required
              />
              {errors.data && <span className="error-message">{errors.data}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="oraInizio">Ora Inizio</label>
              <input
                type="time"
                id="oraInizio"
                name="oraInizio"
                value={formData.oraInizio}
                onChange={handleChange}
                className={errors.oraInizio ? 'form-error' : ''}
                required
                step="900" // 15-minute intervals
              />
              {errors.oraInizio && <span className="error-message">{errors.oraInizio}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="oraFine">Ora Fine</label>
              <input
                type="time"
                id="oraFine"
                name="oraFine"
                value={formData.oraFine}
                onChange={handleChange}
                className={errors.oraFine ? 'form-error' : ''}
                required
                step="900" // 15-minute intervals
                min={formData.oraInizio}
              />
              {errors.oraFine && <span className="error-message">{errors.oraFine}</span>}
            </div>

            <div className="form-group full-width">
              <label htmlFor="motivo">Motivo (opzionale)</label>
              <textarea
                id="motivo"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                rows="3"
                placeholder="Es. Riunione, Manutenzione, Pausa personale..."
              />
            </div>
          </div>

          {errors.submit && <div className="form-error">{errors.submit}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Annulla
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creazione in corso...' : 'Crea Orario Bloccato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrarioBloccatoCreateModal;