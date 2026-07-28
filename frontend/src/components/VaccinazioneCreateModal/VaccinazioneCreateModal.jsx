import React, { useState, useEffect } from 'react';
import { useApi } from '../../services/apiService';
import FormModal from '../FormModal/FormModal';
import './VaccinazioneCreateModal.css';

const VaccinazioneCreateModal = ({
  animaleId,
  animaleNome,
  initialTipoVaccino = '',
  onClose,
  onSuccess
}) => {
  const { post, get } = useApi();

  const [formData, setFormData] = useState({
    tipoVaccino: initialTipoVaccino || 'altro',
    dataSomministrazione: new Date().toISOString().split('T')[0],
    dataScadenza: '',
    lotto: '',
    note: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [tipiEsistenti, setTipiEsistenti] = useState([]);
  const [loadingTipi, setLoadingTipi] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.tipoVaccino) {
      newErrors.tipoVaccino = 'Il tipo di vaccino Ã¨ obbligatorio';
    }

    if (!formData.dataSomministrazione) {
      newErrors.dataSomministrazione = 'La data di somministrazione Ã¨ obbligatoria';
    }

    if (!formData.dataScadenza) {
      newErrors.dataScadenza = 'La data di scadenza Ã¨ obbligatoria';
    }

    if (
      formData.dataScadenza &&
      formData.dataSomministrazione &&
      formData.dataScadenza < formData.dataSomministrazione
    ) {
      newErrors.dataScadenza = 'La data di scadenza non puÃ² precedere la somministrazione';
    }

    if (!formData.lotto) {
      newErrors.lotto = 'Il numero di lotto Ã¨ obbligatorio';
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

    // Mark all fields as touched to show errors on submit
    setTouched({
      tipoVaccino: true,
      dataSomministrazione: true,
      dataScadenza: true,
      lotto: true,
      note: true
    });

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
      logger.error('Error creating vaccinazione:', error);
      setSubmitError(`Errore durante la creazione della vaccinazione: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasError = (field) => touched[field] && errors[field];

  useEffect(() => {
    let cancelled = false;
    const fetchTipi = async () => {
      if (!animaleId) return;
      try {
        setLoadingTipi(true);
        const response = await get('/api/vaccinazioni', {
          params: { animaleId, size: 200, page: 0 },
        });
        if (!cancelled && response.ok) {
          const data = await response.json();
          const list = Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data)
              ? data
              : [];
          const tipi = Array.from(new Set(list.map((v) => v.tipoVaccino).filter(Boolean)));
          setTipiEsistenti(tipi);
        }
      } catch {
        // ignore tipos fetch errors
      } finally {
        if (!cancelled) setLoadingTipi(false);
      }
    };
    fetchTipi();
    return () => { cancelled = true; };
  }, [animaleId, get]);

  const isTipoPersonalizzato = !tipiEsistenti.includes(formData.tipoVaccino);

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
          <label htmlFor="tipoVaccino">
            Tipo di Vaccino
            <span className="required-asterisk">*</span>
          </label>
          <select
            id="tipoVaccino"
            name="tipoVaccino"
            value={formData.tipoVaccino}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({ ...prev, tipoVaccino: value }));
              setTouched((prev) => ({ ...prev, tipoVaccino: true }));
            }}
            className={hasError('tipoVaccino') ? 'error' : ''}
            required
          >
            {tipiEsistenti.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
            <option value="altro">Altro (specifica)</option>
          </select>
          {hasError('tipoVaccino') && (
            <span className="error-message">{errors.tipoVaccino}</span>
          )}
        </div>

        {(!formData.tipoVaccino || isTipoPersonalizzato) && (
          <div className="form-group">
            <label htmlFor="tipoVaccino_custom">
              Specifica tipo vaccino
              {!formData.tipoVaccino && <span className="required-asterisk">*</span>}
            </label>
            <input
              type="text"
              id="tipoVaccino_custom"
              name="tipoVaccino_custom"
              value={isTipoPersonalizzato && formData.tipoVaccino !== 'altro' ? formData.tipoVaccino : ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({ ...prev, tipoVaccino: value }));
                setTouched((prev) => ({ ...prev, tipoVaccino: true }));
              }}
              placeholder="Es. Trivalente, Antirabbica, ecc."
              className={hasError('tipoVaccino') ? 'error' : ''}
              required={!formData.tipoVaccino}
            />
            {hasError('tipoVaccino') && (
              <span className="error-message">{errors.tipoVaccino}</span>
            )}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dataSomministrazione">
              Data Somministrazione
              <span className="required-asterisk">*</span>
            </label>
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
            <label htmlFor="dataScadenza">
              Data Scadenza
              <span className="required-asterisk">*</span>
            </label>
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
          <label htmlFor="lotto">
            Lotto
            <span className="required-asterisk">*</span>
          </label>
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
