/**
 * Funzioni utili per la gestione delle date
 */

/**
 * Parsing sicuro di una stringa data
 */
const createLocalDate = (year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0) => {
  return new Date(year, month - 1, day, hour, minute, second, millisecond);
};

export const parseDate = (dateStr) => {
  if (!dateStr) return null;

  const cleaned = dateStr.trim();
  if (!cleaned) return null;

  const italianDateTimeMatch = cleaned.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (italianDateTimeMatch) {
    const [, day, month, year, hour = '00', minute = '00', second = '00'] = italianDateTimeMatch;
    const date = createLocalDate(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
    return isNaN(date.getTime()) ? null : date;
  }

  const isoDateTimeMatch = cleaned.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?)?$/
  );
  if (isoDateTimeMatch && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(cleaned)) {
    const [, year, month, day, hour = '00', minute = '00', second = '00'] = isoDateTimeMatch;
    const date = createLocalDate(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
    return isNaN(date.getTime()) ? null : date;
  }

  // Parsing diretto (ISO)
  let date = new Date(cleaned);

  // Parsing formato italiano DD/MM/YYYY
  if (isNaN(date.getTime()) && cleaned.includes('/')) {
    const parts = cleaned.split('/');
    if (parts.length === 3) {
      const isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      date = new Date(isoDate);
    }
  }

  // Fallback finale per stringhe non riconosciute esplicitamente
  if (isNaN(date.getTime()) && !cleaned.endsWith('Z')) {
    date = new Date(cleaned + 'Z');
  }

  return isNaN(date.getTime()) ? null : date;
};

/**
 * Formatta una data in formato italiano
 */
export const formatDate = (dateStr) => {
  const date = parseDate(dateStr);
  return date
    ? date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '-';
};

/**
 * Formatta una data in formato breve
 */
export const formatDateShort = (dateStr) => {
  const date = parseDate(dateStr);
  return date
    ? date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
    : '-';
};

/**
 * Estrae l'orario da una stringa data
 */
export const formatTime = (dateStr) => {
  const date = parseDate(dateStr);
  return date
    ? date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    : '-';
};

/**
 * Converte DD/MM/YYYY → YYYY-MM-DD
 */
export const toISODateFormat = (italianDate) => {
  if (!italianDate) return '';

  if (/^\d{4}-\d{2}-\d{2}/.test(italianDate)) return italianDate;

  if (italianDate.includes('/')) {
    const datePart = italianDate.split(' ')[0];
    const parts = datePart.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  if (italianDate.includes('T')) {
    return italianDate.split('T')[0];
  }

  return italianDate;
};

/**
 * Converte datetime italiano → ISO
 */
export const toISODatetimeFormat = (italianDatetime) => {
  if (!italianDatetime) return '';

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(italianDatetime)) return italianDatetime;

  if (italianDatetime.includes('/') && italianDatetime.includes(':')) {
    const [datePart, timePart] = italianDatetime.split(' ');
    const dateParts = datePart.split('/');
    if (dateParts.length === 3) {
      const isoDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
      return `${isoDate}T${timePart}`;
    }
  }

  if (italianDatetime.includes('/')) {
    return `${toISODateFormat(italianDatetime)}T00:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(italianDatetime)) {
    return `${italianDatetime}T00:00`;
  }

  return italianDatetime;
};

/**
 * Converte datetime ISO → formato italiano
 */
export const toItalianDatetimeFormat = (isoDatetime) => {
  if (!isoDatetime) return '';

  try {
    const date = new Date(isoDatetime);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
};

/**
 * Restituisce la data corrente in formato ISO
 */
export const getCurrentISODate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Restituisce datetime corrente in formato ISO senza timezone
 */
export const getCurrentISODatetime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().slice(0, 16);
};

/**
 * Confronto tra due date
 */
export const compareDates = (dateStr1, dateStr2) => {
  const date1 = parseDate(dateStr1);
  const date2 = parseDate(dateStr2);

  if (!date1 && !date2) return 0;
  if (!date1) return 1;
  if (!date2) return -1;

  return date1.getTime() - date2.getTime();
};

/**
 * Verifica validità di una data
 */
export const isValidDate = (dateStr) => {
  return parseDate(dateStr) !== null;
};
