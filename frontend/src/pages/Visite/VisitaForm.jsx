import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../services/apiService';
import { formatDate, toISODatetimeFormat, toISODateFormat } from '../../utils/dateUtils';
import { validateRequired, validatePositiveNumber } from '../../utils/validationUtils';

// ==============================
// ICONE SVG (invariate)
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
// MODALE DI CONFERMA (personalizzato)
// ==============================
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Conferma</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Annulla</button>
          <button className="btn btn-primary" onClick={onConfirm}>Conferma</button>
        </div>
      </div>
    </div>
  );
};

// ==============================
// COMPONENTE PRINCIPALE
// ==============================
function VisitaForm({ visita, animale, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState(() => prepareVisitaData(visita));
  const [defaultDataPrenotazione, setDefaultDataPrenotazione] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  // ----- Preparazione dati (modifica) -----
  function prepareVisitaData(visitaData) {
    if (!visitaData) return getDefaultVisita();
    
    const converted = { ...visitaData };
    
    if (visitaData.dataOraVisita) {
      converted.dataOraVisita = toISODatetimeFormat(visitaData.dataOraVisita);
    }
    
    // Calcola la fine se presente la durata, altrimenti la impostiamo uguale all'inizio
    if (visitaData.dataOraVisita && visitaData.durata && visitaData.durata > 0) {
      const start = new Date(visitaData.dataOraVisita);
      const end = new Date(start.getTime() + visitaData.durata * 60 * 1000);
      converted.dataOraFine = toISODatetimeFormat(end.toISOString());
    } else if (visitaData.dataOraVisita) {
      // Se non c'è durata, fine = inizio (default)
      converted.dataOraFine = toISODatetimeFormat(visitaData.dataOraVisita);
    } else {
      converted.dataOraFine = '';
    }
    
    return converted;
  }

  // ----- Valori di default per nuova visita -----
  function getDefaultVisita() {
    const now = new Date();
    const nowStr = now.toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(' ', 'T');

    return {
      id: null,
      dataOraVisita: nowStr,   // inizio
      dataOraFine: nowStr,     // fine = inizio (default)
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

  useEffect(() => {
    if (visita) {
      const prepared = prepareVisitaData(visita);
      setFormData(prepared);
      setDefaultDataPrenotazione(prepared.dataOraVisita || '');
    } else {
      setFormData(getDefaultVisita());
      setDefaultDataPrenotazione('');
    }
  }, [visita]);

  // ----- Calcolo durata -----
  const calcolaDurata = (inizio, fine) => {
    if (!inizio || !fine) return 0;
    const start = new Date(inizio);
    const end = new Date(fine);
    const diffMs = end - start;
    if (diffMs <= 0) return 0;
    return Math.round(diffMs / (1000 * 60)); // minuti
  };

  // ----- Gestione cambiamenti -----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'dataOraVisita' || name === 'dataOraFine') {
        const durata = calcolaDurata(
          name === 'dataOraVisita' ? value : prev.dataOraVisita,
          name === 'dataOraFine' ? value : prev.dataOraFine
        );
        updated.durata = durata;
      }
      return updated;
    });
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Gestione data/ora separati
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name.replace('Date', '');
    setFormData(prev => {
      const currentDatetime = prev[fieldName] || `${value}T00:00`;
      const [, timePart] = currentDatetime.split('T');
      const newDatetime = `${value}T${timePart || '00:00'}`;
      const updated = { ...prev, [fieldName]: newDatetime };
      if (prev.dataOraVisita && prev.dataOraFine) {
        updated.durata = calcolaDurata(updated.dataOraVisita, updated.dataOraFine);
      }
      return updated;
    });
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name.replace('Time', '');
    setFormData(prev => {
      const currentDatetime = prev[fieldName] || `1970-01-01T${value}`;
      const [datePart] = currentDatetime.split('T');
      const newDatetime = `${datePart}T${value}`;
      const updated = { ...prev, [fieldName]: newDatetime };
      if (prev.dataOraVisita && prev.dataOraFine) {
        updated.durata = calcolaDurata(updated.dataOraVisita, updated.dataOraFine);
      }
      return updated;
    });
  };

  // Pulsanti "Ora"
  const setOraCorrenteInizio = () => {
    const now = new Date();
    const nowStr = now.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');
    setFormData(prev => {
      const updated = { ...prev, dataOraVisita: nowStr };
      if (prev.dataOraFine) {
        updated.durata = calcolaDurata(updated.dataOraVisita, updated.dataOraFine);
      }
      return updated;
    });
  };

  const setOraCorrenteFine = () => {
    const now = new Date();
    const nowStr = now.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');
    setFormData(prev => {
      const updated = { ...prev, dataOraFine: nowStr };
      if (prev.dataOraVisita) {
        updated.durata = calcolaDurata(updated.dataOraVisita, updated.dataOraFine);
      }
      return updated;
    });
  };

  // Validazione
  const validateField = (name, value) => {
    switch (name) {
      case 'dataOraVisita':
        return validateRequired(value, 'Data e ora inizio');
      case 'tipoVisita':
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.dataOraVisita) newErrors.dataOraVisita = 'Data e ora inizio obbligatoria';
    if (formData.tipoVisita === 'Altro' && !formData.altroTipoVisita?.trim()) {
      newErrors.altroTipoVisita = 'Specifica il tipo di visita';
    }
    // Se la fine è anteriore all'inizio → errore
    if (formData.dataOraVisita && formData.dataOraFine) {
      const start = new Date(formData.dataOraVisita);
      const end = new Date(formData.dataOraFine);
      if (end < start) {
        newErrors.dataOraFine = 'La fine non può essere precedente all\'inizio';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvataggio
  const saveVisita = async (endTimeToUse) => {
    try {
      let finalEnd = endTimeToUse || formData.dataOraFine;
      let finalStart = formData.dataOraVisita;

      if (!finalEnd) {
        const now = new Date();
        finalEnd = now.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');
      }

      const durataFinale = calcolaDurata(finalStart, finalEnd);

      const visitaData = {
        dataOraVisita: toISODatetimeFormat(finalStart),
        durata: durataFinale,
        tipoVisita: formData.tipoVisita === 'Altro' ? formData.altroTipoVisita : formData.tipoVisita,
        importoTotale: 0.00,
        prenotazioneId: null,
        sintomi: formData.sintomi,
        diagnosi: formData.diagnosi,
        trattamentoTerapia: formData.trattamentoTerapia,
        note: formData.note,
        notePrivate: formData.notePrivate
      };

      await onSave(visitaData);
    } catch (error) {
      console.error('Error saving visita:', error);
      setFormError(error.message || 'Errore durante il salvataggio della visita');
    }
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const allTouched = {};
    ['dataOraVisita', 'tipoVisita', 'dataOraFine'].forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validazione base (controlla se fine < inizio)
    if (!validateForm()) return;

    // Caso particolare: nuova visita e fine == inizio
    if (!formData.id && formData.dataOraFine === formData.dataOraVisita) {
      const now = new Date();
      const nowStr = now.toLocaleString('it-IT', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
      const message = `La data/ora fine è uguale all'inizio. Vuoi impostarla all'ora corrente (${nowStr})?`;
      setShowConfirmModal(true);
      setPendingSave(now.toISOString());
      return;
    }

    // Altrimenti salva direttamente
    saveVisita();
  };

  const handleConfirmModal = () => {
    setShowConfirmModal(false);
    const now = new Date();
    const nowStr = now.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');
    setFormData(prev => ({
      ...prev,
      dataOraFine: nowStr,
      durata: calcolaDurata(prev.dataOraVisita, nowStr)
    }));
    saveVisita(nowStr);
  };

  const handleCancelModal = () => {
    setShowConfirmModal(false);
    setPendingSave(false);
  };

  // ----- Render -----
  const hasError = (field) => touched[field] && errors[field];
  const showAltroTipo = formData.tipoVisita === 'Altro';
  const getButtonText = () => {
    if (isSaving) return 'Salvataggio...';
    return formData.id ? 'Salva Visita' : 'Crea Visita';
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
          <span className="visite-durata">Durata: {formData.durata || 0} min</span>
        </div>
        <div className="visite-card-body">
          <form onSubmit={handleSubmit} className="visite-form">

            {/* ===== INIZIO ===== */}
            <div className="visite-form-group">
              <label className="visite-form-label">Data e ora inizio *</label>
              <div className="visite-datetime-wrapper">
                <input
                  type="date"
                  name="dataOraVisitaDate"
                  className={`visite-form-control ${hasError('dataOraVisita') ? 'is-invalid' : ''}`}
                  value={formData.dataOraVisita ? formData.dataOraVisita.split('T')[0] : ''}
                  onChange={handleDateChange}
                  onBlur={() => setTouched(prev => ({ ...prev, dataOraVisita: true }))}
                  required
                />
                <input
                  type="time"
                  name="dataOraVisitaTime"
                  className={`visite-form-control ${hasError('dataOraVisita') ? 'is-invalid' : ''}`}
                  value={formData.dataOraVisita ? formData.dataOraVisita.split('T')[1].substring(0, 5) : ''}
                  onChange={handleTimeChange}
                  onBlur={() => setTouched(prev => ({ ...prev, dataOraVisita: true }))}
                  required
                  step="60"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={setOraCorrenteInizio}
                >
                  ⏱ Ora
                </button>
              </div>
              {hasError('dataOraVisita') && <div className="form-error">{errors.dataOraVisita}</div>}
            </div>

            {/* ===== FINE (ORA VISIBILE E PRECOMPILATA) ===== */}
            <div className="visite-form-group" style={{ marginTop: 'var(--space-2)' }}>
              <label className="visite-form-label">Data e ora fine</label>
              <div className="visite-datetime-wrapper">
                <input
                  type="date"
                  name="dataOraFineDate"
                  className={`visite-form-control ${hasError('dataOraFine') ? 'is-invalid' : ''}`}
                  value={formData.dataOraFine ? formData.dataOraFine.split('T')[0] : ''}
                  onChange={handleDateChange}
                  onBlur={() => setTouched(prev => ({ ...prev, dataOraFine: true }))}
                />
                <input
                  type="time"
                  name="dataOraFineTime"
                  className={`visite-form-control ${hasError('dataOraFine') ? 'is-invalid' : ''}`}
                  value={formData.dataOraFine ? formData.dataOraFine.split('T')[1].substring(0, 5) : ''}
                  onChange={handleTimeChange}
                  onBlur={() => setTouched(prev => ({ ...prev, dataOraFine: true }))}
                  step="60"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={setOraCorrenteFine}
                >
                  ⏱ Ora
                </button>
              </div>
              {hasError('dataOraFine') && <div className="form-error">{errors.dataOraFine}</div>}
              {!formData.id && formData.dataOraFine === formData.dataOraVisita && (
                <div className="visite-form-hint">
                  La fine è uguale all'inizio. Al salvataggio potrai scegliere se impostarla all'ora corrente.
                </div>
              )}
            </div>

            {/* ===== TIPO VISITA ===== */}
            <div className="visite-form-group" style={{ marginTop: 'var(--space-3)' }}>
              <label className="visite-form-label">Tipo Visita</label>
              <select
                name="tipoVisita"
                className={`visite-form-control ${hasError('tipoVisita') ? 'is-invalid' : ''}`}
                value={formData.tipoVisita || ''}
                onChange={handleChange}
                onBlur={() => setTouched(prev => ({ ...prev, tipoVisita: true }))}
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
                  onBlur={() => setTouched(prev => ({ ...prev, altroTipoVisita: true }))}
                  placeholder="Inserisci il tipo di visita..."
                />
                {hasError('altroTipoVisita') && <div className="form-error">{errors.altroTipoVisita}</div>}
              </div>
            )}

            {/* ===== REFERTO CLINICO ===== */}
            <div className="visite-divider"><span>Referto Clinico</span></div>
            <div className="visite-form-group">
              <label className="visite-form-label">Sintomi</label>
              <textarea name="sintomi" className="visite-form-control visite-form-textarea" rows="3" value={formData.sintomi || ''} onChange={handleChange} placeholder="Descrivi i sintomi riportati..." />
            </div>
            <div className="visite-form-group">
              <label className="visite-form-label">Diagnosi</label>
              <textarea name="diagnosi" className="visite-form-control visite-form-textarea" rows="3" value={formData.diagnosi || ''} onChange={handleChange} placeholder="Inserisci la diagnosi..." />
            </div>
            <div className="visite-form-group">
              <label className="visite-form-label">Trattamento / Terapia</label>
              <textarea name="trattamentoTerapia" className="visite-form-control visite-form-textarea" rows="3" value={formData.trattamentoTerapia || ''} onChange={handleChange} placeholder="Indica il trattamento prescritto..." />
            </div>
            <div className="visite-form-group">
              <label className="visite-form-label">Note</label>
              <textarea name="note" className="visite-form-control visite-form-textarea" rows="2" value={formData.note || ''} onChange={handleChange} placeholder="Note aggiuntive (visibili al proprietario)..." />
            </div>
            <div className="visite-form-group">
              <label className="visite-form-label">Note Private</label>
              <textarea name="notePrivate" className="visite-form-control visite-form-textarea" rows="2" value={formData.notePrivate || ''} onChange={handleChange} placeholder="Note riservate al veterinario..." />
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

      {/* Modale di conferma */}
      <ConfirmModal
        isOpen={showConfirmModal}
        message="La data/ora fine è uguale all'inizio. Vuoi impostarla all'ora corrente?"
        onConfirm={handleConfirmModal}
        onCancel={handleCancelModal}
      />
    </div>
  );
}

export default VisitaForm;