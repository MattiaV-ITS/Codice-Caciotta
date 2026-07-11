import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toISODatetimeFormat, toISODateFormat } from '../../utils/dateUtils';

// ==============================
// MOCK PRENOTAZIONI (per controllo date/ore libere)
// ==============================
const MOCK_PRENOTAZIONI_ESISTENTI = [
  { id: 1, dataOraAppuntamento: '2024-07-15T10:30:00' },
  { id: 2, dataOraAppuntamento: '2024-07-15T14:00:00' },
  { id: 3, dataOraAppuntamento: '2024-07-16T09:00:00' },
  { id: 4, dataOraAppuntamento: '2024-07-16T11:30:00' },
  { id: 5, dataOraAppuntamento: '2024-07-17T16:00:00' },
];

// ==============================
// MOCK TIPI VISITA
// ==============================
const MOCK_TIPI_VISITA = [
  { id: 1, nome: 'Visita di controllo' },
  { id: 2, nome: 'Vaccinazione' },
  { id: 3, nome: 'Visita d\'urgenza' },
  { id: 4, nome: 'Chirurgia' },
  { id: 5, nome: 'Visita specialistica' },
  { id: 6, nome: 'Controllo post-operatorio' },
  { id: 7, nome: 'Visita domiciliare' },
  { id: 8, nome: 'Altro' },
];

// ==============================
// MOCK TUTTI GLI ANIMALI
// ==============================
const MOCK_TUTTI_ANIMALI = [
  { id: 1, nome: 'Fido', specie: 'cane', razza: 'Labrador', proprietarioId: 1, proprietarioNome: 'Mario Rossi' },
  { id: 2, nome: 'Mimì', specie: 'gatto', razza: 'Persiano', proprietarioId: 2, proprietarioNome: 'Laura Bianchi' },
  { id: 3, nome: 'Rex', specie: 'cane', razza: 'Pastore Tedesco', proprietarioId: 3, proprietarioNome: 'Giuseppe Verdi' },
  { id: 4, nome: 'Luna', specie: 'gatto', razza: 'Siamese', proprietarioId: 4, proprietarioNome: 'Maria Neri' },
  { id: 5, nome: 'Pippo', specie: 'altro', razza: 'Coniglio Nano', proprietarioId: 5, proprietarioNome: 'Antonio Ferrari' },
  { id: 7, nome: 'Leo', specie: 'gatto', razza: 'Europeo', proprietarioId: 1, proprietarioNome: 'Mario Rossi' },
  { id: 8, nome: 'Daisy', specie: 'altro', razza: 'Criceto', proprietarioId: 2, proprietarioNome: 'Laura Bianchi' },
  { id: 9, nome: 'Thor', specie: 'cane', razza: 'Mastino', proprietarioId: 3, proprietarioNome: 'Giuseppe Verdi' },
  { id: 10, nome: 'Mia', specie: 'gatto', razza: 'Maine Coon', proprietarioId: 4, proprietarioNome: 'Maria Neri' },
];

// ==============================
// MOCK ANIMALI PER UTENTE
// ==============================
const MOCK_ANIMALI_PER_UTENTE = {
  1: [1, 7],   // Mario Rossi → Fido, Leo
  2: [2, 8],   // Laura Bianchi → Mimì, Daisy
  3: [3, 9],   // Giuseppe Verdi → Rex, Thor
  4: [4, 10],  // Maria Neri → Luna, Mia
  5: [5],      // Antonio Ferrari → Pippo
  6: [],       // Utente senza animali
};

