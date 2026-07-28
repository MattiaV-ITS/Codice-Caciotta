import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../services/apiService';
import { formatDate, getCurrentISODatetime, parseDate, toISODatetimeFormat, toISODateFormat } from '../../utils/dateUtils';
import { validateRequired, validatePositiveNumber } from '../../utils/validationUtils';
import FatturaSemplificataModal from '../../components/FatturaSemplificataModal';
import { PlusIcon, InvoiceIcon } from '../../components/icons';

// Inline styles for edit mode banner
const bannerStyles = `
  .visite-edit-mode-banner {
    padding: var(--space-2) var(--space-3);
    margin-bottom: var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--font-sm);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .visite-edit-mode-banner.read-only-mode {
    background-color: var(--gray-50);
    color: var(--gray-700);
    border: 1px solid var(--gray-200);
  }
  .visite-edit-mode-banner.edit-mode {
    background-color: var(--primary-light);
    color: var(--primary-dark);
    border: 1px solid var(--primary);
  }
  .visite-edit-mode-banner svg {
    width: 16px;
    height: 16px;
  }
`;

function getDefaultVisita() {
  const nowStr = getCurrentISODatetime();

  return {
    id: null,
    dataOraVisita: nowStr,
    dataOraFine: nowStr,
    tipoVisita: '',
    altroTipoVisita: '',
    sintomi: '',
    diagnosi: '',
    trattamentoTerapia: '',
    note: '',
    notePrivate: ''
  };
}

function prepareVisitaData(visitaData) {
  if (!visitaData) return getDefaultVisita();
  
  const converted = { ...visitaData };
  const normalizedStart = toISODatetimeFormat(visitaData.dataOraVisita);
  
  if (normalizedStart) {
    converted.dataOraVisita = normalizedStart;
  }
  
  if (visitaData.dataOraFineVisita) {
    converted.dataOraFine = toISODatetimeFormat(visitaData.dataOraFineVisita);
  } else if (normalizedStart && visitaData.durata && visitaData.durata > 0) {
    const start = parseDate(normalizedStart);
    if (start && !isNaN(start.getTime())) {
      const end = new Date(start.getTime() + visitaData.durata * 60 * 1000);
      if (!isNaN(end.getTime())) {
        converted.dataOraFine = formatLocalDateTime(end);
      } else {
        converted.dataOraFine = normalizedStart;
      }
    } else {
      converted.dataOraFine = normalizedStart;
    }
  } else if (normalizedStart) {
    converted.dataOraFine = normalizedStart;
  } else {
    converted.dataOraFine = '';
  }
  
  return converted;
}

