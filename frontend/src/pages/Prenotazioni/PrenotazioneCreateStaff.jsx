import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../services/apiService';
import { usePrenotazioneForm } from '../../hooks/usePrenotazioneForm';
import FormModal from '../../components/FormModal/FormModal';

function PrenotazioneCreateStaff({ onClose, onSuccess }) {
  const { user } = useAuth();
  const { get } = useApi();
  const isStaffOrAdmin = user?.roles?.includes('ROLE_STAFF') || user?.roles?.includes('ROLE_ADMIN');

  // Use shared hook
  const {
    prestazioni, loadingPrestazioni, errorPrestazioni, availablePrestazioni,
    formData, setFormData,
    errors, hasError,
    isSubmitting, submitError,
    selectedDate, availableHours, hasSelectedDate, isTipoVisitaSelected, showSpecificaTipo,
    handleChange, handleBlur, handleDateChange, handleHourSelect, handleSubmit,
    setSelectedDate, setErrors, setTouched,
  } = usePrenotazioneForm({ onClose, onSuccess });

  // ============================================================
  // STATO PER ANIMALE (solo per STAFF/ADMIN con autocomplete)
  // ============================================================
  const [animaleSearchTerm, setAnimaleSearchTerm] = useState('');
  const [animaleSuggestions, setAnimaleSuggestions] = useState([]);
  const [showAnimaleSuggestions, setShowAnimaleSuggestions] = useState(false);
  const [selectedAnimale, setSelectedAnimale] = useState(null);
  const [activeAnimaleSuggestionIndex, setActiveAnimaleSuggestionIndex] = useState(-1);
  const animaleInputRef = useRef(null);
  const animaleDropdownRef = useRef(null);

  // ============================================================
  // STATO PER PROPRIETARIO (con autocomplete)
  // ============================================================
  const [proprietarioSearchTerm, setProprietarioSearchTerm] = useState('');
  const [proprietarioSuggestions, setProprietarioSuggestions] = useState([]);
  const [showProprietarioSuggestions, setShowProprietarioSuggestions] = useState(false);
  const [selectedProprietario, setSelectedProprietario] = useState(null);
  const [activeProprietarioSuggestionIndex, setActiveProprietarioSuggestionIndex] = useState(-1);
  const proprietarioInputRef = useRef(null);
  const proprietarioDropdownRef = useRef(null);

  // ============================================================
  // RICERCA ANIMALE (solo per STAFF/ADMIN) - Server-side search
  // ============================================================
  useEffect(() => {
    const searchAnimali = async () => {
      if (animaleSearchTerm.length >= 1) {
        try {
          const params = new URLSearchParams();
          params.append('search', animaleSearchTerm);
          params.append('size', '10');
          if (selectedProprietario?.id) {
            params.append('proprietarioId', selectedProprietario.id);
          }
          const response = await get(`/api/animali?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            const animaliContent = Array.isArray(data)
              ? data
              : (data.content && Array.isArray(data.content)
                  ? data.content
                  : []);
            const transformedAnimali = animaliContent.map(animale => {
              const proprietarioNome = animale.proprietario && typeof animale.proprietario === 'string'
                ? animale.proprietario
                : (animale.idProprietario ? 'Caricamento...' : 'Sconosciuto');
              return { ...animale, proprietarioNome };
            });
            setAnimaleSuggestions(transformedAnimali);
            if (!selectedAnimale) {
              setShowAnimaleSuggestions(transformedAnimali.length > 0);
            }
          } else {
            setAnimaleSuggestions([]);
            setShowAnimaleSuggestions(false);
          }
        } catch (error) {
          console.error('Error searching animali:', error);
          setAnimaleSuggestions([]);
          setShowAnimaleSuggestions(false);
        }
      } else {
        setAnimaleSuggestions([]);
        setShowAnimaleSuggestions(false);
      }
    };
    const debounceTimer = setTimeout(searchAnimali, 300);
    return () => clearTimeout(debounceTimer);
  }, [animaleSearchTerm, selectedProprietario, get, selectedAnimale]);

  // ============================================================
  // CHIUDI SUGGERIMENTI
  // ============================================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (animaleDropdownRef.current && !animaleDropdownRef.current.contains(e.target) &&
          animaleInputRef.current && !animaleInputRef.current.contains(e.target)) {
        setShowAnimaleSuggestions(false);
      }
      if (proprietarioDropdownRef.current && !proprietarioDropdownRef.current.contains(e.target) &&
          proprietarioInputRef.current && !proprietarioInputRef.current.contains(e.target)) {
        setShowProprietarioSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================
  // RICERCA PROPRIETARIO - Server-side search
  // ============================================================
  useEffect(() => {
    const searchProprietari = async () => {
      if (proprietarioSearchTerm.length >= 1) {
        try {
          const params = new URLSearchParams();
          params.append('search', proprietarioSearchTerm);
          params.append('size', '10');
          const response = await get(`/api/proprietari?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            const proprietariContent = Array.isArray(data)
              ? data
              : (data.content && Array.isArray(data.content)
                  ? data.content
                  : []);
            setProprietarioSuggestions(proprietariContent);
            setShowProprietarioSuggestions(proprietariContent.length > 0);
          } else {
            setProprietarioSuggestions([]);
            setShowProprietarioSuggestions(false);
          }
        } catch (error) {
          console.error('Error searching proprietari:', error);
          setProprietarioSuggestions([]);
          setShowProprietarioSuggestions(false);
        }
      } else {
        setProprietarioSuggestions([]);
        setShowProprietarioSuggestions(false);
      }
    };
    const debounceTimer = setTimeout(searchProprietari, 300);
    return () => clearTimeout(debounceTimer);
  }, [proprietarioSearchTerm, get]);

  // ============================================================
  // SELEZIONE ANIMALE
  // ============================================================
  const selectAnimale = async (animale) => {
    setFormData(prev => ({
      ...prev,
      animaleId: animale.id,
      proprietarioId: (animale.idProprietario || animale.proprietarioId)?.toString() || ''
    }));
    setAnimaleSearchTerm(animale.nome);
    setShowAnimaleSuggestions(false);
    setErrors(prev => ({ ...prev, animaleId: '', proprietarioId: '' }));

    const proprietarioId = animale.idProprietario || animale.proprietarioId;
    if (proprietarioId) {
      try {
        const response = await get(`/api/proprietari/${proprietarioId}`);
        if (response.ok) {
          const proprietario = await response.json();
          const enhancedAnimale = {
            ...animale,
            proprietarioNome: `${proprietario?.nome || ''} ${proprietario?.cognome || ''}`.trim(),
            proprietarioId: proprietario.id
          };
          setSelectedAnimale(enhancedAnimale);
          setSelectedProprietario(proprietario);
          setProprietarioSearchTerm(`${proprietario?.nome || ''} ${proprietario?.cognome || ''}`.trim());
        } else {
          setSelectedAnimale(animale);
        }
      } catch (error) {
        console.error('Error fetching proprietario:', error);
        setSelectedAnimale(animale);
      }
    } else {
      setSelectedAnimale(animale);
    }
  };

  const clearAnimaleSelection = () => {
    setSelectedAnimale(null);
    setFormData(prev => ({ ...prev, animaleId: '' }));
    setAnimaleSearchTerm('');
    setShowAnimaleSuggestions(false);
  };

  // ============================================================
  // SELEZIONE PROPRIETARIO
  // ============================================================
  const selectProprietario = (proprietario) => {
    setSelectedProprietario(proprietario);
    setFormData(prev => ({
      ...prev,
      proprietarioId: proprietario.id?.toString() || '',
      animaleId: ''
    }));
    setProprietarioSearchTerm(`${proprietario?.nome || ''} ${proprietario?.cognome || ''}`.trim());
    setShowProprietarioSuggestions(false);
    setErrors(prev => ({ ...prev, proprietarioId: '' }));
    setSelectedAnimale(null);
    setAnimaleSearchTerm('');
  };

  const clearProprietarioSelection = () => {
    setSelectedProprietario(null);
    setFormData(prev => ({ ...prev, proprietarioId: '', animaleId: '' }));
    setProprietarioSearchTerm('');
    setShowProprietarioSuggestions(false);
    setSelectedAnimale(null);
    setAnimaleSearchTerm('');
  };

  // ============================================================
  // RENDER SUGGERIMENTI ANIMALE
  // ============================================================
  const renderAnimaleSuggestions = () => {
    if (!isStaffOrAdmin) return null;
    if (animaleSuggestions.length === 0) return null;
    if (!showAnimaleSuggestions) return null;

    return (
      <div
        ref={animaleDropdownRef}
        style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--white)', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius)', maxHeight: '220px', overflowY: 'auto',
          zIndex: 10, boxShadow: 'var(--shadow-lg)', marginTop: '4px',
        }}
      >
        {animaleSuggestions.map((a, index) => (
          <div
            key={a.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', cursor: 'pointer',
              transition: 'background 0.15s',
              borderBottom: '1px solid var(--gray-100)',
              background: activeAnimaleSuggestionIndex === index ? 'var(--gray-50)' : 'transparent'
            }}
            onMouseEnter={() => setActiveAnimaleSuggestionIndex(index)}
            onClick={() => selectAnimale(a)}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '14px', flexShrink: 0,
            }}>
              {a.nome.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-900)' }}>
                {a.nome}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                {a.specie} {a.razza ? `• ${a.razza}` : ''}
                {a.proprietarioNome && a.proprietarioNome !== 'Sconosciuto' ? ` • ${a.proprietarioNome}` : ''}
                {a.microchip ? ` • Microchip: ${a.microchip}` : ''}
              </div>
            </div>
            <div style={{
              fontSize: '12px', color: 'var(--gray-400)',
              padding: '2px 10px', background: 'var(--gray-100)',
              borderRadius: '12px', whiteSpace: 'nowrap',
            }}>
              #{a.id}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ============================================================
  // RENDER SUGGERIMENTI PROPRIETARIO
  // ============================================================
  const renderProprietarioSuggestions = () => {
    if (proprietarioSuggestions.length === 0) return null;
    if (!showProprietarioSuggestions) return null;

    return (
      <div
        ref={proprietarioDropdownRef}
        style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--white)', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius)', maxHeight: '220px', overflowY: 'auto',
          zIndex: 10, boxShadow: 'var(--shadow-lg)', marginTop: '4px',
        }}
      >
        {proprietarioSuggestions.map((p, index) => (
          <div
            key={p.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', cursor: 'pointer',
              transition: 'background 0.15s',
              borderBottom: '1px solid var(--gray-100)',
              background: activeProprietarioSuggestionIndex === index ? 'var(--gray-50)' : 'transparent'
            }}
            onMouseEnter={() => setActiveProprietarioSuggestionIndex(index)}
            onClick={() => selectProprietario(p)}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--success-light)', color: 'var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '14px', flexShrink: 0,
            }}>
              {p.nome.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-900)' }}>
                {p.nome} {p.cognome}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                {p.telefono ? `Tel: ${p.telefono} • ` : ''}
                {p.email}
              </div>
            </div>
            <div style={{
              fontSize: '12px', color: 'var(--gray-400)',
              padding: '2px 10px', background: 'var(--gray-100)',
              borderRadius: '12px', whiteSpace: 'nowrap',
            }}>
              #{p.id}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <FormModal
      title="Nuova Prenotazione (Staff)"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
    >
      <div className="proprietario-form-grid">
        {/* Proprietario (autocomplete per STAFF) */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Proprietario *</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={proprietarioInputRef}
                type="text"
                className={`form-control ${hasError('proprietarioId') ? 'is-invalid' : ''}`}
                placeholder="Cerca per nome, cognome, telefono o email..."
                value={proprietarioSearchTerm}
                onChange={(e) => {
                  setProprietarioSearchTerm(e.target.value);
                  setActiveProprietarioSuggestionIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (activeProprietarioSuggestionIndex >= 0 && proprietarioSuggestions[activeProprietarioSuggestionIndex]) {
                      selectProprietario(proprietarioSuggestions[activeProprietarioSuggestionIndex]);
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveProprietarioSuggestionIndex(prev => Math.min(prev + 1, proprietarioSuggestions.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveProprietarioSuggestionIndex(prev => Math.max(prev - 1, 0));
                  }
                }}
                style={{ paddingRight: '36px' }}
              />
              {selectedProprietario && (
                <button type="button" onClick={clearProprietarioSelection} style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'var(--gray-400)', cursor: 'pointer',
                  fontSize: '16px', padding: '0 4px',
                }}>×</button>
              )}
            </div>
            {hasError('proprietarioId') && <div className="form-error">{errors.proprietarioId}</div>}
            {renderProprietarioSuggestions()}
          </div>
          {selectedProprietario && (
            <div style={{
              marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px', background: 'var(--success-light)',
              borderRadius: 'var(--radius)', border: '1px solid rgba(42, 157, 143, 0.2)',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--success)', fontSize: '13px' }}>
                ✓ {selectedProprietario ? `${selectedProprietario.nome || ''} ${selectedProprietario.cognome || ''}`.trim() : 'Proprietario'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                {selectedProprietario?.telefono ? `Tel: ${selectedProprietario.telefono} • ` : ''}
                {selectedProprietario?.email || ''}
              </span>
            </div>
          )}
        </div>

        {/* Animale */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Animale *</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={animaleInputRef}
                type="text"
                className={`form-control ${hasError('animaleId') ? 'is-invalid' : ''}`}
                placeholder={selectedProprietario?.nome ? `Cerca animali di ${selectedProprietario.nome}...` : "Cerca per nome, microchip, specie o proprietario..."}
                value={animaleSearchTerm}
                onChange={(e) => {
                  setAnimaleSearchTerm(e.target.value);
                  setActiveAnimaleSuggestionIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (activeAnimaleSuggestionIndex >= 0 && animaleSuggestions[activeAnimaleSuggestionIndex]) {
                      selectAnimale(animaleSuggestions[activeAnimaleSuggestionIndex]);
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveAnimaleSuggestionIndex(prev => Math.min(prev + 1, animaleSuggestions.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveAnimaleSuggestionIndex(prev => Math.max(prev - 1, 0));
                  }
                }}
                style={{ paddingRight: '36px' }}
              />
              {selectedAnimale && (
                <button type="button" onClick={clearAnimaleSelection} style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: 'var(--gray-400)', cursor: 'pointer',
                  fontSize: '16px', padding: '0 4px',
                }}>×</button>
              )}
            </div>
            {hasError('animaleId') && <div className="form-error">{errors.animaleId}</div>}
            {renderAnimaleSuggestions()}
          </div>
          {selectedAnimale && (
            <div style={{
              marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px', background: 'var(--primary-light)',
              borderRadius: 'var(--radius)', border: '1px solid rgba(42, 157, 143, 0.2)',
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

        {/* Tipo Visita */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Tipo Visita *</label>
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
                className={`form-control ${hasError('tipoVisita') ? 'is-invalid' : ''}`}
                value={formData.tipoVisita}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Seleziona tipo visita</option>
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

        {/* Data Appuntamento */}
        <div className="form-group">
          <label className="form-label">Data Appuntamento *</label>
          {isTipoVisitaSelected ? (
            <input
              type="date"
              className={`form-control ${hasError('dataOraAppuntamento') ? 'is-invalid' : ''}`}
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
            />
          ) : (
            <div style={{ color: 'var(--gray-500)', fontSize: '14px', padding: '8px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', background: 'var(--gray-50)' }}>
              Seleziona prima il tipo di visita
            </div>
          )}
        </div>

        {/* Ora Appuntamento */}
        <div className="form-group">
          <label className="form-label">Ora Appuntamento *</label>
          {isTipoVisitaSelected ? (
            hasSelectedDate ? (
              availableHours.length > 0 ? (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px',
                  maxHeight: '120px', overflowY: 'auto', padding: '4px',
                  border: `1px solid ${hasError('dataOraAppuntamento') ? 'var(--danger)' : 'var(--gray-200)'}`,
                  borderRadius: 'var(--radius)', background: 'var(--white)'
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
            )
          ) : (
            <div style={{ color: 'var(--gray-500)', fontSize: '14px', padding: '8px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', background: 'var(--gray-50)' }}>
              Seleziona prima il tipo di visita
            </div>
          )}
          {hasError('dataOraAppuntamento') && <div className="form-error">{errors.dataOraAppuntamento}</div>}
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
    </FormModal>
  );
}

export default PrenotazioneCreateStaff;