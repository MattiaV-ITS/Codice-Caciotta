import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../services/apiService';
import FormModal from '../FormModal/FormModal';
import './VaccinazioneEditModal.css';

const TIPI_VACCINO_SELECT = [
  'Trivalente',
  'Tetravalente',
  'Antirabbica',
  'Leishmaniosi',
  'Leucemia felina (FeLV)',
  'Cimurro',
  'Parvovirosi',
  'Epatite infettiva',
  'Tosse dei canili',
  'Altro'
];

const VaccinazioneEditModal = ({
  vaccinazione,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const { get, patch } = useApi();

  const [formData, setFormData] = useState({
    tipoVaccino: '',
    specificaTipoVaccino: '',
    dataSomministrazione: '',
    dataScadenza: '',
    lotto: '',
    note: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isLoadingDettaglio, setIsLoadingDettaglio] = useState(false);

  // Carica i dati completi della vaccinazione (la riga della lista non contiene "note")
  useEffect(() => {
    const fetchDettaglio = async () => {
      if (!vaccinazione?.id) return;

      setIsLoadingDettaglio(true);
      try {
        const response = await get(`/api/vaccinazioni/${vaccinazione.id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch vaccinazione: ${response.status}`);
        }
        const dettaglio = await response.json();

        const tipoEsistente = dettaglio.tipoVaccino || '';
        const isTipoNoto = TIPI_VACCINO_SELECT.includes(tipoEsistente);

        setFormData({
          tipoVaccino: isTipoNoto ? tipoEsistente : (tipoEsistente ? 'Altro' : ''),
          specificaTipoVaccino: isTipoNoto ? '' : tipoEsistente,
          dataSomministrazione: dettaglio.dataSomministrazione || '',
          dataScadenza: dettaglio.dataScadenza || '',
          lotto: dettaglio.lotto || '',
          note: dettaglio.note || ''
        });
      } catch (error) {
        console.error('Error fetching vaccinazione detail:', error);
        setSubmitError('Impossibile caricare i dettagli della vaccinazione');
      } finally {
        setIsLoadingDettaglio(false);
      }
    };

    fetchDettaglio();
  }, [vaccinazione, get]);

  const validate = () => {
    const newErrors = {};

    if (!formData.tipoVaccino) {
      newErrors.tipoVaccino = 'Il tipo di vaccino è obbligatorio';
    }

    if (formData.tipoVaccino === 'Altro' && !formData.specificaTipoVaccino) {
      newErrors.specificaTipoVaccino = 'Specifica il tipo di vaccino';
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
        tipoVaccino: formData.tipoVaccino === 'Altro' ? formData.specificaTipoVaccino : formData.tipoVaccino,
        dataSomministrazione: formData.dataSomministrazione,
        dataScadenza: formData.dataScadenza,
        lotto: formData.lotto,
        note: formData.note
      };

      const response = await patch(`/api/vaccinazioni/${vaccinazione.id}`, payload);

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

      const updatedVaccinazione = await response.json();
      onSuccess(updatedVaccinazione);
      onClose();

    } catch (error) {
      console.error('Error updating vaccinazione:', error);
      setSubmitError(`Errore durante l'aggiornamento della vaccinazione: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasError = (field) => touched[field] && errors[field];
  const showSpecificaTipo = formData.tipoVaccino === 'Altro';

  return (
    <FormModal
      title="Modifica Vaccinazione"
      onClose={onClose}
      isSubmitting={isSubmitting || isLoadingDettaglio}
      onSubmit={handleSubmit}
      submitLabel="Salva Modifiche"
      cancelLabel="Annulla"
      submitError={submitError}
    >
      <form onSubmit={handleSubmit} className="vaccinazione-edit-form">
        {vaccinazione?.nomeAnimale && (
          <div className="form-group">
            <label>Animale</label>
            <div className="readonly-field">
              {vaccinazione.nomeAnimale}
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="tipoVaccino">Tipo di Vaccino</label>
          <select
            id="tipoVaccino"
            name="tipoVaccino"
            value={formData.tipoVaccino}
            onChange={handleChange}
            className={hasError('tipoVaccino') ? 'error' : ''}
            required
          >
            <option value="">Seleziona tipo di vaccino</option>
            {TIPI_VACCINO_SELECT.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
          {hasError('tipoVaccino') && (
            <span className="error-message">{errors.tipoVaccino}</span>
          )}
        </div>

        {showSpecificaTipo && (
          <div className="form-group">
            <label htmlFor="specificaTipoVaccino">Specifica Tipo Vaccino</label>
            <input
              type="text"
              id="specificaTipoVaccino"
              name="specificaTipoVaccino"
              value={formData.specificaTipoVaccino}
              onChange={handleChange}
              placeholder="Es. Vaccino antiparassitario"
              className={hasError('specificaTipoVaccino') ? 'error' : ''}
            />
            {hasError('specificaTipoVaccino') && (
              <span className="error-message">{errors.specificaTipoVaccino}</span>
            )}
          </div>
        )}

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

export default VaccinazioneEditModal;