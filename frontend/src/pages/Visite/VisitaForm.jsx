import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../services/apiService';
import { formatDate, toISODatetimeFormat, toISODateFormat } from '../../utils/dateUtils';
import { validateRequired, validatePositiveNumber } from '../../utils/validationUtils';

// ==============================
// ICONE SVG
// ==============================
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="2"/>
    <path d="M12 8V16M8 12H16" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="5" r="3" stroke="var(--gray-600)" strokeWidth="2"/>
    <circle cx="6" cy="12" r="3" stroke="var(--gray-600)" strokeWidth="2"/>
    <circle cx="18" cy="19" r="3" stroke="var(--gray-600)" strokeWidth="2"/>
    <path d="M8.59 13.51L15.42 17.49" stroke="var(--gray-600)" strokeWidth="2"/>
    <path d="M15.41 6.51L8.59 10.49" stroke="var(--gray-600)" strokeWidth="2"/>
  </svg>
);

const LightningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

// ==============================
// COMPONENTE
// ==============================
function VisitaForm({ visita, animale, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState(() => prepareVisitaData(visita));
  const [defaultDataPrenotazione, setDefaultDataPrenotazione] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');

  // Parse datetime into separate date and time components
  const parseDatetime = (datetimeStr) => {
    if (!datetimeStr) return { date: '', time: '' };
    
    const dateObj = new Date(datetimeStr);
    if (isNaN(dateObj.getTime())) return { date: '', time: '' };
    
    const date = dateObj.toISOString().split('T')[0];
    const time = dateObj.toTimeString().substring(0, 5);
    
    return { date, time };
  };

  // Prepare visita data by converting Italian dates to ISO format
  function prepareVisitaData(visitaData) {
    if (!visitaData) return getDefaultVisita();
    
    // Convert any Italian date formats to ISO format
    const convertedData = { ...visitaData };
    
    if (visitaData.dataOraVisita) {
      convertedData.dataOraVisita = toISODatetimeFormat(visitaData.dataOraVisita);
      // Set visitStart to dataOraVisita from DTO
      convertedData.visitStart = toISODatetimeFormat(visitaData.dataOraVisita);
    }
    
    return convertedData;
  }

  // Validazione campo singolo
  const validateField = (name, value) => {
    switch (name) {
      case 'dataOraVisita':
        return validateRequired(value, 'Data e ora visita');
      case 'visitStart':
        return validateRequired(value, 'Data inizio');
      case 'tipoVisita':
        return ''; // Tipo visita is not required

      case 'durata':
        return '';
      case 'altroTipoVisita':
        if (formData.tipoVisita === 'Altro' && !value.trim()) {
          return 'Specifica il tipo di visita';
        }
        return '';
      default:
        return '';
    }
  };

  // Validate that end time is after start time
  const validateTimeOrder = () => {
    if (!formData.visitStart || !formData.dataOraVisita) return '';
    
    const startDate = new Date(formData.visitStart);
    const endDate = new Date(formData.dataOraVisita);
    
    if (endDate <= startDate) {
      return 'L\'ora di fine deve essere successiva all\'ora di inizio';
    }
    
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = ['dataOraVisita', 'visitStart'];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    // Validate altroTipoVisita if tipoVisita is "Altro"
    if (formData.tipoVisita === 'Altro') {
      const error = validateField('altroTipoVisita', formData.altroTipoVisita);
      if (error) newErrors.altroTipoVisita = error;
    }
    
    // Validate time order
    const timeOrderError = validateTimeOrder();
    if (timeOrderError) {
      newErrors.dataOraVisita = timeOrderError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (visita) {
      const preparedData = prepareVisitaData(visita);
      setFormData(preparedData);
      setDefaultDataPrenotazione(preparedData.dataOraVisita || '');
    } else {
      // Set default values for new visita
      const now = new Date();
      const nowStr = now.toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(' ', 'T');
      
      // Set end time to be 1 hour after start time by default
      const endTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
      const endStr = endTime.toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(' ', 'T');
      
      const defaultData = getDefaultVisita(nowStr);
      defaultData.dataOraVisita = endStr;
      
      setFormData(defaultData);
      setDefaultDataPrenotazione(nowStr);
    }
  }, [visita]);

  function getDefaultVisita(nowStr) {
    const now = nowStr || new Date().toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(' ', 'T');

    return {
      id: null,
      dataOraVisita: now,
      visitStart: now, // Initialize visitStart with current date/time for new visits
      durata: 0,
      tipoVisita: '',
      altroTipoVisita: '',
      sintomi: '',
      diagnosi: '',
      trattamentoTerapia: '',
      note: '',
      notePrivate: ''
    };
  }

  // Imposta data/ora inizio corrente (pulsante "Adesso")
  const setOraCorrenteInizio = () => {
    const now = new Date();
    const nowStr = now.toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(' ', 'T');
    
    setFormData(prev => ({
      ...prev, 
      visitStart: nowStr
    }));
  };

  // Imposta data/ora fine corrente (pulsante "Adesso")
  const setOraCorrente = () => {
    const now = new Date();
    const nowStr = now.toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(' ', 'T');
    
    // Calculate duration based on the difference between start and current time
    const durataCalcolata = calcolaDurata(formData.visitStart, nowStr);
    
    setFormData(prev => ({
      ...prev, 
      dataOraVisita: nowStr,
      durata: durataCalcolata
    }));
  };

  // Resetta la data di prenotazione al valore di default
  const resetDataPrenotazione = () => {
    if (defaultDataPrenotazione) {
      setFormData(prev => ({ ...prev, visitStart: defaultDataPrenotazione }));
    }
  };

  // Calcola automaticamente la durata quando cambiano visitStart o dataOraVisita
  const calcolaDurata = (dataInizio, dataFine) => {
    if (!dataInizio || !dataFine) return 0;
    const start = new Date(dataInizio);
    const end = new Date(dataFine);
    const diffMs = end - start;
    if (diffMs <= 0) return 0;
    return Math.round(diffMs / (1000 * 60)); // minuti
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Se cambia visitStart o dataOraVisita, ricalcola la durata
      if (name === 'visitStart' || name === 'dataOraVisita') {
        const durata = calcolaDurata(
          name === 'visitStart' ? value : prev.visitStart,
          name === 'dataOraVisita' ? value : prev.dataOraVisita
        );
        updated.durata = durata;
      }
      
      return updated;
    });
    
    // Validate field on change if already touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle date changes (for date inputs)
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name.replace('Date', '');
    
    setFormData(prev => {
      const currentDatetime = prev[fieldName] || `${value}T00:00`;
      const [, timePart] = currentDatetime.split('T');
      const newDatetime = `${value}T${timePart || '00:00'}`;
      
      const updated = { ...prev, [fieldName]: newDatetime };
      
      // Recalculate duration if both start and end dates are set
      if (prev.visitStart && prev.dataOraVisita) {
        const durata = calcolaDurata(
          fieldName === 'visitStart' ? newDatetime : prev.visitStart,
          fieldName === 'dataOraVisita' ? newDatetime : prev.dataOraVisita
        );
        updated.durata = durata;
      }
      
      return updated;
    });
    
    // Validate field on change if already touched
    if (touched[name]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  // Handle time changes (for time inputs)
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name.replace('Time', '');
    
    setFormData(prev => {
      const currentDatetime = prev[fieldName] || `1970-01-01T${value}`;
      const [datePart] = currentDatetime.split('T');
      const newDatetime = `${datePart}T${value}`;
      
      const updated = { ...prev, [fieldName]: newDatetime };
      
      // Recalculate duration if both start and end times are set
      if (prev.visitStart && prev.dataOraVisita) {
        const durata = calcolaDurata(
          fieldName === 'visitStart' ? newDatetime : prev.visitStart,
          fieldName === 'dataOraVisita' ? newDatetime : prev.dataOraVisita
        );
        updated.durata = durata;
      }
      
      return updated;
    });
    
    // Validate field on change if already touched
    if (touched[name]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldName = name.includes('Date') || name.includes('Time') ? name.replace(/Date$/, '').replace(/Time$/, '') : name;
    
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const fieldValue = value;
    const error = validateField(fieldName, fieldValue);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure same day by default if dates are different
    setFormData(prev => {
      if (prev.visitStart && prev.dataOraVisita) {
        const startDate = prev.visitStart.split('T')[0];
        const endDate = prev.dataOraVisita.split('T')[0];
        
        if (startDate !== endDate) {
          // Make end date same as start date
          const endTime = prev.dataOraVisita.split('T')[1];
          return {
            ...prev,
            dataOraVisita: `${startDate}T${endTime}`
          };
        }
      }
      return prev;
    });
    
    // Mark all fields as touched
    const allTouched = {};
    ['visitStart', 'dataOraVisita', 'tipoVisita', 'durata'].forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
    if (validateForm()) {
      saveVisita();
    }
  };

  const saveVisita = async () => {
    try {
      const visitaData = {
        dataOraVisita: toISODatetimeFormat(formData.visitStart), // Use visitStart as dataOraVisita
        durata: formData.durata,
        tipoVisita: formData.tipoVisita === 'Altro' ? formData.altroTipoVisita : formData.tipoVisita,
        importoTotale: 0, // Default importoTotale as required by backend
        prenotazioneId: null, // Optional prenotazioneId
        sintomi: formData.sintomi,
        diagnosi: formData.diagnosi,
        trattamentoTerapia: formData.trattamentoTerapia,
        note: formData.note,
        notePrivate: formData.notePrivate
      };
      
      // Call the onSave callback which should handle the actual API call
      await onSave(visitaData);
      
    } catch (error) {
      console.error('Error saving visita:', error);
      setFormError(error.message || 'Errore durante il salvataggio della visita');
    }
  };

  const hasError = (field) => touched[field] && errors[field];
  
  const showAltroTipo = formData.tipoVisita === 'Altro';

  // Determina il testo del pulsante di salvataggio
  const getButtonText = () => {
    if (isSaving) return 'Salvataggio...';
    if (formData.id) return 'Salva Visita';
    if (!formData.id) return 'Crea Visita';
    return 'Salva Visita';
  };

  return (
    <div className="visite-colonna-center">
      <div className="visite-card">
        <div className="visite-card-header">
          <div className="visite-header-left">
            <h3>
              {formData.id ? `Visita del ${formatDate(formData.dataOraVisita)}` : 'Nuova Visita'}
            </h3>
            {formData.tipoVisita && formData.tipoVisita !== 'Altro' && (
              <span className="visite-badge-tipo">{formData.tipoVisita}</span>
            )}
            {formData.tipoVisita === 'Altro' && formData.altroTipoVisita && (
              <span className="visite-badge-tipo">{formData.altroTipoVisita}</span>
            )}
          </div>
          <span className="visite-durata">Durata: {formData.durata || '0'} min</span>
        </div>
        <div className="visite-card-body">
          <form onSubmit={handleSubmit} className="visite-form">

            {/* Blocco Data e Ora - separati in data e ora */}
            <div className="visite-datetime-group">

              {/* Data Inizio */}
              <div className="visite-form-group">
                <label className="visite-form-label">Data inizio *</label>
                <div className="visite-datetime-wrapper">
                  <input
                    type="date"
                    name="visitStartDate"
                    className={`visite-form-control ${hasError('visitStart') ? 'is-invalid' : ''}`}
                    value={formData.visitStart ? formData.visitStart.split('T')[0] : ''}
                    onChange={handleDateChange}
                    onBlur={handleBlur}
                    required
                    style={{ minWidth: '150px' }}
                  />
                  <input
                    type="time"
                    name="visitStartTime"
                    className={`visite-form-control ${hasError('visitStart') ? 'is-invalid' : ''}`}
                    value={formData.visitStart ? formData.visitStart.split('T')[1].substring(0, 5) : ''}
                    onChange={handleTimeChange}
                    onBlur={handleBlur}
                    required
                    step="60"
                    style={{ minWidth: '120px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setOraCorrenteInizio()}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    ⏱ Adesso
                  </button>
                </div>
                {hasError('visitStart') && <div className="form-error">{errors.visitStart}</div>}
              </div>

              {/* Data e Ora Fine */}
              <div className="visite-form-group" style={{ marginTop: 'var(--space-2)' }}>
                <label className="visite-form-label">Data e Ora Fine *</label>
                <div className="visite-datetime-wrapper">
                  <input
                    type="date"
                    name="dataOraVisitaDate"
                    className={`visite-form-control ${hasError('dataOraVisita') ? 'is-invalid' : ''}`}
                    value={formData.dataOraVisita ? formData.dataOraVisita.split('T')[0] : ''}
                    onChange={handleDateChange}
                    onBlur={handleBlur}
                    required
                    style={{ minWidth: '150px' }}
                  />
                  <input
                    type="time"
                    name="dataOraVisitaTime"
                    className={`visite-form-control ${hasError('dataOraVisita') ? 'is-invalid' : ''}`}
                    value={formData.dataOraVisita ? formData.dataOraVisita.split('T')[1].substring(0, 5) : ''}
                    onChange={handleTimeChange}
                    onBlur={handleBlur}
                    required
                    step="60"
                    style={{ minWidth: '120px' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={setOraCorrente}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    ⏱ Adesso
                  </button>
                </div>
                {hasError('dataOraVisita') && <div className="form-error">{errors.dataOraVisita}</div>}
              </div>

            </div>

            <div className="visite-form-group" style={{ marginTop: 'var(--space-3)' }}>
              <label className="visite-form-label">Tipo Visita *</label>
              <select
                name="tipoVisita"
                className={`visite-form-control ${hasError('tipoVisita') ? 'is-invalid' : ''}`}
                value={formData.tipoVisita || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Seleziona tipo</option>
                <option value="Visita di controllo">Visita di controllo</option>
                <option value="Vaccinazione">Vaccinazione</option>
                <option value="Visita d'urgenza">Visita d'urgenza</option>
                <option value="Chirurgia">Chirurgia</option>
                <option value="Visita specialistica">Visita specialistica</option>
                <option value="Altro">Altro</option>
              </select>
              {hasError('tipoVisita') && <div className="form-error">{errors.tipoVisita}</div>}
            </div>

            {showAltroTipo && (
              <div className="visite-form-group">
                <label className="visite-form-label">Specifica tipo visita *</label>
                <input
                  type="text"
                  name="altroTipoVisita"
                  className={`visite-form-control ${hasError('altroTipoVisita') ? 'is-invalid' : ''}`}
                  value={formData.altroTipoVisita || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Inserisci il tipo di visita..."
                />
                {hasError('altroTipoVisita') && <div className="form-error">{errors.altroTipoVisita}</div>}
              </div>
            )}



            <div className="visite-divider">
              <span>Referto Clinico</span>
            </div>

            <div className="visite-form-group">
              <label className="visite-form-label">Sintomi</label>
              <textarea
                name="sintomi"
                className="visite-form-control visite-form-textarea"
                rows="3"
                value={formData.sintomi || ''}
                onChange={handleChange}
                placeholder="Descrivi i sintomi riportati..."
              />
            </div>

            <div className="visite-form-group">
              <label className="visite-form-label">Diagnosi</label>
              <textarea
                name="diagnosi"
                className="visite-form-control visite-form-textarea"
                rows="3"
                value={formData.diagnosi || ''}
                onChange={handleChange}
                placeholder="Inserisci la diagnosi..."
              />
            </div>

            <div className="visite-form-group">
              <label className="visite-form-label">Trattamento / Terapia</label>
              <textarea
                name="trattamentoTerapia"
                className="visite-form-control visite-form-textarea"
                rows="3"
                value={formData.trattamentoTerapia || ''}
                onChange={handleChange}
                placeholder="Indica il trattamento prescritto..."
              />
            </div>

            <div className="visite-form-group">
              <label className="visite-form-label">Note</label>
              <textarea
                name="note"
                className="visite-form-control visite-form-textarea"
                rows="2"
                value={formData.note || ''}
                onChange={handleChange}
                placeholder="Note aggiuntive (visibili al proprietario)..."
              />
            </div>

            <div className="visite-form-group">
              <label className="visite-form-label">Note Private</label>
              <textarea
                name="notePrivate"
                className="visite-form-control visite-form-textarea"
                rows="2"
                value={formData.notePrivate || ''}
                onChange={handleChange}
                placeholder="Note riservate al veterinario..."
              />
            </div>

            {formError && <div className="form-error" style={{ marginBottom: 'var(--space-2)' }}>{formError}</div>}

            <div className="visite-form-actions">
              <div className="visite-form-actions-left">
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {getButtonText()}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>


    </div>
  );
}

export default VisitaForm;