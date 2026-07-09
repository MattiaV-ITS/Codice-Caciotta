import React, { useState } from 'react';

function ProprietarioCreate({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    codiceFiscale: '',
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    indirizzo: '',
    citta: '',
    // dataRegistrazione e stato non sono più nel form, verranno impostati al submit
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validazione campo singolo
  const validateField = (name, value) => {
    switch (name) {
      case 'nome':
        return !value ? 'Il nome è obbligatorio.' : '';
      case 'cognome':
        return !value ? 'Il cognome è obbligatorio.' : '';
      case 'email':
        if (!value) return 'L\'email è obbligatoria.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Inserisci un\'email valida.';
        return '';
      case 'telefono':
        if (!value) return 'Il telefono è obbligatorio.';
        if (!/^[0-9+\s-]{6,15}$/.test(value)) return 'Inserisci un numero di telefono valido.';
        return '';
      case 'indirizzo':
        return !value ? 'L\'indirizzo è obbligatorio.' : '';
      case 'citta':
        return !value ? 'La città è obbligatoria.' : '';
      case 'codiceFiscale':
        if (value && !/^[A-Z0-9]{16}$/i.test(value)) return 'Il codice fiscale deve essere di 16 caratteri alfanumerici.';
        return '';
      default:
        return '';
    }
  };

  // Validazione tutti i campi del form
  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = ['nome', 'cognome', 'email', 'telefono', 'indirizzo', 'citta'];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (formData.codiceFiscale) {
      const cfError = validateField('codiceFiscale', formData.codiceFiscale);
      if (cfError) newErrors.codiceFiscale = cfError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Marca tutti i campi come toccati
    const allTouched = {};
    ['nome', 'cognome', 'email', 'telefono', 'indirizzo', 'citta'].forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      // Crea il payload con data e stato automatici
      const payload = {
        ...formData,
        dataRegistrazione: new Date().toISOString().split('T')[0], // Data corrente
        stato: true // Sempre attivo
      };

      onSuccess(payload);
      onClose();
    }
  };

  const hasError = (field) => touched[field] && errors[field];

  return (
    <div className="proprietario-modal-overlay" onClick={onClose}>
      <div className="proprietario-modal" onClick={(e) => e.stopPropagation()}>
        <div className="proprietario-modal-header">
          <h3>Nuovo Proprietario</h3>
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

              {/* Cognome */}
              <div className="form-group">
                <label className="form-label">Cognome *</label>
                <input
                  type="text"
                  name="cognome"
                  className={`form-control ${hasError('cognome') ? 'is-invalid' : ''}`}
                  value={formData.cognome}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {hasError('cognome') && <div className="form-error">{errors.cognome}</div>}
              </div>

              {/* Codice Fiscale */}
              <div className="form-group">
                <label className="form-label">Codice Fiscale</label>
                <input
                  type="text"
                  name="codiceFiscale"
                  className={`form-control ${hasError('codiceFiscale') ? 'is-invalid' : ''}`}
                  value={formData.codiceFiscale}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength="16"
                  placeholder="16 caratteri alfanumerici"
                />
                {hasError('codiceFiscale') && <div className="form-error">{errors.codiceFiscale}</div>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${hasError('email') ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {hasError('email') && <div className="form-error">{errors.email}</div>}
              </div>

              {/* Telefono */}
              <div className="form-group">
                <label className="form-label">Telefono *</label>
                <input
                  type="text"
                  name="telefono"
                  className={`form-control ${hasError('telefono') ? 'is-invalid' : ''}`}
                  value={formData.telefono}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="es. 3331234567"
                />
                {hasError('telefono') && <div className="form-error">{errors.telefono}</div>}
              </div>

              {/* Indirizzo */}
              <div className="form-group">
                <label className="form-label">Indirizzo *</label>
                <input
                  type="text"
                  name="indirizzo"
                  className={`form-control ${hasError('indirizzo') ? 'is-invalid' : ''}`}
                  value={formData.indirizzo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {hasError('indirizzo') && <div className="form-error">{errors.indirizzo}</div>}
              </div>

              {/* Città */}
              <div className="form-group">
                <label className="form-label">Città *</label>
                <input
                  type="text"
                  name="citta"
                  className={`form-control ${hasError('citta') ? 'is-invalid' : ''}`}
                  value={formData.citta}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {hasError('citta') && <div className="form-error">{errors.citta}</div>}
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

export default ProprietarioCreate;