// Common validation utility functions

export const validateRequired = (value, fieldName) => {
  return !value ? `${fieldName} è obbligatorio.` : '';
};

export const validateEmail = (value) => {
  if (!value) return 'L\'email è obbligatoria.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Inserisci un\'email valida.';
  return '';
};

export const validatePhone = (value) => {
  if (!value) return 'Il telefono è obbligatorio.';
  if (!/^[0-9+\s-]{6,15}$/.test(value)) return 'Inserisci un numero di telefono valido.';
  return '';
};

export const validateFiscalCode = (value) => {
  if (value && !/^[A-Z0-9]{16}$/i.test(value)) return 'Il codice fiscale deve essere di 16 caratteri alfanumerici.';
  return '';
};

export const validateMicrochip = (value) => {
  if (value && value.length !== 15) return 'Il microchip deve avere esattamente 15 caratteri.';
  if (value && !/^[0-9]{15}$/.test(value)) return 'Il microchip deve contenere solo numeri.';
  return '';
};

export const validatePositiveNumber = (value, fieldName) => {
  if (!value) return `${fieldName} è obbligatorio.`;
  if (isNaN(value) || parseFloat(value) <= 0) return `Inserisci un ${fieldName.toLowerCase()} valido.`;
  return '';
};

export const capitalizeFirstLetter = (string) => {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export const validateFormFields = (formData, fieldsToValidate, validateField) => {
  const newErrors = {};
  
  fieldsToValidate.forEach(field => {
    const error = validateField(field, formData[field]);
    if (error) newErrors[field] = error;
  });
  
  return newErrors;
};