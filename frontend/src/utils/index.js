/**
 * Utility function per formattare una stringa di data in un formato più leggibile.
 * @param {string} dateStr - La stringa di data da formattare.
 * @returns {string} - La stringa di data formattata o '-' se l'input è invalido.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Utility function per ottenere la prima lettera di una parola in maiuscolo.
 * @param {string} word - La parola da cui estrarre la prima lettera.
 * @returns {string} - La prima lettera in maiuscolo o '?' se l'input è invalido.
 */
export const getIconLetter = (word) => {
  if (!word) return '?';
  return word.charAt(0).toUpperCase();
};









