import React, { useState, useEffect, useRef } from 'react';
import FormModal from '../../components/FormModal/FormModal';
import { validateRequired, validateEmail, validatePhone, validateMicrochip, validatePositiveNumber, capitalizeFirstLetter } from '../../utils/validationUtils';

function AnimaleCreate({ onClose, onSuccess, animale, isEditMode = false }) {
  const ALTRO_SESSO_VALUE = 'ALTRO_SCONOSCIUTO';
  const ALTRO_TAGLIA_VALUE = 'ALTRO_SCONOSCIUTA';
  const SPECIE_BASE_VALUES = ['cane', 'gatto', 'altro'];

  const normalizeSpecieForForm = (rawSpecie) => {
    const value = (rawSpecie || '').trim();
    if (!value) {
      return { specie: '', specificaSpecie: '' };
    }

    const isBaseSpecie = SPECIE_BASE_VALUES.includes(value.toLowerCase());
    if (isBaseSpecie) {
      return {
        specie: capitalizeFirstLetter(value),
        specificaSpecie: ''
      };
    }

    return {
      specie: 'Altro',
      specificaSpecie: value
    };
  };

  const [formData, setFormData] = useState(() => {
    if (isEditMode && animale) {
      const normalizedSpecie = normalizeSpecieForForm(animale.specie);
      return {
        nome: animale.nome || '',
        specie: normalizedSpecie.specie,
        specificaSpecie: animale.specificaSpecie || normalizedSpecie.specificaSpecie,
        razza: animale.razza || '',
        dataNascita: animale.dataNascita ? (typeof animale.dataNascita === 'string' ? animale.dataNascita.split('T')[0] : animale.dataNascita) : '',
        sesso: animale.sesso ?? ALTRO_SESSO_VALUE,
        peso: animale.peso ? String(animale.peso) : '',
        microchip: animale.microchip || '',
        taglia: animale.taglia ?? ALTRO_TAGLIA_VALUE,
        coloreMantello: animale.coloreMantello || '',
        sterilizzato: animale.sterilizzato || false,
        gruppoSanguigno: animale.gruppoSanguigno || '',
        allergie: animale.allergie || '',
        patologie: animale.patologie || '',
        stato: animale.stato || 'SANO',
        noteGenerali: animale.noteGenerali || '',
        notePrivate: animale.notePrivate || '',
        proprietarioId: animale.idProprietario ? String(animale.idProprietario) : (animale.proprietarioId ? String(animale.proprietarioId) : '')
      };
    }
    
    return {
      nome: '',
      specie: '',
      specificaSpecie: '',
      razza: '',
      dataNascita: '',
      sesso: '',
      peso: '',
      microchip: '',
      taglia: ALTRO_TAGLIA_VALUE, // Default: Altro/Sconosciuta
      coloreMantello: '',
      sterilizzato: false,
      gruppoSanguigno: '',
      allergie: '',
      patologie: '',
      stato: 'SANO',
      noteGenerali: '',
      notePrivate: '',
      proprietarioId: ''
    };
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProprietario, setSelectedProprietario] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchRef = useRef(null);
  

  // Load proprietario data when in edit mode and animale has a proprietario
  useEffect(() => {
  if (isEditMode && animale && (animale.idProprietario || animale.proprietarioId) && !selectedProprietario) {
    const proprietarioId = animale.idProprietario || animale.proprietarioId;
    const loadProprietario = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/proprietari/${proprietarioId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const proprietarioData = await response.json();
          setSelectedProprietario(proprietarioData);
          setSearchTerm(`${proprietarioData.nome} ${proprietarioData.cognome}`);
        }
      } catch (error) {
        console.error('Errore nel caricamento del proprietario:', error);
      }
    };
    loadProprietario();
  }
}, [isEditMode, animale, selectedProprietario]);





  const specieOptions = ['Cane', 'Gatto', 'Altro'];
  const sessoOptions = [
    { value: 'M', label: 'Maschio' },
    { value: 'F', label: 'Femmina' },
    { value: ALTRO_SESSO_VALUE, label: 'Altro/Sconosciuto' }
  ];
  const tagliaOptions = [
    { value: 'PICCOLA', label: 'Piccola' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'GRANDE', label: 'Grande' },
    { value: ALTRO_TAGLIA_VALUE, label: 'Altro/Sconosciuta' }
  ];
  const statoOptions = [
    { value: 'SANO', label: 'Sano' },
    { value: 'MALATO', label: 'Malato' },
    { value: 'IN_CURA', label: 'In cura' },
    { value: 'DECEDUTO', label: 'Deceduto' }
  ];

  // Ricerca proprietari
  useEffect(() => {
    const searchProprietari = async () => {
      if (searchTerm.length >= 1) {
        setSearchLoading(true);
        try {
          const token = localStorage.getItem('jwtToken');
          const response = await fetch(`/api/proprietari?search=${encodeURIComponent(searchTerm)}&page=0&size=10`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            // Fetch full proprietario data for each suggestion
            const fullSuggestions = await Promise.all(
              data.content.map(async (proprietario) => {
                try {
                  const fullResponse = await fetch(`/api/proprietari/${proprietario.id}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  if (fullResponse.ok) {
                    return await fullResponse.json();
                  }
                  return proprietario;
                } catch (error) {
                  console.error('Errore nel recupero dei dati completi del proprietario:', error);
                  return proprietario;
                }
              })
            );
            setSuggestions(fullSuggestions);
            setShowSuggestions((fullSuggestions.length || 0) > 0);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Errore ricerca proprietari:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(searchProprietari, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);



  // Chiudi suggerimenti cliccando fuori
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validazione campo singolo
  const isAltroSpecie = (value) => (value || '').toLowerCase() === 'altro';

  const suggestTagliaFromPeso = (pesoValue) => {
    const peso = parseFloat(pesoValue);
    if (Number.isNaN(peso) || peso <= 0) {
      return '';
    }
    if (peso <= 10) {
      return 'PICCOLA';
    }
    if (peso <= 25) {
      return 'MEDIA';
    }
    return 'GRANDE';
  };

  const tagliaSuggestionMap = {
    PICCOLA: 'Piccola',
    MEDIA: 'Media',
    GRANDE: 'Grande'
  };

  const suggestedTaglia = suggestTagliaFromPeso(formData.peso);
  const suggestedTagliaLabel = tagliaSuggestionMap[suggestedTaglia] || '';

  const validateField = (name, value) => {
    switch (name) {
      case 'nome':
        return validateRequired(value, 'Il nome');
      case 'specie':
        if (!value) return 'La specie è obbligatoria.';
        if (isAltroSpecie(value) && !formData.specificaSpecie.trim()) {
          return 'Specifica il tipo di animale.';
        }
        return '';
      case 'dataNascita':
        return validateRequired(value, 'La data di nascita');
      case 'peso':
        return validatePositiveNumber(value, 'Il peso');
      case 'microchip':
        return validateMicrochip(value);
      case 'sesso':
        return validateRequired(value, 'Il sesso');
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = ['nome', 'specie', 'dataNascita', 'peso', 'sesso'];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (isAltroSpecie(formData.specie) && !formData.specificaSpecie.trim()) {
      newErrors.specie = 'Specifica il tipo di animale.';
    }

    if (formData.microchip) {
      const mcError = validateField('microchip', formData.microchip);
      if (mcError) newErrors.microchip = mcError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      if (name === 'specie' && !isAltroSpecie(newValue)) {
        return { ...prev, specie: newValue, specificaSpecie: '' };
      }
      return { ...prev, [name]: newValue };
    });

    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allTouched = {};
    ['nome', 'specie', 'dataNascita', 'peso', 'sesso'].forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('jwtToken');
        const specificaSpecieTrimmed = formData.specificaSpecie?.trim() || '';
        const specieToSave = isAltroSpecie(formData.specie)
          ? specificaSpecieTrimmed
          : formData.specie;

        const payload = {
          ...formData,
          specie: specieToSave ? capitalizeFirstLetter(specieToSave) : specieToSave,
          specificaSpecie: specificaSpecieTrimmed ? capitalizeFirstLetter(specificaSpecieTrimmed) : '',
          peso: parseFloat(formData.peso),
          sesso: formData.sesso === 'ALTRO_SCONOSCIUTO' ? null : formData.sesso,
          taglia: formData.taglia === 'ALTRO_SCONOSCIUTA' ? null : formData.taglia,
          sterilizzato: formData.sterilizzato || false,
          stato: formData.stato || 'SANO',
          proprietarioId: formData.proprietarioId ? parseInt(formData.proprietarioId) : null,
          microchip: formData.microchip?.trim() || null
        };

        const url = isEditMode && animale?.id ? `/api/animali/${animale.id}` : '/api/animali';
        const method = isEditMode && animale?.id ? 'PATCH' : 'POST';
        
        const response = await fetch(url, {
          method: method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const resultAnimale = await response.json();
          onSuccess(resultAnimale);
          onClose();
        } else {
          const errorData = await response.json();
          console.error(isEditMode ? 'Aggiornamento animale fallito:' : 'Creazione animale fallita:', errorData);
          setErrors(prev => ({
            ...prev,
            form: (isEditMode ? 'Failed to update animale: ' : 'Failed to create animale: ') + (errorData.message || 'Unknown error')
          }));
        }
      } catch (error) {
        console.error('Errore durante la creazione dell\'animale:', error);
        setErrors(prev => ({
          ...prev,
          form: 'Error creating animale: ' + error.message
        }));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const hasError = (field) => touched[field] && errors[field];

  const selectProprietario = (proprietario) => {
    setSelectedProprietario(proprietario);
    setFormData(prev => ({ ...prev, proprietarioId: proprietario.id }));
    setSearchTerm(`${proprietario.nome} ${proprietario.cognome}`);
    setShowSuggestions(false);
    setErrors(prev => ({ ...prev, proprietarioId: '' }));
  };

  const showSpecificaSpecie = isAltroSpecie(formData.specie);

  return (
    <FormModal
      title={isEditMode ? "Modifica Animale" : "Nuovo Animale"}
      submitLabel={isEditMode ? "Salva" : "Aggiungi"}
      onClose={onClose}
      isSubmitting={isLoading}
      submitError={errors.form}
      onSubmit={handleSubmit}
    >
      <div className="proprietario-form-grid">
              {/* Nome */}
              <div className="form-group">
                <label className="form-label">Nome *</label>
                <input
                  type="text"
                  name="nome"
                  className={`form-control ${hasError('nome') ? 'is-invalid' : ''}`}
                  value={formData.nome}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {hasError('nome') && <div className="form-error">{errors.nome}</div>}
              </div>

              {/* Specie */}
              <div className="form-group">
                <label className="form-label">Specie *</label>
                <select
                  name="specie"
                  className={`form-control ${hasError('specie') ? 'is-invalid' : ''}`}
                  value={formData.specie}
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value="">Seleziona specie</option>
                  {specieOptions.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                {hasError('specie') && <div className="form-error">{errors.specie}</div>}
              </div>

              {/* Specifica Specie (per "Altro") */}
              {showSpecificaSpecie && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Specifica tipo animale *</label>
                  <input
                    type="text"
                    name="specificaSpecie"
                    className={`form-control ${hasError('specie') ? 'is-invalid' : ''}`}
                    value={formData.specificaSpecie}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="es. Coniglio, Criceto, Pappagallo..."
                  />
                  {hasError('specie') && <div className="form-error">{errors.specie}</div>}
                </div>
              )}

              {/* Razza */}
              <div className="form-group">
                <label className="form-label">Razza</label>
                <input
                  type="text"
                  name="razza"
                  className="form-control"
                  value={formData.razza}
                  onChange={handleChange}
                />
              </div>

              {/* Data Nascita */}
              <div className="form-group">
                <label className="form-label">Data Nascita *</label>
                <input
                  type="date"
                  name="dataNascita"
                  className={`form-control ${hasError('dataNascita') ? 'is-invalid' : ''}`}
                  value={formData.dataNascita}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {hasError('dataNascita') && <div className="form-error">{errors.dataNascita}</div>}
              </div>

              {/* SESSO - Radio button obbligatori */}
              <div className="form-group">
                <label className="form-label">Sesso *</label>
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: '4px', flexWrap: 'wrap' }}>
                  {sessoOptions.map(opt => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius)',
                        background: formData.sesso === opt.value ? 'var(--primary-light)' : 'transparent'
                      }}
                    >
                      <input
                        type="radio"
                        name="sesso"
                        value={opt.value}
                        checked={formData.sesso === opt.value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                {hasError('sesso') && <div className="form-error">{errors.sesso}</div>}
              </div>

              {/* Peso */}
              <div className="form-group">
                <label className="form-label">Peso (kg) *</label>
                <input
                  type="number"
                  name="peso"
                  step="0.1"
                  min="0.1"
                  className={`form-control ${hasError('peso') ? 'is-invalid' : ''}`}
                  value={formData.peso}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="es. 5.5"
                />
                {hasError('peso') && <div className="form-error">{errors.peso}</div>}
              </div>

              {/* Microchip */}
              <div className="form-group">
                <label className="form-label">Microchip</label>
                <input
                  type="text"
                  name="microchip"
                  className={`form-control ${hasError('microchip') ? 'is-invalid' : ''}`}
                  value={formData.microchip}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength="15"
                  placeholder="15 cifre"
                />
                {hasError('microchip') && <div className="form-error">{errors.microchip}</div>}
              </div>

              {/* TAGLIA - Radio button con default Altro/Sconosciuta */}
              <div className="form-group">
                <label className="form-label">Taglia</label>
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: '4px', flexWrap: 'wrap' }}>
                  {tagliaOptions.map(opt => (
                    <label
                      key={opt.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius)',
                        background: formData.taglia === opt.value ? 'var(--primary-light)' : 'transparent'
                      }}
                    >
                      <input
                        type="radio"
                        name="taglia"
                        value={opt.value}
                        checked={formData.taglia === opt.value}
                        onChange={handleChange}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                {suggestedTagliaLabel && (
                  <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--gray-500)' }}>
                    Suggerimento in base al peso: {suggestedTagliaLabel}
                  </div>
                )}
              </div>

              {/* Colore Mantello */}
              <div className="form-group">
                <label className="form-label">Colore Mantello</label>
                <input
                  type="text"
                  name="coloreMantello"
                  className="form-control"
                  value={formData.coloreMantello}
                  onChange={handleChange}
                  placeholder="es. Nero, Bianco, Marrone..."
                />
              </div>

              {/* Sterilizzato */}
              <div className="form-group">
                <label className="form-label">Sterilizzato</label>
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="sterilizzato"
                      value="true"
                      checked={formData.sterilizzato === true}
                      onChange={() => setFormData(prev => ({ ...prev, sterilizzato: true }))}
                    />
                    Sì
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="sterilizzato"
                      value="false"
                      checked={formData.sterilizzato === false}
                      onChange={() => setFormData(prev => ({ ...prev, sterilizzato: false }))}
                    />
                    No
                  </label>
                </div>
              </div>

              {/* Gruppo Sanguigno */}
              <div className="form-group">
                <label className="form-label">Gruppo Sanguigno</label>
                <input
                  type="text"
                  name="gruppoSanguigno"
                  className="form-control"
                  value={formData.gruppoSanguigno}
                  onChange={handleChange}
                />
              </div>

              {/* Allergie */}
              <div className="form-group">
                <label className="form-label">Allergie</label>
                <input
                  type="text"
                  name="allergie"
                  className="form-control"
                  value={formData.allergie}
                  onChange={handleChange}
                />
              </div>

              {/* Patologie */}
              <div className="form-group">
                <label className="form-label">Patologie</label>
                <input
                  type="text"
                  name="patologie"
                  className="form-control"
                  value={formData.patologie}
                  onChange={handleChange}
                />
              </div>

              {/* Stato */}
              <div className="form-group">
                <label className="form-label">Stato</label>
                <select
                  name="stato"
                  className="form-control"
                  value={formData.stato}
                  onChange={handleChange}
                >
                  {statoOptions.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Note Generali */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Note Generali</label>
                <input
                  type="text"
                  name="noteGenerali"
                  className="form-control"
                  value={formData.noteGenerali}
                  onChange={handleChange}
                />
              </div>

              {/* Note Private */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Note Private</label>
                <input
                  type="text"
                  name="notePrivate"
                  className="form-control"
                  value={formData.notePrivate}
                  onChange={handleChange}
                />
              </div>

              {/* Proprietario con ricerca */}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Proprietario</label>
                <div ref={searchRef} style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className={`form-control ${hasError('proprietarioId') ? 'is-invalid' : ''}`}
                      placeholder="Cerca per nome o cognome..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => {
                        if (searchTerm.length >= 1) {
                          setShowSuggestions(suggestions.length > 0);
                        }
                      }}
                    />
                    {searchLoading && (
                      <div style={{ 
                        position: 'absolute', 
                        right: '10px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        fontSize: '12px',
                        color: 'var(--gray-500)' 
                      }}>
                        Cercando...
                      </div>
                    )}
                  </div>
                  {hasError('proprietarioId') && <div className="form-error">{errors.proprietarioId}</div>}
                  
                  {/* Dropdown suggerimenti */}
                  {showSuggestions && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--white)',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius)',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 10,
                      boxShadow: 'var(--shadow-md)',
                      marginTop: '2px'
                    }}>
                      {suggestions.map(p => (
                        <div
                          key={p.id}
                          style={{
                            padding: '8px 14px',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                            borderBottom: '1px solid var(--gray-100)'
                          }}
                          onClick={() => selectProprietario(p)}
                          onMouseEnter={(e) => e.target.style.background = 'var(--gray-50)'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 500 }}>{p.nome} {p.cognome}</div>
                          <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                            {p.email} • {p.telefono}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedProprietario && (
                  <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--gray-500)' }}>
                    Proprietario selezionato: <strong>{selectedProprietario.nome} {selectedProprietario.cognome}</strong>
                  </div>
                )}
              </div>
            </div>
          </FormModal>
  );
}

export default AnimaleCreate;