function PrenotazioneCreate({ onClose, onSuccess }) {
  const { user } = useAuth();
  const isUser = user?.roles?.includes('ROLE_USER');
  const isStaffOrAdmin = user?.roles?.includes('ROLE_STAFF') || user?.roles?.includes('ROLE_ADMIN');

  const [formData, setFormData] = useState({
    dataOraAppuntamento: '',
    tipoVisita: '',
    specificaTipoVisita: '',
    animaleId: '',
    note: ''
  });

  // ============================================================
  // STATO PER ANIMALE (solo per STAFF/ADMIN con autocomplete)
  // ============================================================
  const [animaleSearchTerm, setAnimaleSearchTerm] = useState('');
  const [animaleSuggestions, setAnimaleSuggestions] = useState([]);
  const [showAnimaleSuggestions, setShowAnimaleSuggestions] = useState(false);
  const [selectedAnimale, setSelectedAnimale] = useState(null);
  const animaleInputRef = useRef(null);
  const animaleDropdownRef = useRef(null);

  // Ottieni la lista degli animali per l'utente USER
  const userAnimaliIds = isUser ? (MOCK_ANIMALI_PER_UTENTE[user?.id] || []) : [];
  const animaliDelUtente = MOCK_TUTTI_ANIMALI.filter(a => userAnimaliIds.includes(a.id));

  // ============================================================
  // STATO PER ANIMALE (per USER - card selezionabili)
  // ============================================================
  const [selectedUserAnimaleId, setSelectedUserAnimaleId] = useState(null);

  // ============================================================
  // RICERCA ANIMALE (solo per STAFF/ADMIN)
  // ============================================================
  useEffect(() => {
    if (!isStaffOrAdmin) return;
    if (animaleSearchTerm.length >= 1) {
      const term = animaleSearchTerm.toLowerCase();
      const filtered = MOCK_TUTTI_ANIMALI.filter(a =>
        a.nome.toLowerCase().startsWith(term) ||
        a.proprietarioNome.toLowerCase().includes(term) ||
        a.specie.toLowerCase().startsWith(term)
      );
      setAnimaleSuggestions(filtered.slice(0, 8));
      setShowAnimaleSuggestions(filtered.length > 0);
    } else {
      setAnimaleSuggestions([]);
      setShowAnimaleSuggestions(false);
    }
  }, [animaleSearchTerm, isStaffOrAdmin]);

  // ============================================================
  // CHIUDI SUGGERIMENTI (solo per STAFF/ADMIN)
  // ============================================================
  useEffect(() => {
    if (!isStaffOrAdmin) return;
    const handleClickOutside = (e) => {
      if (animaleDropdownRef.current && !animaleDropdownRef.current.contains(e.target) &&
          animaleInputRef.current && !animaleInputRef.current.contains(e.target)) {
        setShowAnimaleSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStaffOrAdmin]);

  // ============================================================
  // CONTROLLO DATE/ORE LIBERE
  // ============================================================
  const [availableHours, setAvailableHours] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (selectedDate) {
      const allHours = [];
      for (let h = 8; h < 19; h++) {
        for (let m = 0; m < 60; m += 30) {
          const hourStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          allHours.push(hourStr);
        }
      }
      const occupiedHours = MOCK_PRENOTAZIONI_ESISTENTI
        .filter(p => p.dataOraAppuntamento.startsWith(selectedDate))
        .map(p => p.dataOraAppuntamento.substring(11, 16));
      const available = allHours.filter(h => !occupiedHours.includes(h));
      setAvailableHours(available);
    }
  }, [selectedDate]);

  // ============================================================
  // HANDLER GENERICI
  // ============================================================
  const handleDateChange = (e) => {
    const date = e.target.value;
    // Ensure the date is in ISO format
    const formattedDate = toISODateFormat(date);
    setSelectedDate(formattedDate);
    setFormData(prev => ({ ...prev, dataOraAppuntamento: '' }));
    setDateError('');
  };

  const handleHourSelect = (hour) => {
    // Ensure the date is in ISO format
    const formattedDate = toISODateFormat(selectedDate);
    setFormData(prev => ({
      ...prev,
      dataOraAppuntamento: `${formattedDate}T${hour}:00`
    }));
    setTouched(prev => ({ ...prev, dataOraAppuntamento: true }));
    setDateError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // ============================================================
  // SELEZIONE ANIMALE (per STAFF/ADMIN)
  // ============================================================
  const selectAnimale = (animale) => {
    setSelectedAnimale(animale);
    setFormData(prev => ({ ...prev, animaleId: animale.id }));
    setAnimaleSearchTerm(`${animale.nome} (${animale.specie})`);
    setShowAnimaleSuggestions(false);
    setErrors(prev => ({ ...prev, animaleId: '' }));
  };

  const clearAnimaleSelection = () => {
    setSelectedAnimale(null);
    setFormData(prev => ({ ...prev, animaleId: '' }));
    setAnimaleSearchTerm('');
    setShowAnimaleSuggestions(false);
  };

  // ============================================================
  // SELEZIONE ANIMALE (per USER - card)
  // ============================================================
  const handleUserAnimaleSelect = (animaleId) => {
    setSelectedUserAnimaleId(animaleId);
    setFormData(prev => ({ ...prev, animaleId: animaleId }));
    setErrors(prev => ({ ...prev, animaleId: '' }));
    setTouched(prev => ({ ...prev, animaleId: true }));
  };

  // ============================================================
  // VALIDAZIONE
  // ============================================================
  const validateField = (name, value) => {
    switch (name) {
      case 'dataOraAppuntamento':
        return !value ? 'Seleziona data e ora.' : '';
      case 'tipoVisita':
        if (!value) return 'Seleziona un tipo di visita.';
        // Se è "Altro", non mostrare errore qui (verrà validato sul campo specifica)
        if (value === 'Altro') return '';
        return '';
      case 'specificaTipoVisita':
        if (formData.tipoVisita === 'Altro' && !value.trim()) {
          return 'Specifica il tipo di visita.';
        }
        return '';
      case 'animaleId':
        return !value ? 'Seleziona un animale.' : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = ['dataOraAppuntamento', 'tipoVisita', 'animaleId'];
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Validazione specifica per "Altro"
    if (formData.tipoVisita === 'Altro' && !formData.specificaTipoVisita.trim()) {
      newErrors.specificaTipoVisita = 'Specifica il tipo di visita.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = {};
    ['dataOraAppuntamento', 'tipoVisita', 'animaleId', 'specificaTipoVisita'].forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    if (validateForm()) {
      // Ensure the date is in the correct ISO format before submission
      const finalDate = toISODatetimeFormat(formData.dataOraAppuntamento);
      
      const payload = {
        dataPrenotazione: new Date().toISOString(),
        dataOraAppuntamento: finalDate,
        tipoVisita: formData.tipoVisita === 'Altro' ? formData.specificaTipoVisita : formData.tipoVisita,
        priorita: formData.tipoVisita === 'Visita d\'urgenza' ? 'Alta' : 'Media',
        note: formData.note || '',
        animaleId: parseInt(formData.animaleId),
        proprietarioId: user?.id || null
      };
      onSuccess(payload);
      onClose();
    }
  };

  const hasError = (field) => touched[field] && errors[field];
  const hasSelectedDate = !!selectedDate;
  const showSpecificaTipo = formData.tipoVisita === 'Altro';

  // ============================================================
  // RENDER SUGGERIMENTI ANIMALE (solo per STAFF/ADMIN)
  // ============================================================
  const renderAnimaleSuggestions = () => {
    if (!isStaffOrAdmin) return null;
    if (!showAnimaleSuggestions || animaleSuggestions.length === 0) return null;

    return (
      <div
        ref={animaleDropdownRef}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--white)',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius)',
          maxHeight: '220px',
          overflowY: 'auto',
          zIndex: 10,
          boxShadow: 'var(--shadow-lg)',
          marginTop: '4px',
        }}
      >
        {animaleSuggestions.map((a) => (
          <div
            key={a.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              cursor: 'pointer',
              transition: 'background 0.15s',
              borderBottom: '1px solid var(--gray-100)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            onClick={() => selectAnimale(a)}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              {a.nome.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-900)' }}>
                {a.nome}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                {a.specie} {a.razza ? `• ${a.razza}` : ''}
                {` • ${a.proprietarioNome}`}
              </div>
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--gray-400)',
                padding: '2px 10px',
                background: 'var(--gray-100)',
                borderRadius: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              #{a.id}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ============================================================
  // RENDER CAMPO ANIMALE
  // ============================================================
  const renderAnimaleField = () => {
    if (isUser) {
      // USER: card selezionabili
      if (animaliDelUtente.length === 0) {
        return (
          <div
            style={{
              padding: '16px',
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: 'var(--radius)',
              color: '#92400E',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>⚠️ Nessun animale registrato</div>
            <div style={{ fontSize: '13px' }}>
              Per creare una prenotazione, devi prima registrare un animale.
              <br />
              <button
                type="button"
                className="btn btn-sm btn-primary"
                style={{ marginTop: '8px' }}
                onClick={() => alert('Apri modale creazione animale')}
              >
                + Registra Animale
              </button>
            </div>
            <input type="hidden" name="animaleId" value="" />
          </div>
        );
      }

      return (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '8px',
          }}>
            {animaliDelUtente.map(a => {
              const isSelected = selectedUserAnimaleId === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => handleUserAnimaleSelect(a.id)}
                  style={{
                    padding: '12px 16px',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--gray-200)'}`,
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isSelected ? 'var(--primary-light)' : 'var(--white)',
                    boxShadow: isSelected ? '0 0 0 2px rgba(42, 157, 143, 0.2)' : 'none',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--gray-400)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--gray-200)';
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isSelected ? 'var(--primary)' : 'var(--gray-200)',
                    color: isSelected ? 'white' : 'var(--gray-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '16px',
                    margin: '0 auto 6px',
                  }}>
                    {a.nome.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-900)' }}>
                    {a.nome}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    {a.specie}
                  </div>
                  {isSelected && (
                    <div style={{
                      marginTop: '6px',
                      fontSize: '12px',
                      color: 'var(--primary)',
                      fontWeight: 600,
                    }}>
                      ✓ Selezionato
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {hasError('animaleId') && <div className="form-error" style={{ marginTop: '8px' }}>{errors.animaleId}</div>}
          <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '8px' }}>
            {animaliDelUtente.length} animale{animaliDelUtente.length > 1 ? 'i' : ''} registrato{animaliDelUtente.length > 1 ? 'i' : ''}
            {selectedUserAnimaleId && ' • 1 selezionato'}
          </div>
        </div>
      );
    }

    // STAFF/ADMIN: autocomplete con ricerca
    return (
      <div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <input
              ref={animaleInputRef}
              type="text"
              className={`form-control ${hasError('animaleId') ? 'is-invalid' : ''}`}
              placeholder="Cerca per nome, specie o proprietario..."
              value={animaleSearchTerm}
              onChange={(e) => setAnimaleSearchTerm(e.target.value)}
              onFocus={() => {
                if (animaleSearchTerm.length >= 1) {
                  setShowAnimaleSuggestions(true);
                }
              }}
              style={{ paddingRight: '36px' }}
            />
            {selectedAnimale && (
              <button
                type="button"
                onClick={clearAnimaleSelection}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--gray-400)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0 4px',
                }}
              >
                ×
              </button>
            )}
          </div>
          {hasError('animaleId') && <div className="form-error">{errors.animaleId}</div>}
          {renderAnimaleSuggestions()}
        </div>
        {selectedAnimale && (
          <div style={{
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'var(--primary-light)',
            borderRadius: 'var(--radius)',
            border: '1px solid rgba(42, 157, 143, 0.2)',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '13px' }}>
              ✓ {selectedAnimale.nome}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
              {selectedAnimale.specie} {selectedAnimale.razza ? `• ${selectedAnimale.razza}` : ''}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--gray-400)', marginLeft: 'auto' }}>
              {selectedAnimale.proprietarioNome}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="proprietario-modal-overlay" onClick={onClose}>
      <div className="proprietario-modal" onClick={(e) => e.stopPropagation()}>
        <div className="proprietario-modal-header">
          <h3>Nuova Prenotazione</h3>
          <button className="proprietario-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="proprietario-modal-body">
          <form onSubmit={handleSubmit} className="proprietario-form">
            <div className="proprietario-form-grid">
              {/* Proprietario (precompilato) */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Proprietario</label>
                <input
                  type="text"
                  className="form-control"
                  value={user ? `${user.nome || user.username} ${user.cognome || ''}` : ''}
                  disabled
                  style={{ background: 'var(--gray-100)', cursor: 'not-allowed', color: 'var(--gray-600)' }}
                />
                <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                  Utente registrato
                </div>
              </div>

              {/* Data Appuntamento */}
              <div className="form-group">
                <label className="form-label">Data Appuntamento *</label>
                <input
                  type="date"
                  className={`form-control ${hasError('dataOraAppuntamento') ? 'is-invalid' : ''}`}
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Ora Appuntamento */}
              <div className="form-group">
                <label className="form-label">Ora Appuntamento *</label>
                {hasSelectedDate ? (
                  availableHours.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '4px',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      padding: '4px',
                      border: `1px solid ${hasError('dataOraAppuntamento') ? 'var(--danger)' : 'var(--gray-200)'}`,
                      borderRadius: 'var(--radius)',
                      background: 'var(--white)'
                    }}>
                      {availableHours.map(h => (
                        <button
                          key={h}
                          type="button"
                          className={`btn btn-sm ${formData.dataOraAppuntamento === `${selectedDate}T${h}:00` ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => handleHourSelect(h)}
                          style={{ fontSize: '12px', padding: '4px 6px' }}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--danger)', fontSize: '14px', padding: '8px' }}>
                      Nessuna ora disponibile per questa data
                    </div>
                  )
                ) : (
                  <div style={{ color: 'var(--gray-500)', fontSize: '14px', padding: '8px' }}>
                    Seleziona prima una data
                  </div>
                )}
                {hasError('dataOraAppuntamento') && <div className="form-error">{errors.dataOraAppuntamento}</div>}
              </div>

              {/* Tipo Visita */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Tipo Visita *</label>
                <select
                  name="tipoVisita"
                  className={`form-control ${hasError('tipoVisita') ? 'is-invalid' : ''}`}
                  value={formData.tipoVisita}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Seleziona tipo visita</option>
                  {MOCK_TIPI_VISITA.map(t => (
                    <option key={t.id} value={t.nome}>{t.nome}</option>
                  ))}
                </select>
                {hasError('tipoVisita') && <div className="form-error">{errors.tipoVisita}</div>}
              </div>

              {/* Specifica Tipo Visita (per Altro) */}
              {showSpecificaTipo && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Specifica tipo visita *</label>
                  <input
                    type="text"
                    name="specificaTipoVisita"
                    className={`form-control ${hasError('specificaTipoVisita') ? 'is-invalid' : ''}`}
                    value={formData.specificaTipoVisita}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Inserisci il tipo di visita..."
                  />
                  {hasError('specificaTipoVisita') && <div className="form-error">{errors.specificaTipoVisita}</div>}
                </div>
              )}

              {/* Animale */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Animale *</label>
                {renderAnimaleField()}
              </div>

              {/* Note */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Note</label>
                <input
                  type="text"
                  name="note"
                  className="form-control"
                  value={formData.note || ''}
                  onChange={handleChange}
                  placeholder="Note aggiuntive..."
                />
              </div>
            </div>

            {/* Pulsanti */}
            <div className="proprietario-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancella
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUser && animaliDelUtente.length === 0}
              >
                {isUser && animaliDelUtente.length === 0 ? 'Nessun animale' : 'Aggiungi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PrenotazioneCreate;