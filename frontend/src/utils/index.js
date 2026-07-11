// Re-export date utilities from dedicated file
export { 
  formatDate, 
  toISODateFormat, 
  toISODatetimeFormat, 
  toItalianDatetimeFormat 
} from './dateUtils';

/**
 * Utility function per ottenere la prima lettera di una parola in maiuscolo.
 * @param {string} word - La parola da cui estrarre la prima lettera.
 * @returns {string} - La prima lettera in maiuscolo o '?' se l'input è invalido.
 */
export const getIconLetter = (word) => {
  if (!word) return '?';
  return word.charAt(0).toUpperCase();
};









