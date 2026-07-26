import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toISODatetimeFormat, toISODateFormat } from '../../utils/dateUtils';
import { useApi } from '../../services/apiService';
import FormModal from '../../components/FormModal/FormModal';
import { PlusIcon } from '../../components/icons'; // ✅ Import aggiunto

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

// Helper function to transform animali data to ensure consistent proprietario field
const transformAnimaliData = (animali) => {
  if (!Array.isArray(animali)) {
    console.warn('transformAnimaliData: expected array, got:', typeof animali);
    return animali || [];
  }

  return animali.map(animale => {
    // Check if proprietario field exists and has the expected structure
    let proprietarioNome = 'Sconosciuto';
    
    if (animale.proprietario) {
      if (typeof animale.proprietario === 'string') {
        proprietarioNome = animale.proprietario;
      } else if (typeof animale.proprietario === 'object' && animale.proprietario.nome) {
        // Handle nested object with null/undefined checks
        const nome = animale.proprietario.nome || '';
        const cognome = animale.proprietario.cognome || '';
        proprietarioNome = `${nome} ${cognome}`.trim() || 'Proprietario';
      }
    } else if (animale.proprietarioNome && typeof animale.proprietarioNome === 'string') {
      // Already has proprietarioNome field
      proprietarioNome = animale.proprietarioNome;
    } else if (animale.idProprietario || animale.proprietarioId) {
      proprietarioNome = 'Caricamento...';
    }
    
    return {
      ...animale,
      proprietarioNome: proprietarioNome
    };
  });
}

