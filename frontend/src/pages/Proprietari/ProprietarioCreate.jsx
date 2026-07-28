import React, { useState, useEffect } from 'react';
import FormModal from '../../components/FormModal/FormModal';
import { validateRequired, validateEmail, validatePhone, validateFiscalCode } from '../../utils/validationUtils';
import { getCurrentISODate } from '../../utils/dateUtils';
import { useApi } from '../../services/apiService';

function ProprietarioCreate({ onClose, onSuccess, proprietario, isEditMode = false }) {
  const { post, put, patch } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState(() => {
    if (isEditMode && proprietario) {
      return {
        codiceFiscale: proprietario.codiceFiscale || '',
        nome: proprietario.nome || '',
        cognome: proprietario.cognome || '',
        email: proprietario.email || '',
        telefono: proprietario.telefono || '',
        indirizzo: proprietario.indirizzo || '',
        citta: proprietario.citta || '',
      };
    }
    
    return {
      codiceFiscale: '',
      nome: '',
      cognome: '',
      email: '',
      telefono: '',
      indirizzo: '',
      citta: '',
    };
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
        return validateRequired(value, 'La cittÃ ');
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

        // Chiamata API per creare o aggiornare il proprietario
        const url = isEditMode && proprietario?.id ? `/api/proprietari/${proprietario.id}` : '/api/proprietari';
        const response = isEditMode && proprietario?.id
          ? await patch(url, payload)
          : await post(url, payload);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create proprietario');
        }

        const createdProprietario = await response.json();
        
        // Chiamata onSuccess con il proprietario creato
        onSuccess(createdProprietario);
        onClose();
        
      } catch (error) {
        logger.error(isEditMode ? 'Errore nell\'aggiornamento del proprietario:' : 'Errore nella creazione del proprietario:', error);
        setSubmitError(error.message || (isEditMode ? 'Si Ã¨ verificato un errore durante l\'aggiornamento del proprietario' : 'Si Ã¨ verificato un errore durante la creazione del proprietario'));
        setIsSubmitting(false);
      }
    }
  };

  const hasError = (field) => touched[field] && errors[field];

  return (
    <FormModal
      title={isEditMode ? "Modifica Proprietario" : "Nuovo Proprietario"}
      submitLabel={isEditMode ? "Salva" : "Aggiungi"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      submitError={submitError}
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

              {/* CittÃ  */}
              <div className="form-group">
                <label className="form-label">CittÃ  *</label>
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

export default ProprietarioCreate;