const formatLocalDateTime = (date) => {
  if (!date || isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

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
function VisitaForm({ visita, animale, proprietario, onSave, onCancel, isSaving, initialEditMode = false }) {
  const api = useApi();
  const [formData, setFormData] = useState(() => prepareVisitaData(visita));
  const [defaultDataPrenotazione, setDefaultDataPrenotazione] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formError, setFormError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [editMode, setEditMode] = useState(initialEditMode);
  const [showFatturaModal, setShowFatturaModal] = useState(false);
  const [fatturaSuccess, setFatturaSuccess] = useState(false);
  const [fatturaEsistente, setFatturaEsistente] = useState(false);
  const [fatturaData, setFatturaData] = useState(null);
  const [prestazioni, setPrestazioni] = useState([]);
  const [loadingPrestazioni, setLoadingPrestazioni] = useState(true);
  const [errorPrestazioni, setErrorPrestazioni] = useState(null);
  const [visitaId, setVisitaId] = useState(null);
  const [togglingPagamento, setTogglingPagamento] = useState(false);

  const availablePrestazioni = Array.isArray(prestazioni)
    ? prestazioni.filter(p => p.stato === true)
    : [];

  useEffect(() => {
    if (visita) {
      const prepared = prepareVisitaData(visita);
      setFormData(prepared);
      setDefaultDataPrenotazione(prepared.dataOraVisita || '');
      setVisitaId(visita.id || null);
    } else {
      setFormData(getDefaultVisita());
      setDefaultDataPrenotazione('');
      setVisitaId(null);
    }
  }, [visita]);

  // Fetch prestazioni for dynamic visit type options
  useEffect(() => {
    let cancelled = false;
    const fetchPrestazioni = async () => {
      try {
        setLoadingPrestazioni(true);
        const response = await api.get('/api/prestazioni');
        if (!cancelled && response.ok) {
          const data = await response.json();
          const prestazioniArray = Array.isArray(data)
            ? data
            : (data.content && Array.isArray(data.content)
                ? data.content
                : []);
          setPrestazioni(prestazioniArray);
        }
      } catch (error) {
        if (!cancelled) {
          logger.error('Error fetching prestazioni:', error);
          setErrorPrestazioni('Errore nel caricamento delle prestazioni');
        }
      } finally {
        if (!cancelled) {
          setLoadingPrestazioni(false);
        }
      }
    };

    fetchPrestazioni();
    return () => { cancelled = true; };
  }, []);

  // Fetch fattura data for this visita
  useEffect(() => {
    let cancelled = false;
    const fetchFatturaData = async () => {
      if (visitaId) {
        try {
          const response = await api.get(`/api/fatture/visita/${visitaId}`);
          if (!cancelled) {
            if (response.ok) {
              const data = await response.json();
              if (data && data.length > 0) {
                setFatturaEsistente(true);
                setFatturaData(data[0]);
              } else {
                setFatturaEsistente(false);
                setFatturaData(null);
              }
            } else {
              setFatturaEsistente(false);
              setFatturaData(null);
            }
          }
        } catch (error) {
          if (!cancelled) {
            logger.error('Error fetching fattura data:', error);
            setFatturaEsistente(false);
            setFatturaData(null);
          }
        }
      } else {
        setFatturaEsistente(false);
        setFatturaData(null);
      }
    };

    fetchFatturaData();
    return () => { cancelled = true; };
  }, [visitaId]);

  // ----- Calcolo durata -----
  const calcolaDurata = (inizio, fine) => {
    if (!inizio || !fine) return 0;
    const start = new Date(inizio);
    const end = new Date(fine);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
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
      const currentDatetime = prev[fieldName] || '';
      let timePart = '00:00';
      
      // Safely extract time part from existing datetime
      if (currentDatetime && currentDatetime.includes('T')) {
        const parts = currentDatetime.split('T');
        if (parts.length === 2 && parts[1]) {
          timePart = parts[1].split(':').slice(0, 2).join(':'); // Get only HH:MM
        }
      }
      
      const newDatetime = `${value}T${timePart}`;
      const updated = { ...prev, [fieldName]: newDatetime };
      if (updated.dataOraVisita && updated.dataOraFine) {
        updated.durata = calcolaDurata(updated.dataOraVisita, updated.dataOraFine);
      }
      return updated;
    });
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name.replace('Time', '');
    setFormData(prev => {
      const currentDatetime = prev[fieldName] || '';
      let datePart = getCurrentISODatetime().split('T')[0]; // Default to today in local time
      
      // Safely extract date part from existing datetime
      if (currentDatetime && currentDatetime.includes('T')) {
        const parts = currentDatetime.split('T');
        if (parts.length === 2 && parts[0]) {
          datePart = parts[0];
        }
      } else if (currentDatetime) {
        // Handle case where datetime might be just a date
        datePart = currentDatetime;
      }
      
      const newDatetime = `${datePart}T${value}`;
      const updated = { ...prev, [fieldName]: newDatetime };
      if (updated.dataOraVisita && updated.dataOraFine) {
        updated.durata = calcolaDurata(updated.dataOraVisita, updated.dataOraFine);
      }
      return updated;
    });
  };

  // Pulsanti "Ora"
  const setOraCorrenteInizio = useCallback(() => {
    const nowStr = getCurrentISODatetime();
    setFormData(prev => {
      const updated = { ...prev, dataOraVisita: nowStr };
      if (prev.dataOraFine) {
        updated.durata = calcolaDurata(updated.dataOraVisita, updated.dataOraFine);
      }
      return updated;
    });
  }, []);

  const setCurrentTimeEnd = useCallback(() => {
    const nowStr = getCurrentISODatetime();
    setFormData(prev => {
      const updated = { ...prev, dataOraFine: nowStr };
      if (prev.dataOraVisita) {
        updated.durata = calcolaDurata(updated.dataOraVisita, updated.dataOraFine);
      }
      return updated;
    });
  }, []);

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
    // Se la fine è anteriore all'inizio ←’ errore
    if (formData.dataOraVisita && formData.dataOraFine) {
      const start = new Date(formData.dataOraVisita);
      const end = new Date(formData.dataOraFine);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
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

      // Only use current time if both start and end are missing (shouldn't happen in normal flow)
      if (!finalEnd && !finalStart) {
        const now = new Date();
        finalEnd = now.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');
        finalStart = finalEnd;
      } else if (!finalEnd) {
        // If only end is missing, use start time (duration will be 0)
        finalEnd = finalStart;
      }

      const durataFinale = calcolaDurata(finalStart, finalEnd);

      const visitaData = {
        dataOraVisita: toISODatetimeFormat(finalStart),
        dataOraFineVisita: toISODatetimeFormat(finalEnd),
        tipoVisita: formData.tipoVisita === 'Altro' ? formData.altroTipoVisita : formData.tipoVisita,
        prenotazioneId: null,
        sintomi: formData.sintomi,
        diagnosi: formData.diagnosi,
        trattamentoTerapia: formData.trattamentoTerapia,
        note: formData.note,
        notePrivate: formData.notePrivate
      };

      await onSave(visitaData);
    } catch (error) {
      logger.error('Error saving visita:', error);
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
    const nowStr = getCurrentISODatetime();
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

  const toggleEditMode = () => {
    setEditMode(!editMode);
    // Reset errors when entering edit mode
    if (!editMode) {
      setErrors({});
      setFormError('');
    }
  };

  // Add some CSS for the edit button spacing
  const actionStyles = `
    .mr-2 {
      margin-right: var(--space-2);
    }
    .visite-form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
    .visite-form-actions-left {
      display: flex;
      gap: var(--space-2);
    }
    .visite-form-actions-right {
      display: flex;
      gap: var(--space-2);
    }
  `;

  const fatturaInfoStyles = `
    .visite-fattura-info {
      background-color: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      margin-bottom: var(--space-3);
      font-size: var(--font-sm);
    }
    .visite-fattura-header {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
      color: var(--primary);
      font-weight: 600;
    }
    .visite-fattura-icon {
      font-size: var(--font-md);
    }
    .visite-fattura-details {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-1) var(--space-3);
      align-items: center;
    }
    .visite-fattura-row {
      display: contents;
    }
    .visite-fattura-label {
      color: var(--gray-600);
      font-weight: 500;
    }
    .visite-fattura-value {
      color: var(--gray-800);
    }
    .visite-fattura-value.fattura-importo {
      font-weight: 600;
      color: var(--primary);
    }
    .fattura-status-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: var(--font-xs);
      font-weight: 600;
      margin-left: auto;
    }
    .fattura-status-badge.pagata {
      background-color: #c6f6d5;
      color: #22543d;
    }
    .fattura-status-badge.non-pagata {
      background-color: #fed7d7;
      color: #9b2c2c;
    }
  `;

  return (
    <div className="visite-colonna-center">
      <style>{bannerStyles}</style>
      <style>{actionStyles}</style>
      <style>{fatturaInfoStyles}</style>
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
          {formData.id && (
            <div className={`visite-edit-mode-banner ${editMode ? 'edit-mode' : 'read-only-mode'}`}>
              {editMode ? (
                <>
                  <strong>ModalitÃ  Modifica</strong>
                </>
              ) : (
                <>
                  <strong>ModalitÃ  Solo Lettura</strong>
                </>
              )}
            </div>
          )}
          {fatturaEsistente && fatturaData && (
            <div className="visite-fattura-info">
              <div className="visite-fattura-header">
                <InvoiceIcon width={18} height={18} style={{ marginRight: '8px' }} />
                <strong>Fattura Associata</strong>
                <span className={`fattura-status-badge ${fatturaData.pagata ? 'pagata' : 'non-pagata'}`}>
                  {fatturaData.pagata ? 'Pagata' : 'Non Pagata'}
                </span>
              </div>
              <div className="visite-fattura-details">
                <div className="visite-fattura-row">
                  <span className="visite-fattura-label">Numero:</span>
                  <span className="visite-fattura-value">{fatturaData.numeroFattura}</span>
                </div>
                <div className="visite-fattura-row">
                  <span className="visite-fattura-label">Data:</span>
                  <span className="visite-fattura-value">
                    {fatturaData.dataEmissione ? new Date(fatturaData.dataEmissione).toLocaleDateString('it-IT') : 'N/D'}
                  </span>
                </div>
                <div className="visite-fattura-row">
                  <span className="visite-fattura-label">Importo:</span>
                  <span className="visite-fattura-value fattura-importo">
                    {fatturaData.importoTotale ? fatturaData.importoTotale.toFixed(2) + ' €' : 'N/D'}
                  </span>
                </div>
                <div className="visite-fattura-row">
                  <span className="visite-fattura-label">Stato:</span>
                  <span className="visite-fattura-value">
                    <button
                      type="button"
                      className={`btn btn-sm ${fatturaData.pagata ? 'btn-warning' : 'btn-success'}`}
                      onClick={async () => {
                        setTogglingPagamento(true);
                        try {
                          const response = await api.patch(`/api/fatture/${fatturaData.id}/pagamento`, {
                            pagata: !fatturaData.pagata
                          });
                          if (response.ok) {
                            const updated = await response.json();
                            setFatturaData(updated);
                          }
                        } catch (err) {
                          logger.error('Errore aggiornamento pagamento:', err);
                        } finally {
                          setTogglingPagamento(false);
                        }
                      }}
                      disabled={togglingPagamento}
                    >
                      {togglingPagamento
                        ? '...'
                        : fatturaData.pagata
                          ? 'Segna come Non Pagata'
                          : 'Segna come Pagata'
                      }
                    </button>
                  </span>
                </div>
              </div>
            </div>
          )}
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
                  readOnly={!editMode && formData.id}
                  disabled={!editMode && formData.id}
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
                  readOnly={!editMode && formData.id}
                  disabled={!editMode && formData.id}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={setOraCorrenteInizio}
                  disabled={!editMode && formData.id}
                >
                  Ora
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
                  readOnly={!editMode && formData.id}
                  disabled={!editMode && formData.id}
                />
                <input
                  type="time"
                  name="dataOraFineTime"
                  className={`visite-form-control ${hasError('dataOraFine') ? 'is-invalid' : ''}`}
                  value={formData.dataOraFine ? formData.dataOraFine.split('T')[1].substring(0, 5) : ''}
                  onChange={handleTimeChange}
                  onBlur={() => setTouched(prev => ({ ...prev, dataOraFine: true }))}
                  step="60"
                  readOnly={!editMode && formData.id}
                  disabled={!editMode && formData.id}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={setCurrentTimeEnd}
                  disabled={!editMode && formData.id}
                >
                  Ora
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
              {loadingPrestazioni ? (
                <div style={{ color: 'var(--gray-500)', fontSize: '14px', padding: '8px' }}>
                  Caricamento prestazioni...
                </div>
              ) : errorPrestazioni ? (
                <div style={{ color: 'var(--danger)', fontSize: '14px', padding: '8px' }}>
                  {errorPrestazioni}
                </div>
              ) : (
                <>
                  <select
                    name="tipoVisita"
                    className={`visite-form-control ${hasError('tipoVisita') ? 'is-invalid' : ''}`}
                    value={formData.tipoVisita || ''}
                    onChange={handleChange}
                    onBlur={() => setTouched(prev => ({ ...prev, tipoVisita: true }))}
                    disabled={!editMode && formData.id}
                  >
                    <option value="">Seleziona tipo</option>
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
                  {hasError('tipoVisita') && <div className="form-error">{errors.tipoVisita}</div>}
                </>
              )}
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
                  readOnly={!editMode && formData.id}
                  disabled={!editMode && formData.id}
                />
                {hasError('altroTipoVisita') && <div className="form-error">{errors.altroTipoVisita}</div>}
              </div>
            )}

            {/* ===== REFERTO CLINICO ===== */}
            <div className="visite-divider"><span>Referto Clinico</span></div>
            <div className="visite-form-group">
              <label className="visite-form-label">Sintomi</label>
              <textarea name="sintomi" className="visite-form-control visite-form-textarea" rows="3" value={formData.sintomi || ''} onChange={handleChange} placeholder="Descrivi i sintomi riportati..." readOnly={!editMode && formData.id} disabled={!editMode && formData.id} />
            </div>
            <div className="visite-form-group">
              <label className="visite-form-label">Diagnosi</label>
              <textarea name="diagnosi" className="visite-form-control visite-form-textarea" rows="3" value={formData.diagnosi || ''} onChange={handleChange} placeholder="Inserisci la diagnosi..." readOnly={!editMode && formData.id} disabled={!editMode && formData.id} />
            </div>
            <div className="visite-form-group">
              <label className="visite-form-label">Trattamento / Terapia</label>
              <textarea name="trattamentoTerapia" className="visite-form-control visite-form-textarea" rows="3" value={formData.trattamentoTerapia || ''} onChange={handleChange} placeholder="Indica il trattamento prescritto..." readOnly={!editMode && formData.id} disabled={!editMode && formData.id} />
            </div>
            <div className="visite-form-group">
              <label className="visite-form-label">Note</label>
              <textarea name="note" className="visite-form-control visite-form-textarea" rows="2" value={formData.note || ''} onChange={handleChange} placeholder="Note aggiuntive (visibili al proprietario)..." readOnly={!editMode && formData.id} disabled={!editMode && formData.id} />
            </div>
            <div className="visite-form-group">
              <label className="visite-form-label">Note Private</label>
              <textarea name="notePrivate" className="visite-form-control visite-form-textarea" rows="2" value={formData.notePrivate || ''} onChange={handleChange} placeholder="Note riservate al veterinario..." readOnly={!editMode && formData.id} disabled={!editMode && formData.id} />
            </div>

            {formError && <div className="form-error" style={{ marginBottom: 'var(--space-2)' }}>{formError}</div>}

            <div className="visite-form-actions">
              <div className="visite-form-actions-left">
                {formData.id && (
                  <button 
                    type="button" 
                    className="btn btn-secondary mr-2"
                    onClick={toggleEditMode}
                    disabled={isSaving}
                  >
                    {editMode ? 'Annulla Modifiche' : 'Modifica'}
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={isSaving || (!editMode && formData.id)}>
                  {getButtonText()}
                </button>
              </div>
              {formData.id && (
                <div className="visite-form-actions-right">
                  {fatturaEsistente ? (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      disabled={true}
                      title="Esiste giÃ  una fattura per questa visita"
                    >
                      <InvoiceIcon width={16} height={16} style={{ marginRight: '6px' }} />
                      Fattura Esistente
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="btn btn-success"
                      onClick={() => setShowFatturaModal(true)}
                      disabled={isSaving}
                    >
                      <InvoiceIcon width={16} height={16} style={{ marginRight: '6px' }} />
                      Crea Fattura Semplificata
                    </button>
                  )}
                </div>
              )}
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
      
      {/* Modale fattura semplificata */}
      {showFatturaModal && (
        <FatturaSemplificataModal
          visitaId={formData.id}
          proprietario={proprietario}
          animale={animale}
          onClose={() => {
            setShowFatturaModal(false);
            if (fatturaSuccess) {
              window.location.reload(); // Ricarica per vedere la fattura creata
            }
          }}
          onSuccess={() => {
            setFatturaSuccess(true);
          }}
        />
      )}
    </div>
  );
}

export default VisitaForm;
