import React, { useState } from 'react';
import { useApi } from '../../services/apiService';
import FormModal from '../FormModal/FormModal';
import './VaccinazioneCreateModal.css';

const VaccinazioneCreateModal = ({
  animaleId,
  animaleNome,
  onClose,
  onSuccess
}) => {
  const { post } = useApi();

  const [formData, setFormData] = useState({
    tipoVaccino: '',
    dataSomministrazione: new Date().toISOString().split('T')[0],
    dataScadenza: '',
    lotto: '',
    note: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const validate = () => {
    const newErrors = {};

    if (!formData.tipoVaccino) {
      newErrors.tipoVaccino = 'Il tipo di vaccino è obbligatorio';
    }

    if (!formData.dataSomministrazione) {
      newErrors.dataSomministrazione = 'La data di somministrazione è obbligatoria';
    }

    if (!formData.dataScadenza) {
      newErrors.dataScadenza = 'La data di scadenza è obbligatoria';
    }

    if (
      formData.dataScadenza &&
      formData.dataSomministrazione &&
      formData.dataScadenza < formData.dataSomministrazione
    ) {
      newErrors.dataScadenza = 'La data di scadenza non può precedere la somministrazione';
    }

    if (!formData.lotto) {
      newErrors.lotto = 'Il numero di lotto è obbligatorio';
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

    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        tipoVaccino: formData.tipoVaccino,
        dataSomministrazione: formData.dataSomministrazione,
        dataScadenza: formData.dataScadenza,
        lotto: formData.lotto,
        note: formData.note,
        animaleId: animaleId
      };

      const response = await post('/api/vaccinazioni', payload);

      if (!response.ok) {
        let serverMessage = '';
        try {
          const errorBody = await response.clone().json();
          serverMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
        } catch {
          try {
            serverMessage = await response.text();
          } catch {
            serverMessage = '';
          }
        }
        throw new Error(serverMessage || `Errore ${response.status} dal server`);
      }

      const createdVaccinazione = await response.json();
      onSuccess(createdVaccinazione);
      onClose();

    } catch (error) {
      console.error('Error creating vaccinazione:', error);
      setSubmitError(`Errore durante la creazione della vaccinazione: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasError = (field) => touched[field] && errors[field];

  return (
    <FormModal
      title="Nuova Vaccinazione"
      onClose={onClose}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      submitLabel="Crea Vaccinazione"
      cancelLabel="Annulla"
      submitError={submitError}
    >
      <form onSubmit={handleSubmit} className="vaccinazione-create-form">
        {animaleNome && (
          <div className="form-group">
            <label>Animale</label>
            <div className="readonly-field">
              {animaleNome}
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="tipoVaccino">Tipo di Vaccino</label>
          <input
            type="text"
            id="tipoVaccino"
            name="tipoVaccino"
            value={formData.tipoVaccino}
            onChange={handleChange}
            placeholder="Es. Trivalente, Antirabbica, ecc."
            className={hasError('tipoVaccino') ? 'error' : ''}
            required
          />
          {hasError('tipoVaccino') && (
            <span className="error-message">{errors.tipoVaccino}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dataSomministrazione">Data Somministrazione</label>
            <input
              type="date"
              id="dataSomministrazione"
              name="dataSomministrazione"
              value={formData.dataSomministrazione}
              onChange={handleChange}
              className={hasError('dataSomministrazione') ? 'error' : ''}
              required
            />
            {hasError('dataSomministrazione') && (
              <span className="error-message">{errors.dataSomministrazione}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dataScadenza">Data Scadenza</label>
            <input
              type="date"
              id="dataScadenza"
              name="dataScadenza"
              value={formData.dataScadenza}
              onChange={handleChange}
              className={hasError('dataScadenza') ? 'error' : ''}
              required
            />
            {hasError('dataScadenza') && (
              <span className="error-message">{errors.dataScadenza}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="lotto">Lotto</label>
          <input
            type="text"
            id="lotto"
            name="lotto"
            value={formData.lotto}
            onChange={handleChange}
            placeholder="Numero di lotto"
            className={hasError('lotto') ? 'error' : ''}
            required
          />
          {hasError('lotto') && (
            <span className="error-message">{errors.lotto}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="note">Note</label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Note aggiuntive sulla vaccinazione"
            rows={3}
          />
        </div>
      </form>
    </FormModal>
  );
};

export default VaccinazioneCreateModal;