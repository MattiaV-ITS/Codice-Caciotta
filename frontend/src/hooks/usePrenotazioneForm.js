import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../services/apiService';
import { toISODatetimeFormat, toISODateFormat } from '../utils/dateUtils';

/**
 * Hook condiviso per la creazione di prenotazioni
 * Utilizzato sia da PrenotazioneCreateStaff che da PrenotazioneCreateUser
 */
export function usePrenotazioneForm({ onClose, onSuccess }) {
  const { get, post } = useApi();

  // Reference data
  const [prestazioni, setPrestazioni] = useState([]);
  const [loadingPrestazioni, setLoadingPrestazioni] = useState(true);
  const [errorPrestazioni, setErrorPrestazioni] = useState(null);
  const [prenotazioniEsistenti, setPrenotazioniEsistenti] = useState([]);
  const [studioHours, setStudioHours] = useState([]);
  const [specificOrari, setSpecificOrari] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [loadingBlockedTimes, setLoadingBlockedTimes] = useState(true);

  // Solo prestazioni disponibili per nuove prenotazioni
  const availablePrestazioni = Array.isArray(prestazioni)
    ? prestazioni.filter(p => p.stato === true)
    : [];

  // Form state
  const [formData, setFormData] = useState({
    dataOraAppuntamento: '',
    tipoVisita: '',
    specificaTipoVisita: '',
    animaleId: '',
    proprietarioId: '',
    note: ''
  });

  // Date/time selection state
  const [selectedDate, setSelectedDate] = useState('');
  const [availableHours, setAvailableHours] = useState([]);
  const [selectedPrestazioneDuration, setSelectedPrestazioneDuration] = useState(30);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch reference data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch prenotazioni esistenti
        const prenotazioniResponse = await get('/api/prenotazioni');
        if (prenotazioniResponse.ok) {
          const data = await prenotazioniResponse.json();
          setPrenotazioniEsistenti(Array.isArray(data) ? data : (data.content || []));
        }

        // Fetch prestazioni (tutte per mantenere storico prenotazioni esistenti)
        const prestazioniResponse = await get('/api/prestazioni');
        if (prestazioniResponse.ok) {
          const data = await prestazioniResponse.json();
          setPrestazioni(Array.isArray(data) ? data : (data.content || []));
        }

        // Fetch studio hours (default + specific date overrides)
        const studioHoursResponse = await get('/api/admin/orari');
        if (studioHoursResponse.ok) {
          const data = await studioHoursResponse.json();
          setStudioHours(data.defaultOrari || []);
          setSpecificOrari(data.specificOrari || []);
        }

        setLoadingPrestazioni(false);
      } catch (error) {
        logger.error('Error fetching reference data:', error);
        setErrorPrestazioni('Errore nel caricamento dei dati');
        setLoadingPrestazioni(false);
      }
    };

    fetchData();
  }, [get]);

  // Fetch blocked times when date changes
  useEffect(() => {
    const fetchBlockedTimes = async () => {
      if (selectedDate) {
        try {
          setLoadingBlockedTimes(true);
          const response = await get('/api/admin/orari/bloccati');
          if (response.ok) {
            const data = await response.json();
            setBlockedTimes(data || []);
          }
        } catch (error) {
          logger.error('Error fetching blocked times:', error);
        } finally {
          setLoadingBlockedTimes(false);
        }
      }
    };
    fetchBlockedTimes();
  }, [selectedDate, get]);

  // ============================================================
  // HELPER FUNCTIONS (from PrenotazioneCreateStaff)
  // ============================================================
  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  const isTimeSlotBlocked = (date, hour) => {
    if (!selectedDate || !blockedTimes || !Array.isArray(blockedTimes)) return false;
    const [hourPart, minutePart] = hour.split(':').map(Number);
    const appointmentDateTime = new Date(selectedDate);
    appointmentDateTime.setHours(hourPart, minutePart, 0, 0);
    return blockedTimes.some(blocked => {
      try {
        const blockedDate = new Date(blocked.data);
        if (isSameDay(blockedDate, appointmentDateTime)) {
          const [blockedStartHour, blockedStartMin] = blocked.oraInizio.split(':').map(Number);
          const [blockedEndHour, blockedEndMin] = blocked.oraFine.split(':').map(Number);
          const blockedStart = new Date(blockedDate);
          blockedStart.setHours(blockedStartHour, blockedStartMin, 0, 0);
          const blockedEnd = new Date(blockedDate);
          blockedEnd.setHours(blockedEndHour, blockedEndMin, 0, 0);
          return appointmentDateTime >= blockedStart && appointmentDateTime < blockedEnd;
        }
        return false;
      } catch { return false; }
    });
  };

  const isStudioClosed = (date, hour) => {
    if (!selectedDate || !studioHours || !Array.isArray(studioHours)) return false;
    try {
      const [hourPart] = hour.split(':').map(Number);
      const appointmentDate = new Date(selectedDate);
      const dayOfWeek = appointmentDate.getDay();
      const daysOfWeek = ['DOMENICA', 'LUNEDI', 'MARTEDI', 'MERCOLEDI', 'GIOVEDI', 'VENERDI', 'SABATO'];
      const dayName = daysOfWeek[dayOfWeek];

      // First check if there's a specific date override for this date
      const dateStr = selectedDate; // already in YYYY-MM-DD format
      const specificOverride = Array.isArray(specificOrari)
        ? specificOrari.find(h => h.dataSpecifica === dateStr)
        : null;

      if (specificOverride) {
        // If the specific override marks the day as closed, it's closed
        if (specificOverride.chiuso) return true;
        // Otherwise use the specific override hours
        const [openHour, openMin] = specificOverride.oraApertura.split(':').map(Number);
        const [closeHour, closeMin] = specificOverride.oraChiusura.split(':').map(Number);
        const appointmentTimeInMinutes = hourPart * 60;
        const openTimeInMinutes = openHour * 60 + openMin;
        const closeTimeInMinutes = closeHour * 60 + closeMin;
        if (appointmentTimeInMinutes < openTimeInMinutes || appointmentTimeInMinutes >= closeTimeInMinutes) return true;
        if (specificOverride.oraInizioPausaPranzo && specificOverride.oraFinePausaPranzo) {
          const [lunchStartHour, lunchStartMin] = specificOverride.oraInizioPausaPranzo.split(':').map(Number);
          const [lunchEndHour, lunchEndMin] = specificOverride.oraFinePausaPranzo.split(':').map(Number);
          const lunchStartInMinutes = lunchStartHour * 60 + lunchStartMin;
          const lunchEndInMinutes = lunchEndHour * 60 + lunchEndMin;
          if (appointmentTimeInMinutes >= lunchStartInMinutes && appointmentTimeInMinutes < lunchEndInMinutes) return true;
        }
        return false;
      }

      // No specific override, fall back to default weekly hours
      const dayHours = studioHours.find(h => h.giornoSettimana === dayName);
      if (!dayHours) return true;
      if (dayHours.chiuso) return true;
      const [openHour, openMin] = dayHours.oraApertura.split(':').map(Number);
      const [closeHour, closeMin] = dayHours.oraChiusura.split(':').map(Number);
      const appointmentTimeInMinutes = hourPart * 60;
      const openTimeInMinutes = openHour * 60 + openMin;
      const closeTimeInMinutes = closeHour * 60 + closeMin;
      if (appointmentTimeInMinutes < openTimeInMinutes || appointmentTimeInMinutes >= closeTimeInMinutes) return true;
      if (dayHours.oraInizioPausaPranzo && dayHours.oraFinePausaPranzo) {
        const [lunchStartHour, lunchStartMin] = dayHours.oraInizioPausaPranzo.split(':').map(Number);
        const [lunchEndHour, lunchEndMin] = dayHours.oraFinePausaPranzo.split(':').map(Number);
        const lunchStartInMinutes = lunchStartHour * 60 + lunchStartMin;
        const lunchEndInMinutes = lunchEndHour * 60 + lunchEndMin;
        if (appointmentTimeInMinutes >= lunchStartInMinutes && appointmentTimeInMinutes < lunchEndInMinutes) return true;
      }
      return false;
    } catch { return false; }
  };

  const isOpeningHoursEnough = (date, startMinutes, endMinutes) => {
    if (!date || !studioHours || !Array.isArray(studioHours)) return false;
    try {
      const appointmentDate = new Date(date);
      const dayOfWeek = appointmentDate.getDay();
      const daysOfWeek = ['DOMENICA', 'LUNEDI', 'MARTEDI', 'MERCOLEDI', 'GIOVEDI', 'VENERDI', 'SABATO'];
      const dayName = daysOfWeek[dayOfWeek];

      // First check if there's a specific date override for this date
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      const specificOverride = Array.isArray(specificOrari)
        ? specificOrari.find(h => h.dataSpecifica === dateStr)
        : null;

      if (specificOverride) {
        if (specificOverride.chiuso) return false;
        const [openHour, openMin] = specificOverride.oraApertura.split(':').map(Number);
        const [closeHour, closeMin] = specificOverride.oraChiusura.split(':').map(Number);
        const openTimeInMinutes = openHour * 60 + openMin;
        const closeTimeInMinutes = closeHour * 60 + closeMin;
        if (startMinutes < openTimeInMinutes || endMinutes > closeTimeInMinutes) return false;
        if (specificOverride.oraInizioPausaPranzo && specificOverride.oraFinePausaPranzo) {
          const [lunchStartHour, lunchStartMin] = specificOverride.oraInizioPausaPranzo.split(':').map(Number);
          const [lunchEndHour, lunchEndMin] = specificOverride.oraFinePausaPranzo.split(':').map(Number);
          const lunchStartInMinutes = lunchStartHour * 60 + lunchStartMin;
          const lunchEndInMinutes = lunchEndHour * 60 + lunchEndMin;
          if (startMinutes < lunchEndInMinutes && endMinutes > lunchStartInMinutes) return false;
        }
        return true;
      }

      // No specific override, fall back to default weekly hours
      const dayHours = studioHours.find(h => h.giornoSettimana === dayName);
      if (!dayHours || dayHours.chiuso) return false;
      const [openHour, openMin] = dayHours.oraApertura.split(':').map(Number);
      const [closeHour, closeMin] = dayHours.oraChiusura.split(':').map(Number);
      const openTimeInMinutes = openHour * 60 + openMin;
      const closeTimeInMinutes = closeHour * 60 + closeMin;
      if (startMinutes < openTimeInMinutes || endMinutes > closeTimeInMinutes) return false;
      if (dayHours.oraInizioPausaPranzo && dayHours.oraFinePausaPranzo) {
        const [lunchStartHour, lunchStartMin] = dayHours.oraInizioPausaPranzo.split(':').map(Number);
        const [lunchEndHour, lunchEndMin] = dayHours.oraFinePausaPranzo.split(':').map(Number);
        const lunchStartInMinutes = lunchStartHour * 60 + lunchStartMin;
        const lunchEndInMinutes = lunchEndHour * 60 + lunchEndMin;
        if (startMinutes < lunchEndInMinutes && endMinutes > lunchStartInMinutes) return false;
      }
      return true;
    } catch { return false; }
  };

  const doesDurationOverlapBlocked = (date, hour, durationMinutes) => {
    if (!date || !blockedTimes || !Array.isArray(blockedTimes)) return false;
    const [startHour, startMin] = hour.split(':').map(Number);
    const appointmentStart = new Date(date);
    appointmentStart.setHours(startHour, startMin, 0, 0);
    const appointmentEnd = new Date(appointmentStart);
    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + durationMinutes);
    return blockedTimes.some(blocked => {
      try {
        const blockedDate = new Date(blocked.data);
        if (isSameDay(blockedDate, appointmentStart)) {
          const [blockedStartHour, blockedStartMin] = blocked.oraInizio.split(':').map(Number);
          const [blockedEndHour, blockedEndMin] = blocked.oraFine.split(':').map(Number);
          const blockedStart = new Date(blockedDate);
          blockedStart.setHours(blockedStartHour, blockedStartMin, 0, 0);
          const blockedEnd = new Date(blockedDate);
          blockedEnd.setHours(blockedEndHour, blockedEndMin, 0, 0);
          return appointmentStart < blockedEnd && appointmentEnd > blockedStart;
        }
        return false;
      } catch { return false; }
    });
  };

  // ============================================================
  // COMPUTE AVAILABLE HOURS
  // ============================================================
  useEffect(() => {
    if (selectedDate) {
      const allHours = [];
      for (let h = 8; h < 19; h++) {
        for (let m = 0; m < 60; m += 30) {
          const hourStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          allHours.push(hourStr);
        }
      }

      const available = allHours.filter(hour => {
        if (isStudioClosed(selectedDate, hour)) return false;
        if (isTimeSlotBlocked(selectedDate, hour)) return false;
        const [startHour, startMin] = hour.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = startMinutes + selectedPrestazioneDuration;
        if (!isOpeningHoursEnough(selectedDate, startMinutes, endMinutes)) return false;
        if (doesDurationOverlapBlocked(selectedDate, hour, selectedPrestazioneDuration)) return false;
        const occupiedHours = Array.isArray(prenotazioniEsistenti)
          ? prenotazioniEsistenti.filter(p => p.dataOraAppuntamento?.startsWith(selectedDate))
            .map(p => p.dataOraAppuntamento.substring(11, 16))
          : [];
        return !occupiedHours.includes(hour);
      });

      setAvailableHours(available);
    }
  }, [selectedDate, prenotazioniEsistenti, studioHours, blockedTimes, selectedPrestazioneDuration]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const updateSelectedPrestazioneDuration = useCallback((tipoVisita) => {
    if (tipoVisita && tipoVisita !== 'Altro') {
      const selected = availablePrestazioni.find(p => p.nomePrestazione === tipoVisita);
      if (selected && selected.durataStimata && selected.durataStimata > 0) {
        setSelectedPrestazioneDuration(selected.durataStimata);
        return;
      }
    }
    setSelectedPrestazioneDuration(30);
  }, [availablePrestazioni]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    const formattedDate = toISODateFormat(date);
    setSelectedDate(formattedDate);
    setFormData(prev => ({ ...prev, dataOraAppuntamento: '' }));
  };

  const handleHourSelect = (hour) => {
    const formattedDate = toISODateFormat(selectedDate);
    setFormData(prev => ({
      ...prev,
      dataOraAppuntamento: `${formattedDate}T${hour}:00`
    }));
    setTouched(prev => ({ ...prev, dataOraAppuntamento: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'tipoVisita') {
      updateSelectedPrestazioneDuration(value);
    }
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

  // ============================================================
  // VALIDATION
  // ============================================================
  const validateField = (name, value) => {
    switch (name) {
      case 'dataOraAppuntamento':
        return !value ? 'Seleziona data e ora.' : '';
      case 'tipoVisita':
        if (!value) return 'Seleziona un tipo di visita.';
        if (value === 'Altro') return '';
        if (value !== 'Altro' && !availablePrestazioni.some(p => p.nomePrestazione === value)) {
          return 'Seleziona una prestazione disponibile.';
        }
        return '';
      case 'specificaTipoVisita':
        if (formData.tipoVisita === 'Altro' && !value.trim()) {
          return 'Specifica il tipo di visita.';
        }
        return '';
      case 'animaleId':
        return !value ? 'Seleziona un animale.' : '';
      case 'proprietarioId':
        return !value ? 'Seleziona un proprietario.' : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = ['dataOraAppuntamento', 'tipoVisita', 'animaleId', 'proprietarioId'];
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    if (formData.tipoVisita === 'Altro' && !formData.specificaTipoVisita.trim()) {
      newErrors.specificaTipoVisita = 'Specifica il tipo di visita.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // SUBMIT
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {};
    ['dataOraAppuntamento', 'tipoVisita', 'animaleId', 'proprietarioId', 'specificaTipoVisita'].forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const finalDate = toISODatetimeFormat(formData.dataOraAppuntamento);
        const payload = {
          dataOraAppuntamento: finalDate,
          tipoVisita: formData.tipoVisita === 'Altro' ? formData.specificaTipoVisita : formData.tipoVisita,
          note: formData.note || '',
          animaleId: parseInt(formData.animaleId),
          proprietarioId: parseInt(formData.proprietarioId)
        };

        const response = await post('/api/prenotazioni', payload);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Errore nella creazione: ${response.status}`);
        }

        const createdPrenotazione = await response.json();
        if (onSuccess) onSuccess(createdPrenotazione);
        if (onClose) onClose();
      } catch (error) {
        logger.error('Error creating prenotazione:', error);
        setSubmitError(error.message || 'Errore nella creazione della prenotazione');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const hasError = (field) => touched[field] && errors[field];
  const hasSelectedDate = !!selectedDate;
  const isTipoVisitaSelected = !!formData.tipoVisita;
  const showSpecificaTipo = formData.tipoVisita === 'Altro';

  return {
    // Reference data
    prestazioni, loadingPrestazioni, errorPrestazioni, availablePrestazioni,
    // Form state
    formData, setFormData,
    errors, touched, hasError,
    isSubmitting, submitError,
    // Date/time
    selectedDate, availableHours, hasSelectedDate, isTipoVisitaSelected, showSpecificaTipo,
    // Handlers
    handleChange, handleBlur, handleDateChange, handleHourSelect, handleSubmit,
    // Setters (for component-specific logic)
    setSelectedDate, setErrors, setTouched,
  };
}