function PrenotazioneCreate({ onClose, onSuccess }) {
  const { user } = useAuth();
  const { get, post } = useApi();
  const navigate = useNavigate();
  const isUser = user?.roles?.includes('ROLE_USER');
  const isStaffOrAdmin = user?.roles?.includes('ROLE_STAFF') || user?.roles?.includes('ROLE_ADMIN');
  
  // State for reference data
  const [animali, setAnimali] = useState([]);
  const [loadingAnimali, setLoadingAnimali] = useState(true);
  const [prenotazioniEsistenti, setPrenotazioniEsistenti] = useState([]);
  const [loadingPrenotazioni, setLoadingPrenotazioni] = useState(true);
  const [prestazioni, setPrestazioni] = useState([]);
  const [loadingPrestazioni, setLoadingPrestazioni] = useState(true);
  const [selectedPrestazione, setSelectedPrestazione] = useState(null);

  const [formData, setFormData] = useState({
    dataOraAppuntamento: '',
    tipoVisita: '',
    specificaTipoVisita: '',
    animaleId: '',
    prestazioneId: '',
    note: ''
  });

  // Fetch reference data on component mount
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        setLoadingAnimali(true);
        setLoadingPrenotazioni(true);
        setLoadingPrestazioni(true);

        // Fetch animali
        const animaliResponse = await get('/api/animali');
        if (animaliResponse.ok) {
          const animaliData = await animaliResponse.json();
          // Transform animali data to ensure consistent proprietario field
          const transformedAnimali = transformAnimaliData(animaliData.content || animaliData);
          setAnimali(transformedAnimali);
        }

        // Fetch existing prenotazioni for date/time conflict checking
        const prenotazioniResponse = await get('/api/prenotazioni');
        if (prenotazioniResponse.ok) {
          const prenotazioniData = await prenotazioniResponse.json();
          setPrenotazioniEsistenti(prenotazioniData);
        }

        // Fetch prestazioni for tipo visita selection
        const prestazioniResponse = await get('/api/prestazioni/disponibili');
        if (prestazioniResponse.ok) {
          const prestazioniData = await prestazioniResponse.json();
          setPrestazioni(prestazioniData);
        }

      } catch (error) {
        console.error('Error fetching reference data:', error);
      } finally {
        setLoadingAnimali(false);
        setLoadingPrenotazioni(false);
        setLoadingPrestazioni(false);
      }
    };

    fetchReferenceData();
  }, [get]);

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
  const userAnimaliIds = isUser ? (Array.isArray(animali) ? animali.filter(a => a?.proprietarioId === user?.id).map(a => a.id) : []) : [];
  const animaliDelUtente = Array.isArray(animali) ? animali.filter(a => userAnimaliIds.includes(a?.id)) : [];

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
      const filtered = Array.isArray(animali) ? animali.filter(a =>
        a?.nome?.toLowerCase()?.startsWith(term) ||
        a?.proprietarioNome?.toLowerCase()?.includes(term) ||
        a?.specie?.toLowerCase()?.startsWith(term)
      ) : [];
      setAnimaleSuggestions(filtered.slice(0, 8));
      setShowAnimaleSuggestions(filtered.length > 0);
    } else {
      setAnimaleSuggestions([]);
      setShowAnimaleSuggestions(false);
    }
  }, [animaleSearchTerm, isStaffOrAdmin, animali]);

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

  const [selectedPrestazioneDuration, setSelectedPrestazioneDuration] = useState(30);

  // Update selectedPrestazioneDuration when prestazioneId changes
  useEffect(() => {
    if (formData.prestazioneId) {
      const selected = prestazioni.find(p => p.id === parseInt(formData.prestazioneId));
      if (selected && selected.durataStimata && selected.durataStimata > 0) {
        setSelectedPrestazioneDuration(selected.durataStimata);
      } else {
        setSelectedPrestazioneDuration(30);
      }
    } else {
      setSelectedPrestazioneDuration(30);
    }
  }, [formData.prestazioneId, prestazioni]);

  useEffect(() => {
    if (selectedDate) {
      const allHours = [];
      for (let h = 8; h < 19; h++) {
        for (let m = 0; m < 60; m += 30) {
          const hourStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          allHours.push(hourStr);
        }
      }
      
      const available = allHours.filter(h => {
        const [startHour, startMin] = h.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = startMinutes + selectedPrestazioneDuration;
        
        // Ensure the entire prestazione fits within the available booking window (8-19)
        if (endMinutes > 19 * 60) {
          return false;
        }
        
        // Check if already booked
        const occupiedHours = Array.isArray(prenotazioniEsistenti)
          ? prenotazioniEsistenti.filter(p => p.dataOraAppuntamento?.startsWith(selectedDate))
            .map(p => p.dataOraAppuntamento.substring(11, 16))
          : [];
        
        return !occupiedHours.includes(h);
      });
      
      setAvailableHours(available);
    }
  }, [selectedDate, prenotazioniEsistenti, selectedPrestazioneDuration]);

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
  const selectAnimale = async (animale) => {
    setFormData(prev => ({
      ...prev, 
      animaleId: animale.id,
      proprietarioId: (animale.idProprietario || animale.proprietarioId) || prev.proprietarioId
    }));
    setAnimaleSearchTerm(animale.nome);
    setShowAnimaleSuggestions(false);
    setErrors(prev => ({ ...prev, animaleId: '' }));
    
    // Auto-fill proprietario info
    const proprietarioId = animale.idProprietario || animale.proprietarioId;
    if (proprietarioId) {
      try {
        const response = await get(`/api/proprietari/${proprietarioId}`);
        if (response.ok) {
          const proprietario = await response.json();
          
          // Create enhanced animal object with proprietario info for display
          const enhancedAnimale = {
            ...animale,
            proprietarioNome: `${proprietario?.nome || ''} ${proprietario?.cognome || ''}`.trim(),
            proprietarioId: proprietario.id
          };
          
          setSelectedAnimale(enhancedAnimale);
          setSelectedProprietario(proprietario);
        } else {
          console.error('Failed to fetch proprietario:', response.status);
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
      case 'prestazioneId':
        return !value ? 'Seleziona una prestazione.' : '';
      case 'animaleId':
        return !value ? 'Seleziona un animale.' : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = ['dataOraAppuntamento', 'prestazioneId', 'animaleId'];
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {};
    ['dataOraAppuntamento', 'tipoVisita', 'animaleId', 'specificaTipoVisita'].forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    if (validateForm()) {
      try {
        // Ensure the date is in the correct ISO format before submission
        const finalDate = toISODatetimeFormat(formData.dataOraAppuntamento);
        
        const payload = {
          dataOraAppuntamento: finalDate,
          tipoVisita: formData.tipoVisita === 'Altro' ? formData.specificaTipoVisita : formData.tipoVisita,
          note: formData.note || '',
          animaleId: parseInt(formData.animaleId),
          proprietarioId: user?.id || null
        };
        
        // Create prenotazione in backend
        const response = await post('/api/prenotazioni', payload);
        if (!response.ok) {
          throw new Error(`Failed to create prenotazione: ${response.status}`);
        }
        
        const createdPrenotazione = await response.json();
        
        // Check if this should create a visita automatically
        const shouldCreateVisita = false; // TODO: Add logic to determine if visita should be created automatically
        
        if (shouldCreateVisita) {
          // Create visita from prenotazione
          const visitaResponse = await post(`/api/prenotazioni/${createdPrenotazione.id}/visita`);
          if (visitaResponse.ok) {
            const visitaData = await visitaResponse.json();
            onSuccess({ ...createdPrenotazione, visitaId: visitaData.visitaId });
            navigate(`/visite/${visitaData.visitaId}`);
          } else {
            onSuccess(createdPrenotazione);
            onClose();
          }
        } else {
          onSuccess(createdPrenotazione);
          onClose();
        }
        
      } catch (error) {
        console.error('Error creating prenotazione:', error);
        // Fallback to old behavior if backend call fails
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
            onClick={() => selectAnimale(a).catch(console.error)}
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
                {a.proprietarioNome ? ` • ${a.proprietarioNome}` : ''}
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
      if (loadingAnimali) {
        return (
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <div className="loading-spinner-custom" style={{ margin: '0 auto' }}></div>
            <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>
              Caricamento animali...
            </div>
          </div>
        );
      }
      
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
                style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => alert('Apri modale creazione animale')}
              >
                <PlusIcon width={16} height={16} stroke="currentColor" />
                Registra Animale
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
    <FormModal
      title="Nuova Prenotazione"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
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

        {/* Prestazione */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Prestazione *</label>
          {loadingPrestazioni ? (
            <div style={{ padding: '8px', textAlign: 'center' }}>
              <div className="loading-spinner-custom" style={{ margin: '0 auto' }}></div>
              <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '4px' }}>
                Caricamento prestazioni...
              </div>
            </div>
          ) : prestazioni.length > 0 ? (
            <div>
              <select
                name="prestazioneId"
                className={`form-control ${hasError('prestazioneId') ? 'is-invalid' : ''}`}
                value={formData.prestazioneId}
                onChange={(e) => {
                  handleChange(e);
                  const selected = prestazioni.find(p => p.id === parseInt(e.target.value));
                  setSelectedPrestazione(selected);
                }}
                onBlur={handleBlur}
              >
                <option value="">Seleziona una prestazione</option>
                {prestazioni.map((prestazione) => (
                  <option key={prestazione.id} value={prestazione.id}>
                    {prestazione.nomePrestazione} - €{prestazione.costoBase.toFixed(2)}
                  </option>
                ))}
              </select>
              {hasError('prestazioneId') && <div className="form-error">{errors.prestazioneId}</div>}

              {selectedPrestazione && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--radius)',
                  borderLeft: `4px solid ${selectedPrestazione.colore || '#4299E1'}`,
                  fontSize: '13px'
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: '4px' }}>
                    {selectedPrestazione.nomePrestazione}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--gray-600)' }}>
                    <span>🕒 {selectedPrestazione.durataStimata} min</span>
                    <span>💰 €{selectedPrestazione.costoBase.toFixed(2)}</span>
                  </div>
                  {selectedPrestazione.descrizione && (
                    <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--gray-500)' }}>
                      {selectedPrestazione.descrizione}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              padding: '12px',
              background: '#FEE2E2',
              border: '1px solid #F87171',
              borderRadius: 'var(--radius)',
              color: '#991B1B',
            }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>⚠️ Nessuna prestazione disponibile</div>
              <div style={{ fontSize: '13px' }}>
                Contatta l'amministratore per creare delle prestazioni.
              </div>
            </div>
          )}
        </div>

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
    </FormModal>
  );
}

export default PrenotazioneCreate;