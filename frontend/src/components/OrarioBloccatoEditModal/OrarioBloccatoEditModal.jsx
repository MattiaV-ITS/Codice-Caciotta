import React, { useState, useEffect } from 'react';
import { useApi } from '../../services/apiService';
import '../FormModal/FormModal.css';

function OrarioBloccatoEditModal({ onClose, onSuccess, blockedTime }) {
  const { put } = useApi();
  const [formData, setFormData] = useState({
    data: blockedTime?.data || '',
    oraInizio: blockedTime?.oraInizio || '09:00',
    oraFine: blockedTime?.oraFine || '10:00',
    motivo: blockedTime?.motivo || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (blockedTime) {
      setFormData({
        data: blockedTime.data || '',
        oraInizio: blockedTime.oraInizio || '09:00',
        oraFine: blockedTime.oraFine || '10:00',
        motivo: blockedTime.motivo || ''
      });
    }
  }, [blockedTime]);

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

      const response = await put(`/api/admin/orari/bloccati/${blockedTime.id}`, requestData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update blocked time slot');
      }

      const updatedBlockedTime = await response.json();
      onSuccess(updatedBlockedTime);
      onClose();

    } catch (error) {
      logger.error('Error updating blocked time slot:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Si è verificato un errore durante l\'aggiornamento dell\'orario bloccato'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Modifica Orario Bloccato</h3>
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
                style={{ fontFamily: 'inherit' }}
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
                step="900"
                style={{ fontFamily: 'inherit' }}
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
                step="900"
                min={formData.oraInizio}
                style={{ fontFamily: 'inherit' }}
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
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Aggiornamento in corso...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrarioBloccatoEditModal;
