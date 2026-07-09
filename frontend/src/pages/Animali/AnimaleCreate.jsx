import React, { useState, useEffect, useRef } from 'react';

// ==============================
// MOCK PROPRIETARI (per la ricerca)
// ==============================
const MOCK_PROPRIETARI = [
  { id: 1, nome: 'Mario', cognome: 'Rossi', email: 'mario.rossi@email.it', telefono: '3331234567' },
  { id: 2, nome: 'Laura', cognome: 'Bianchi', email: 'laura.bianchi@email.it', telefono: '3349876543' },
  { id: 3, nome: 'Giuseppe', cognome: 'Verdi', email: 'giuseppe.verdi@email.it', telefono: '3354567890' },
  { id: 4, nome: 'Maria', cognome: 'Neri', email: 'maria.neri@email.it', telefono: '3367890123' },
  { id: 5, nome: 'Antonio', cognome: 'Ferrari', email: 'antonio.ferrari@email.it', telefono: '3378901234' },
  { id: 6, nome: 'Sofia', cognome: 'Esposito', email: 'sofia.esposito@email.it', telefono: '3389012345' },
  { id: 7, nome: 'Francesco', cognome: 'Romano', email: 'francesco.romano@email.it', telefono: '3390123456' },
  { id: 8, nome: 'Elena', cognome: 'Greco', email: 'elena.greco@email.it', telefono: '3401234567' },
];

function AnimaleCreate({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nome: '',
    specie: '',
    specificaSpecie: '',
    razza: '',
    dataNascita: '',
    sesso: '', // Nessun default → obbligatorio
    peso: '',
    microchip: '',
    taglia: 'ALTRO_SCONOSCIUTA', // Default: Altro/Sconosciuta
    coloreMantello: '',
    sterilizzato: false,
    gruppoSanguigno: '',
    allergie: '',
    patologie: '',
    stato: 'SANO',
    noteGenerali: '',
    notePrivate: '',
    proprietarioId: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProprietario, setSelectedProprietario] = useState(null);
  const searchRef = useRef(null);

  const specieOptions = ['cane', 'gatto', 'altro'];
  const sessoOptions = [
    { value: 'M', label: 'Maschio' },
    { value: 'F', label: 'Femmina' },
    { value: 'ALTRO_SCONOSCIUTO', label: 'Altro/Sconosciuto' }
  ];
  const tagliaOptions = [
    { value: 'PICCOLA', label: 'Piccola' },
    { value: 'MEDIA', label: 'Media' },
    { value: 'GRANDE', label: 'Grande' },
    { value: 'ALTRO_SCONOSCIUTA', label: 'Altro/Sconosciuta' }
  ];
  const statoOptions = [
    { value: 'SANO', label: 'Sano' },
    { value: 'MALATO', label: 'Malato' },
    { value: 'IN_CURA', label: 'In cura' },
    { value: 'DECEDUTO', label: 'Deceduto' }
  ];

  // Ricerca proprietari
  useEffect(() => {
    if (searchTerm.length >= 1) {
      const term = searchTerm.trim();
      const parts = term.split(/\s+/).filter(p => p.length > 0);
      let filtered;

      if (parts.length === 1) {
        const word = parts[0].toLowerCase();
        filtered = MOCK_PROPRIETARI.filter(p =>
          p.nome.toLowerCase().startsWith(word) ||
          p.cognome.toLowerCase().startsWith(word)
        );
      } else if (parts.length >= 2) {
        const firstName = parts[0].toLowerCase();
        const lastName = parts.slice(1).join(' ').toLowerCase();
        filtered = MOCK_PROPRIETARI.filter(p =>
          p.nome.toLowerCase().startsWith(firstName) &&
          p.cognome.toLowerCase().startsWith(lastName)
        );
      }

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
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
  const validateField = (name, value) => {
    switch (name) {
      case 'nome':
        return !value ? 'Il nome è obbligatorio.' : '';
      case 'specie':
        if (!value) return 'La specie è obbligatoria.';
        if (value === 'altro' && !formData.specificaSpecie.trim()) {
          return 'Specifica il tipo di animale.';
        }
        return '';
      case 'dataNascita':
        return !value ? 'La data di nascita è obbligatoria.' : '';
      case 'peso':
        if (!value) return 'Il peso è obbligatorio.';
        if (isNaN(value) || parseFloat(value) <= 0) return 'Inserisci un peso valido.';
        return '';
      case 'microchip':
        if (value && value.length !== 15) return 'Il microchip deve avere esattamente 15 caratteri.';
        if (value && !/^[0-9]{15}$/.test(value)) return 'Il microchip deve contenere solo numeri.';
        return '';
      case 'sesso':
        return !value ? 'Seleziona il sesso.' : '';
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

    if (formData.specie === 'altro' && !formData.specificaSpecie.trim()) {
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
    
    setFormData(prev => ({ ...prev, [name]: newValue }));

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const allTouched = {};
    ['nome', 'specie', 'dataNascita', 'peso', 'sesso'].forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      const payload = {
        ...formData,
        peso: parseFloat(formData.peso),
        sterilizzato: formData.sterilizzato || false,
        stato: formData.stato || 'SANO',
        proprietarioId: parseInt(formData.proprietarioId)
      };

      onSuccess(payload);
      onClose();
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

  const showSpecificaSpecie = formData.specie === 'altro';

  return (
    <div className="proprietario-modal-overlay" onClick={onClose}>
      <div className="proprietario-modal" onClick={(e) => e.stopPropagation()}>
        <div className="proprietario-modal-header">
          <h3>Nuovo Animale</h3>
          <button className="proprietario-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="proprietario-modal-body">
          <form onSubmit={handleSubmit} className="proprietario-form">
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

            {/* Pulsanti */}
            <div className="proprietario-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancella
              </button>
              <button type="submit" className="btn btn-primary">
                Aggiungi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AnimaleCreate;