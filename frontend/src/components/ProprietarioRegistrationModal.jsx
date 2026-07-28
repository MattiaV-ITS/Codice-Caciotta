import React, { useState } from 'react';
import FormModal from './FormModal/FormModal';
import { validateRequired, validateEmail, validatePhone, validateFiscalCode } from '../utils/validationUtils';
import { getCurrentISODate } from '../utils/dateUtils';
import { useApi } from '../services/apiService';

function ProprietarioRegistrationModal({ onClose, onSuccess, onSkip }) {
  const { post } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState({
    codiceFiscale: '',
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    indirizzo: '',
    citta: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validazione campo singolo
  const validateField = (name, value) => {
    switch (name) {
      case 'nome':
        return validateRequired(value, 'Il nome');
      case 'cognome':
        return validateRequired(value, 'Il cognome');
      case 'email':
        return validateEmail(value);
      case 'telefono':
        return validatePhone(value);
      case 'indirizzo':
        return validateRequired(value, "L'indirizzo");
      case 'citta':
        return validateRequired(value, 'La città');
      case 'codiceFiscale':
        return validateFiscalCode(value);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marca tutti i campi come toccati
    const allTouched = {};
    ['nome', 'cognome', 'email', 'telefono', 'indirizzo', 'citta'].forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        // Crea il payload con data e stato automatici
        const payload = {
          ...formData,
          dataRegistrazione: getCurrentISODate(), // Data corrente
          stato: true, // Sempre attivo
          codiceFiscale: formData.codiceFiscale?.trim() || null
        };

        // Chiamata API per creare il proprietario
        const response = await post('/api/auth/create-proprietario', payload);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create proprietario');
        }

        const createdProprietario = await response.json();
        
        // Chiamata onSuccess con il proprietario creato
        onSuccess(createdProprietario);
        onClose();
        
      } catch (error) {
        logger.error('Errore nella creazione del proprietario:', error);
        setSubmitError(error.message || 'Si è verificato un errore durante la creazione del proprietario');
        setIsSubmitting(false);
      }
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
    onClose();
  };

  const hasError = (field) => touched[field] && errors[field];

  return (
    <FormModal
      title="Crea il tuo profilo proprietario"
      onClose={onClose}
      isSubmitting={isSubmitting}
      submitLabel="Crea Proprietario"
      showCancelButton={true}
      cancelLabel="Salta"
      onSubmit={handleSubmit}
      submitError={submitError}
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
                <label className="form-label">Codice Fiscale (opzionale)</label>
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
          </FormModal>
  );
}

export default ProprietarioRegistrationModal;
