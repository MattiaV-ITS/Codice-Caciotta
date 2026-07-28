/**
 * Configurazione Globale del Logging
 * Disabilita i log verbose in produzione
 */

const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Sovrascrivi i metodi della console in produzione
if (isProduction) {
  // Sopprimere i log di debug
  console.debug = () => {};
  
  // Sopprimere i log di info
  console.info = () => {};
  
  // Sopprimere i log
  console.log = () => {};
  
  // Mantieni warn e error per il monitoraggio
  // console.warn e console.error rimangono attivi per i problemi critici
}

// Aggiungi timestamp ai log di errore
const originalError = console.error;
console.error = function(...args) {
  if (!isProduction) {
    originalError.apply(console, [`[${new Date().toISOString()}]`, ...args]);
  }
};

const originalWarn = console.warn;
console.warn = function(...args) {
  if (!isProduction) {
    originalWarn.apply(console, [`[${new Date().toISOString()}]`, ...args]);
  }
};

export { isDev, isProduction };
