/**
 * Utilità di Logging Sicura per la Produzione
 * I log vengono emessi solo in modalità sviluppo
 */

const isDev = process.env.NODE_ENV === 'development';

const logger = {
  /**
   * Log di debug - Informazioni dettagliate di debug
   * @param {string} messaggio - Messaggio da loggare
   * @param {*} dati - Dati aggiuntivi (opzionale)
   */
  debug: (messaggio, dati) => {
    if (isDev) console.debug(messaggio, dati);
  },
  
  /**
   * Log di informazione - Informazioni generali
   * @param {string} messaggio - Messaggio da loggare
   * @param {*} dati - Dati aggiuntivi (opzionale)
   */
  info: (messaggio, dati) => {
    if (isDev) console.info(messaggio, dati);
  },
  
  /**
   * Log di avvertimento - Avvertimenti non critici
   * @param {string} messaggio - Messaggio da loggare
   * @param {*} dati - Dati aggiuntivi (opzionale)
   */
  warn: (messaggio, dati) => {
    if (isDev) console.warn(messaggio, dati);
  },
  
  /**
   * Log di errore - Errori critici
   * @param {string} messaggio - Messaggio da loggare
   * @param {Error} errore - Oggetto errore
   */
  error: (messaggio, errore) => {
    // Sempre loggare gli errori per il monitoraggio, ma può essere soppresso se necessario
    if (isDev) {
      console.error(messaggio, errore);
    }
    // In produzione, potresti inviare a un servizio di tracciamento errori qui
    // es: Sentry.captureException(errore);
  }
};

export default logger;
