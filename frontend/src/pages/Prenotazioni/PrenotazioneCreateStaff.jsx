import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toISODatetimeFormat, toISODateFormat } from '../../utils/dateUtils';
import { useApi } from '../../services/apiService';
import FormModal from '../../components/FormModal/FormModal';

function PrenotazioneCreateStaff({ onClose, onSuccess }) {
  const { user } = useAuth();
  const { get, post } = useApi();
  const navigate = useNavigate();
  const isStaffOrAdmin = user?.roles?.includes('ROLE_STAFF') || user?.roles?.includes('ROLE_ADMIN');

  // State for reference data
  const [animali, setAnimali] = useState([]);
  const [loadingAnimali, setLoadingAnimali] = useState(true);
  const [errorAnimali, setErrorAnimali] = useState(null);
  const [prenotazioniEsistenti, setPrenotazioniEsistenti] = useState([]);
  const [loadingPrenotazioni, setLoadingPrenotazioni] = useState(true); // eslint-disable-line no-unused-vars
  const [errorPrenotazioni, setErrorPrenotazioni] = useState(null);
  const [proprietari, setProprietari] = useState([]);
  const [loadingProprietari, setLoadingProprietari] = useState(true);
  const [errorProprietari, setErrorProprietari] = useState(null);
  const [prestazioni, setPrestazioni] = useState([]);
  const [loadingPrestazioni, setLoadingPrestazioni] = useState(true);
  const [errorPrestazioni, setErrorPrestazioni] = useState(null);
  const [studioHours, setStudioHours] = useState([]);
  const [loadingStudioHours, setLoadingStudioHours] = useState(true);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [loadingBlockedTimes, setLoadingBlockedTimes] = useState(true);

  const [formData, setFormData] = useState({
    dataOraAppuntamento: '',
    tipoVisita: '',
    specificaTipoVisita: '',
    animaleId: '',
    proprietarioId: '',
    note: ''
  });

  // Initialize with API data
  useEffect(() => {
    const fetchData = async () => {
      try {

        // Note: We don't pre-fetch all animali anymore since we use server-side search
        // Initial animali state remains empty, data is fetched on-demand during search

        // Fetch prenotazioni esistenti
        const prenotazioniResponse = await get('/api/prenotazioni');
        if (prenotazioniResponse.ok) {
          const prenotazioniData = await prenotazioniResponse.json();
          // Handle both array and Spring Page response formats
          const prenotazioniArray = Array.isArray(prenotazioniData)
            ? prenotazioniData
            : (prenotazioniData.content && Array.isArray(prenotazioniData.content)
                ? prenotazioniData.content
                : []);
          setPrenotazioniEsistenti(prenotazioniArray);
        } else {
          console.error('Failed to fetch prenotazioni:', prenotazioniResponse.status);
          setErrorPrenotazioni(`Failed to load prenotazioni: ${prenotazioniResponse.status}`);
          setPrenotazioniEsistenti([]); // Ensure prenotazioni is always an array even on error
        }


        // Fetch prestazioni
        const prestazioniResponse = await get('/api/prestazioni');
        if (prestazioniResponse.ok) {
          const prestazioniData = await prestazioniResponse.json();
          // Handle both array and Spring Page response formats
          const prestazioniArray = Array.isArray(prestazioniData)
            ? prestazioniData
            : (prestazioniData.content && Array.isArray(prestazioniData.content)
                ? prestazioniData.content
                : []);
          setPrestazioni(prestazioniArray);
        } else {
          console.error('Failed to fetch prestazioni:', prestazioniResponse.status);
          setErrorPrestazioni(`Failed to load prestazioni: ${prestazioniResponse.status}`);
          setPrestazioni([]);
        }

        // Fetch studio hours
        const studioHoursResponse = await get('/api/admin/orari');
        if (studioHoursResponse.ok) {
          const studioHoursData = await studioHoursResponse.json();
          setStudioHours(studioHoursData.defaultOrari || []);
        } else {
          console.error('Failed to fetch studio hours:', studioHoursResponse.status);
          setStudioHours([]);
        }

        // Set loading states to false when all requests are done
        setLoadingAnimali(false);
        setLoadingPrenotazioni(false);
        setLoadingProprietari(false);
        setLoadingPrestazioni(false);
        setLoadingStudioHours(false);

      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorAnimali('Network error while loading animali');
        setErrorPrenotazioni('Network error while loading prenotazioni');
        setErrorProprietari('Network error while loading proprietari');
        setErrorPrestazioni('Network error while loading prestazioni');
        // Set loading states to false even if there's an error
        setLoadingAnimali(false);
        setLoadingPrenotazioni(false);
        setLoadingProprietari(false);
        setLoadingPrestazioni(false);
        setLoadingStudioHours(false);
      }
    };

    fetchData();
  }, [get]);

  // ============================================================
  // STATO PER ANIMALE (solo per STAFF/ADMIN con autocomplete)
  // ============================================================
  const [animaleSearchTerm, setAnimaleSearchTerm] = useState('');
  const [animaleSuggestions, setAnimaleSuggestions] = useState([]);
  const [showAnimaleSuggestions, setShowAnimaleSuggestions] = useState(false);
  const [selectedAnimale, setSelectedAnimale] = useState(null);
  const [activeAnimaleSuggestionIndex, setActiveAnimaleSuggestionIndex] = useState(-1);
  const animaleInputRef = useRef(null);
  const animaleDropdownRef = useRef(null);

  // ============================================================
  // STATO PER PROPRIETARIO (con autocomplete)
  // ============================================================
  const [proprietarioSearchTerm, setProprietarioSearchTerm] = useState('');
  const [proprietarioSuggestions, setProprietarioSuggestions] = useState([]);
  const [showProprietarioSuggestions, setShowProprietarioSuggestions] = useState(false);
  const [selectedProprietario, setSelectedProprietario] = useState(null);
  const [activeProprietarioSuggestionIndex, setActiveProprietarioSuggestionIndex] = useState(-1);
  const proprietarioInputRef = useRef(null);
  const proprietarioDropdownRef = useRef(null);

  // ============================================================
  // RICERCA ANIMALE (solo per STAFF/ADMIN) - Server-side search
  // ============================================================
  useEffect(() => {
    const searchAnimali = async () => {
      if (animaleSearchTerm.length >= 1) {
        try {
          
          // Build search parameters
          const params = new URLSearchParams();
          params.append('search', animaleSearchTerm);
          params.append('size', '10'); // Reasonable limit for suggestions
          
          // Filter by selected proprietario on the backend
          if (selectedProprietario?.id) {
            params.append('proprietarioId', selectedProprietario.id);
          }
          
          const response = await get(`/api/animali?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            const animaliContent = Array.isArray(data) 
              ? data 
              : (data.content && Array.isArray(data.content) 
                  ? data.content 
                  : []);
            
            // Transform data to match expected format
            const transformedAnimali = animaliContent.map(animale => {
              // The backend returns 'proprietario' as a concatenated string from the DTO
              const proprietarioNome = animale.proprietario && typeof animale.proprietario === 'string'
                ? animale.proprietario
                : (animale.idProprietario ? 'Caricamento...' : 'Sconosciuto');
              
              return {
                ...animale,
                proprietarioNome: proprietarioNome
              };
            });
            
            setAnimaleSuggestions(transformedAnimali);
            // Only show suggestions when no animal is currently selected, to prevent re-appearing after selection
            if (!selectedAnimale) {
              setShowAnimaleSuggestions(transformedAnimali.length > 0);
            }
          } else {
            console.error('Server search failed:', response.status);
            setAnimaleSuggestions([]);
            setShowAnimaleSuggestions(false);
          }
        } catch (error) {
          console.error('Error searching animali:', error);
          setAnimaleSuggestions([]);
          setShowAnimaleSuggestions(false);
        }
      } else {
        setAnimaleSuggestions([]);
        setShowAnimaleSuggestions(false);
      }
    };
    
    // Debounce the search to avoid excessive API calls
    const debounceTimer = setTimeout(searchAnimali, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [animaleSearchTerm, selectedProprietario]);

  // ============================================================
  // CHIUDI SUGGERIMENTI (solo per STAFF/ADMIN)
  // ============================================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (animaleDropdownRef.current && !animaleDropdownRef.current.contains(e.target) &&
          animaleInputRef.current && !animaleInputRef.current.contains(e.target)) {
        setShowAnimaleSuggestions(false);
      }
      if (proprietarioDropdownRef.current && !proprietarioDropdownRef.current.contains(e.target) &&
          proprietarioInputRef.current && !proprietarioInputRef.current.contains(e.target)) {
        setShowProprietarioSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================
  // RICERCA PROPRIETARIO - Server-side search
  // ============================================================
  useEffect(() => {
    const searchProprietari = async () => {
      if (proprietarioSearchTerm.length >= 1) {
        try {
          
          // Build search parameters
          const params = new URLSearchParams();
          params.append('search', proprietarioSearchTerm);
          params.append('size', '10'); // Reasonable limit for suggestions
          
          const response = await get(`/api/proprietari?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            const proprietariContent = Array.isArray(data) 
              ? data 
              : (data.content && Array.isArray(data.content) 
                  ? data.content 
                  : []);
            
            setProprietarioSuggestions(proprietariContent);
            setShowProprietarioSuggestions(proprietariContent.length > 0);
          } else {
            console.error('Server search failed:', response.status);
            setProprietarioSuggestions([]);
            setShowProprietarioSuggestions(false);
          }
        } catch (error) {
          console.error('Error searching proprietari:', error);
          setProprietarioSuggestions([]);
          setShowProprietarioSuggestions(false);
        }
      } else {
        setProprietarioSuggestions([]);
        setShowProprietarioSuggestions(false);
      }
    };
    
    // Debounce the search to avoid excessive API calls
    const debounceTimer = setTimeout(searchProprietari, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [proprietarioSearchTerm]);

  // ============================================================
  // CONTROLLO DATE/ORE LIBERE
  // ============================================================
  const [availableHours, setAvailableHours] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateError, setDateError] = useState(''); // eslint-disable-line no-unused-vars
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [selectedPrestazioneDuration, setSelectedPrestazioneDuration] = useState(30); // Default 30 minutes

  // Helper function to check if a time slot is blocked
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
      } catch (error) {
        console.error('Error checking blocked time:', error);
        return false;
      }
    });
  };

  // Helper function to check if studio is closed
  const isStudioClosed = (date, hour) => {
    if (!selectedDate || !studioHours || !Array.isArray(studioHours)) return false;

    try {
      const [hourPart] = hour.split(':').map(Number);
      const appointmentDate = new Date(selectedDate);
      const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Map day index to Italian day names
      const daysOfWeek = ['DOMENICA', 'LUNEDI', 'MARTEDI', 'MERCOLEDI', 'GIOVEDI', 'VENERDI', 'SABATO'];
      const dayName = daysOfWeek[dayOfWeek];

      const dayHours = studioHours.find(h => h.giornoSettimana === dayName);

      if (!dayHours) return true; // No hours defined for this day = closed

      if (dayHours.chiuso) return true; // Explicitly closed

      // Check if time is outside opening hours
      const [openHour, openMin] = dayHours.oraApertura.split(':').map(Number);
      const [closeHour, closeMin] = dayHours.oraChiusura.split(':').map(Number);

      const appointmentTimeInMinutes = hourPart * 60;
      const openTimeInMinutes = openHour * 60 + openMin;
      const closeTimeInMinutes = closeHour * 60 + closeMin;

      // Check if time is outside opening hours
      if (appointmentTimeInMinutes < openTimeInMinutes || appointmentTimeInMinutes >= closeTimeInMinutes) {
        return true;
      }

      // Check if time is during lunch break (only if lunch break is configured)
      if (dayHours.oraInizioPausaPranzo && dayHours.oraFinePausaPranzo) {
        const [lunchStartHour, lunchStartMin] = dayHours.oraInizioPausaPranzo.split(':').map(Number);
        const [lunchEndHour, lunchEndMin] = dayHours.oraFinePausaPranzo.split(':').map(Number);

        const lunchStartInMinutes = lunchStartHour * 60 + lunchStartMin;
        const lunchEndInMinutes = lunchEndHour * 60 + lunchEndMin;

        if (appointmentTimeInMinutes >= lunchStartInMinutes && appointmentTimeInMinutes < lunchEndInMinutes) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking studio hours:', error);
      return false;
    }
  };

  // Helper function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  // Helper function to check if the entire prestazione duration fits within opening hours
  const isOpeningHoursEnough = (date, startMinutes, endMinutes) => {
    if (!date || !studioHours || !Array.isArray(studioHours)) return false;

    try {
      const appointmentDate = new Date(date);
      const dayOfWeek = appointmentDate.getDay();
      const daysOfWeek = ['DOMENICA', 'LUNEDI', 'MARTEDI', 'MERCOLEDI', 'GIOVEDI', 'VENERDI', 'SABATO'];
      const dayName = daysOfWeek[dayOfWeek];
      const dayHours = studioHours.find(h => h.giornoSettimana === dayName);

      if (!dayHours || dayHours.chiuso) return false;

      const [openHour, openMin] = dayHours.oraApertura.split(':').map(Number);
      const [closeHour, closeMin] = dayHours.oraChiusura.split(':').map(Number);
      const openTimeInMinutes = openHour * 60 + openMin;
      const closeTimeInMinutes = closeHour * 60 + closeMin;

      // The entire duration must fit within opening hours
      if (startMinutes < openTimeInMinutes || endMinutes > closeTimeInMinutes) {
        return false;
      }

      // Check if the duration overlaps with lunch break
      if (dayHours.oraInizioPausaPranzo && dayHours.oraFinePausaPranzo) {
        const [lunchStartHour, lunchStartMin] = dayHours.oraInizioPausaPranzo.split(':').map(Number);
        const [lunchEndHour, lunchEndMin] = dayHours.oraFinePausaPranzo.split(':').map(Number);
        const lunchStartInMinutes = lunchStartHour * 60 + lunchStartMin;
        const lunchEndInMinutes = lunchEndHour * 60 + lunchEndMin;

        // The duration must not overlap with lunch break
        if (startMinutes < lunchEndInMinutes && endMinutes > lunchStartInMinutes) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking opening hours:', error);
      return false;
    }
  };

  // Helper function to check if the entire prestazione duration overlaps with blocked times
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

          // Check if the appointment duration overlaps with the blocked period
          return appointmentStart < blockedEnd && appointmentEnd > blockedStart;
        }
        return false;
      } catch (error) {
        console.error('Error checking blocked time overlap:', error);
        return false;
      }
    });
  };

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
          } else {
            console.error('Failed to fetch blocked times:', response.status);
            setBlockedTimes([]);
          }
        } catch (error) {
          console.error('Error fetching blocked times:', error);
          setBlockedTimes([]);
        } finally {
          setLoadingBlockedTimes(false);
        }
      }
    };

    fetchBlockedTimes();
  }, [selectedDate, get]);

  useEffect(() => {
    if (selectedDate) {
      const allHours = [];
      for (let h = 8; h < 19; h++) {
        for (let m = 0; m < 60; m += 30) {
          const hourStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          allHours.push(hourStr);
        }
      }

      // Filter out unavailable hours
      const available = allHours.filter(hour => {
        // Check if studio is closed at the start time
        if (isStudioClosed(selectedDate, hour)) {
          return false;
        }

        // Check if time slot is blocked at the start time
        if (isTimeSlotBlocked(selectedDate, hour)) {
          return false;
        }

        // Check if the entire prestazione fits before closing time
        const [startHour, startMin] = hour.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = startMinutes + selectedPrestazioneDuration;

        // Check if the end time is still within opening hours
        if (!isOpeningHoursEnough(selectedDate, startMinutes, endMinutes)) {
          return false;
        }

        // Check if the end time doesn't overlap with blocked times
        if (doesDurationOverlapBlocked(selectedDate, hour, selectedPrestazioneDuration)) {
          return false;
        }

        // Check if time slot is already booked (double booking)
        const occupiedHours = Array.isArray(prenotazioniEsistenti)
          ? prenotazioniEsistenti.filter(p => p.dataOraAppuntamento?.startsWith(selectedDate))
            .map(p => p.dataOraAppuntamento.substring(11, 16))
          : [];

        return !occupiedHours.includes(hour);
      });

      setAvailableHours(available);
    }
  }, [selectedDate, prenotazioniEsistenti, studioHours, blockedTimes, selectedPrestazioneDuration]);

  // Update selectedPrestazioneDuration when prestazione changes
  const updateSelectedPrestazioneDuration = useCallback((tipoVisita) => {
    if (tipoVisita && tipoVisita !== 'Altro') {
      const selected = prestazioni.find(p => p.nomePrestazione === tipoVisita);
      if (selected && selected.durataStimata && selected.durataStimata > 0) {
        setSelectedPrestazioneDuration(selected.durataStimata);
        return;
      }
    }
    setSelectedPrestazioneDuration(30); // Default fallback
  }, [prestazioni]);

  // ============================================================
  // HANDLER GENERICI
  // ============================================================
  const handleDateChange = (e) => {
    const date = e.target.value;
    // Ensure the date is in ISO format
    const formattedDate = toISODateFormat(date);
    setSelectedDate(formattedDate);
    setFormData(prev => ({ ...prev, dataOraAppuntamento: '' }));
    setDateError('');
  };

  const handleHourSelect = (hour) => {
    // Ensure the date is in ISO format
    const formattedDate = toISODateFormat(selectedDate);
    setFormData(prev => ({
      ...prev,
      dataOraAppuntamento: `${formattedDate}T${hour}:00`
    }));
    setTouched(prev => ({ ...prev, dataOraAppuntamento: true }));
    setDateError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update duration when tipoVisita changes
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
  // SELEZIONE ANIMALE (per STAFF/ADMIN)
  // ============================================================
  const selectAnimale = async (animale) => {
    setFormData(prev => ({ 
      ...prev, 
      animaleId: animale.id,
      proprietarioId: (animale.idProprietario || animale.proprietarioId)?.toString() || ''
    }));
    setAnimaleSearchTerm(animale.nome);
    setShowAnimaleSuggestions(false);
    setErrors(prev => ({ ...prev, animaleId: '', proprietarioId: '' }));
    
    // Auto-fill proprietario info
    const proprietarioId = animale.idProprietario || animale.proprietarioId;
    if (proprietarioId) {
      try {
        const response = await get(`/api/proprietari/${proprietarioId}`);
        if (response.ok) {
          const proprietario = await response.json();
          
          // Create enhanced animal object with proprietario info for display
          const enhancedAnimale = {
            ...animale,
            proprietarioNome: `${proprietario?.nome || ''} ${proprietario?.cognome || ''}`.trim(),
            proprietarioId: proprietario.id
          };
          
          setSelectedAnimale(enhancedAnimale);
          setSelectedProprietario(proprietario);
          setProprietarioSearchTerm(`${proprietario?.nome || ''} ${proprietario?.cognome || ''}`.trim());
        } else {
          console.error('Failed to fetch proprietario:', response.status);
          setSelectedAnimale(animale);
        }
      } catch (error) {
        console.error('Error fetching proprietario:', error);
        setSelectedAnimale(animale);
      }
    } else {
      setSelectedAnimale(animale);
    }
  };

  const clearAnimaleSelection = () => {
    setSelectedAnimale(null);
    setFormData(prev => ({ ...prev, animaleId: '' }));
    setAnimaleSearchTerm('');
    setShowAnimaleSuggestions(false);
  };

  // ============================================================
  // SELEZIONE PROPRIETARIO
  // ============================================================
  const selectProprietario = (proprietario) => {
    setSelectedProprietario(proprietario);
    setFormData(prev => ({ 
      ...prev, 
      proprietarioId: proprietario.id?.toString() || '',
      animaleId: '' // Reset animal when proprietario changes
    }));
    setProprietarioSearchTerm(`${proprietario?.nome || ''} ${proprietario?.cognome || ''}`.trim());
    setShowProprietarioSuggestions(false);
    setErrors(prev => ({ ...prev, proprietarioId: '' }));
    
    // Clear animal selection since we're changing proprietario
    setSelectedAnimale(null);
    setAnimaleSearchTerm('');
  };

  const clearProprietarioSelection = () => {
    setSelectedProprietario(null);
    setFormData(prev => ({ ...prev, proprietarioId: '', animaleId: '' }));
    setProprietarioSearchTerm('');
    setShowProprietarioSuggestions(false);
    
    // Clear animal selection
    setSelectedAnimale(null);
    setAnimaleSearchTerm('');
  };

  // ============================================================
  // VALIDAZIONE
  // ============================================================
  const validateField = (name, value) => {
    switch (name) {
      case 'dataOraAppuntamento':
        return !value ? 'Seleziona data e ora.' : '';
      case 'tipoVisita':
        if (!value) return 'Seleziona un tipo di visita.';
        // Se è "Altro", non mostrare errore qui (verrà validato sul campo specifica)
        if (value === 'Altro') return '';
        // Check if the selected value is a valid prestazione
        if (value !== 'Altro' && !prestazioni.some(p => p.nomePrestazione === value)) {
          return 'Seleziona una prestazione valida.';
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

    // Validazione specifica per "Altro"
    if (formData.tipoVisita === 'Altro' && !formData.specificaTipoVisita.trim()) {
      newErrors.specificaTipoVisita = 'Specifica il tipo di visita.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {};
    ['dataOraAppuntamento', 'tipoVisita', 'animaleId', 'proprietarioId', 'specificaTipoVisita'].forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    if (validateForm()) {
      try {
        // Ensure the date is in the correct ISO format before submission
        const finalDate = toISODatetimeFormat(formData.dataOraAppuntamento);
        
        const payload = {
          dataOraAppuntamento: finalDate,
          tipoVisita: formData.tipoVisita === 'Altro' ? formData.specificaTipoVisita : formData.tipoVisita,
          note: formData.note || '',
          animaleId: parseInt(formData.animaleId),
          proprietarioId: parseInt(formData.proprietarioId)
        };
        
        // Create prenotazione in backend
        const response = await post('/api/prenotazioni', payload);
        if (!response.ok) {
          throw new Error(`Failed to create prenotazione: ${response.status}`);
        }
        
        const createdPrenotazione = await response.json();
        
        // Check if this should create a visita automatically
        const shouldCreateVisita = false; // TODO: Add logic to determine if visita should be created automatically
        
        if (shouldCreateVisita) {
          // Create visita from prenotazione
          const visitaResponse = await post(`/api/prenotazioni/${createdPrenotazione.id}/visita`);
          if (visitaResponse.ok) {
            const visitaData = await visitaResponse.json();
            onSuccess({ ...createdPrenotazione, visitaId: visitaData.visitaId });
            navigate(`/visite/${visitaData.visitaId}`);
          } else {
            onSuccess(createdPrenotazione);
            onClose();
          }
        } else {
          onSuccess(createdPrenotazione);
          onClose();
        }
        
      } catch (error) {
        console.error('Error creating prenotazione:', error);
        // Fallback to old behavior if backend call fails
        const finalDate = toISODatetimeFormat(formData.dataOraAppuntamento);
        const payload = {
          dataPrenotazione: new Date().toISOString(),
          dataOraAppuntamento: finalDate,
          tipoVisita: formData.tipoVisita === 'Altro' ? formData.specificaTipoVisita : formData.tipoVisita,
          priorita: formData.tipoVisita === 'Visita d\'urgenza' ? 'Alta' : 'Media',
          note: formData.note || '',
          animaleId: parseInt(formData.animaleId),
          proprietarioId: parseInt(formData.proprietarioId)
        };
        onSuccess(payload);
        onClose();
      }
    }
  };

  const hasError = (field) => touched[field] && errors[field];
  const hasSelectedDate = !!selectedDate;
  const isTipoVisitaSelected = !!formData.tipoVisita;
  const showSpecificaTipo = formData.tipoVisita === 'Altro';
  const canSelectDate = isTipoVisitaSelected;

  // ============================================================
  // RENDER SUGGERIMENTI ANIMALE (solo per STAFF/ADMIN)
  // ============================================================
  const renderAnimaleSuggestions = () => {
    if (!isStaffOrAdmin) return null;
    if (loadingAnimali) return (
      <div style={{ padding: '10px', textAlign: 'center', color: 'var(--gray-500)' }}>
        Caricamento animali...
      </div>
    );
    if (animaleSuggestions.length === 0) return null;
    if (!showAnimaleSuggestions) return null;

    return (
      <div
        ref={animaleDropdownRef}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--white)',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius)',
          maxHeight: '220px',
          overflowY: 'auto',
          zIndex: 10,
          boxShadow: 'var(--shadow-lg)',
          marginTop: '4px',
        }}
      >
        {Array.isArray(animaleSuggestions) && animaleSuggestions.length > 0 ? (
          animaleSuggestions.map((a) => (
          <div
            key={a.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              cursor: 'pointer',
              transition: 'background 0.15s',
              borderBottom: '1px solid var(--gray-100)',
              background: activeAnimaleSuggestionIndex === animaleSuggestions.indexOf(a) ? 'var(--gray-50)' : 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gray-50)';
              setActiveAnimaleSuggestionIndex(animaleSuggestions.indexOf(a));
            }}
            onMouseLeave={(e) => {
              if (activeAnimaleSuggestionIndex !== animaleSuggestions.indexOf(a)) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
            onClick={() => selectAnimale(a).catch(console.error)}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              {a.nome.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-900)' }}>
                {a.nome}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                {a.specie} {a.razza ? `• ${a.razza}` : ''}
                {a.proprietarioNome && a.proprietarioNome !== 'Sconosciuto' ? ` • ${a.proprietarioNome}` : ''}
                {a.microchip ? ` • Microchip: ${a.microchip}` : ''}
              </div>
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--gray-400)',
                padding: '2px 10px',
                background: 'var(--gray-100)',
                borderRadius: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              #{a.id}
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: '10px', textAlign: 'center', color: 'var(--gray-500)' }}>
          {animaleSearchTerm.length >= 1 ? 'Nessun animale trovato' : 'Inizia a digitare per cercare...'}
        </div>
      )}
      </div>
    );
  };

  // ============================================================
  // RENDER SUGGERIMENTI PROPRIETARIO
  // ============================================================
  const renderProprietarioSuggestions = () => {
    if (loadingProprietari) return (
      <div style={{ padding: '10px', textAlign: 'center', color: 'var(--gray-500)' }}>
        Caricamento proprietari...
      </div>
    );
    if (proprietarioSuggestions.length === 0) return null;
    if (!showProprietarioSuggestions) return null;

    return (
      <div
        ref={proprietarioDropdownRef}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--white)',
          border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius)',
          maxHeight: '220px',
          overflowY: 'auto',
          zIndex: 10,
          boxShadow: 'var(--shadow-lg)',
          marginTop: '4px',
        }}
      >
        {Array.isArray(proprietarioSuggestions) && proprietarioSuggestions.length > 0 ? (
          proprietarioSuggestions.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              cursor: 'pointer',
              transition: 'background 0.15s',
              borderBottom: '1px solid var(--gray-100)',
              background: activeProprietarioSuggestionIndex === proprietarioSuggestions.indexOf(p) ? 'var(--gray-50)' : 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gray-50)';
              setActiveProprietarioSuggestionIndex(proprietarioSuggestions.indexOf(p));
            }}
            onMouseLeave={(e) => {
              if (activeProprietarioSuggestionIndex !== proprietarioSuggestions.indexOf(p)) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
            onClick={() => selectProprietario(p)}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--success-light)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              {p.nome.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-900)' }}>
                {p.nome} {p.cognome}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                {p.telefono ? `Tel: ${p.telefono} • ` : ''}
                {p.email}
              </div>
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--gray-400)',
                padding: '2px 10px',
                background: 'var(--gray-100)',
                borderRadius: '12px',
                whiteSpace: 'nowrap',
              }}
            >
              #{p.id}
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: '10px', textAlign: 'center', color: 'var(--gray-500)' }}>
          {proprietarioSearchTerm.length >= 1 ? 'Nessun proprietario trovato' : 'Inizia a digitare per cercare...'}
        </div>
      )}
      </div>
    );
  };

  return (
    <FormModal
      title="Nuova Prenotazione (Staff)"
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="proprietario-form-grid">
        {/* Error messages */}
        {errorAnimali && (
          <div style={{ color: 'var(--danger)', padding: '8px', marginBottom: '12px', background: 'var(--danger-light)', borderRadius: 'var(--radius)' }}>
            {errorAnimali}
          </div>
        )}
        {errorProprietari && (
          <div style={{ color: 'var(--danger)', padding: '8px', marginBottom: '12px', background: 'var(--danger-light)', borderRadius: 'var(--radius)' }}>
            {errorProprietari}
          </div>
        )}
        {errorPrenotazioni && (
          <div style={{ color: 'var(--danger)', padding: '8px', marginBottom: '12px', background: 'var(--danger-light)', borderRadius: 'var(--radius)' }}>
            {errorPrenotazioni}
          </div>
        )}
        {/* Proprietario (autocomplete per STAFF) */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Proprietario *</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={proprietarioInputRef}
                type="text"
                className={`form-control ${hasError('proprietarioId') ? 'is-invalid' : ''}`}
                placeholder="Cerca per nome, cognome, telefono o email..."
                value={proprietarioSearchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setProprietarioSearchTerm(value);
                  setActiveProprietarioSuggestionIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (activeProprietarioSuggestionIndex >= 0 && proprietarioSuggestions[activeProprietarioSuggestionIndex]) {
                      selectProprietario(proprietarioSuggestions[activeProprietarioSuggestionIndex]);
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveProprietarioSuggestionIndex(prev => 
                      Math.min(prev + 1, proprietarioSuggestions.length - 1)
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveProprietarioSuggestionIndex(prev => 
                      Math.max(prev - 1, 0)
                    );
                  }
                }}
                style={{ paddingRight: '36px' }}
              />
              {selectedProprietario && (
                <button
                  type="button"
                  onClick={clearProprietarioSelection}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--gray-400)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0 4px',
                  }}
                >
                  ×
                </button>
              )}
            </div>
            {hasError('proprietarioId') && <div className="form-error">{errors.proprietarioId}</div>}
            {renderProprietarioSuggestions()}
          </div>
          {selectedProprietario && (
            <div style={{
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'var(--success-light)',
              borderRadius: 'var(--radius)',
              border: '1px solid rgba(42, 157, 143, 0.2)',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--success)', fontSize: '13px' }}>
                ✓ {selectedProprietario ? `${selectedProprietario.nome || 'Proprietario'} ${selectedProprietario.cognome || ''}`.trim() : 'Proprietario'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                {selectedProprietario?.telefono ? `Tel: ${selectedProprietario.telefono} • ` : ''}
                {selectedProprietario?.email || ''}
              </span>
            </div>
          )}
        </div>

        {/* Animale */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Animale *</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={animaleInputRef}
                type="text"
                className={`form-control ${hasError('animaleId') ? 'is-invalid' : ''}`}
                placeholder={selectedProprietario?.nome ? `Cerca animali di ${selectedProprietario.nome}...` : "Cerca per nome, microchip, specie o proprietario..."}
                value={animaleSearchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setAnimaleSearchTerm(value);
                  setActiveAnimaleSuggestionIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (activeAnimaleSuggestionIndex >= 0 && animaleSuggestions[activeAnimaleSuggestionIndex]) {
                      selectAnimale(animaleSuggestions[activeAnimaleSuggestionIndex]).catch(console.error);
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveAnimaleSuggestionIndex(prev => 
                      Math.min(prev + 1, animaleSuggestions.length - 1)
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveAnimaleSuggestionIndex(prev => 
                      Math.max(prev - 1, 0)
                    );
                  }
                }}
                style={{ paddingRight: '36px' }}
              />
              {selectedAnimale && (
                <button
                  type="button"
                  onClick={clearAnimaleSelection}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--gray-400)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0 4px',
                  }}
                >
                  ×
                </button>
              )}
            </div>
            {hasError('animaleId') && <div className="form-error">{errors.animaleId}</div>}
            {renderAnimaleSuggestions()}
          </div>
          {selectedAnimale && (
            <div style={{
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'var(--primary-light)',
              borderRadius: 'var(--radius)',
              border: '1px solid rgba(42, 157, 143, 0.2)',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '13px' }}>
                ✓ {selectedAnimale.nome}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                {selectedAnimale.specie} {selectedAnimale.razza ? `• ${selectedAnimale.razza}` : ''}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gray-400)', marginLeft: 'auto' }}>
                {selectedAnimale.proprietarioNome}
              </span>
            </div>
          )}
        </div>

        {/* Tipo Visita */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Tipo Visita *</label>
          {loadingPrestazioni ? (
            <div style={{ color: 'var(--gray-500)', fontSize: '14px', padding: '8px' }}>
              Caricamento prestazioni...
            </div>
          ) : errorPrestazioni ? (
            <div style={{ color: 'var(--danger)', fontSize: '14px', padding: '8px' }}>
              {errorPrestazioni}
            </div>
          ) : (
            <>
              <select
                name="tipoVisita"
                className={`form-control ${hasError('tipoVisita') ? 'is-invalid' : ''}`}
                value={formData.tipoVisita}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">Seleziona tipo visita</option>
                {prestazioni.map((prestazione) => (
                  <option key={prestazione.id} value={prestazione.nomePrestazione}>
                    {prestazione.nomePrestazione} - €{prestazione.costoBase?.toFixed(2) || '0.00'}
                  </option>
                ))}
                <option value="Altro">Altro (specifica)</option>
              </select>
              {hasError('tipoVisita') && <div className="form-error">{errors.tipoVisita}</div>}
            </>
          )}
        </div>

        {/* Specifica Tipo Visita (per Altro) */}
        {showSpecificaTipo && (
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Specifica tipo visita *</label>
            <input
              type="text"
              name="specificaTipoVisita"
              className={`form-control ${hasError('specificaTipoVisita') ? 'is-invalid' : ''}`}
              value={formData.specificaTipoVisita}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Inserisci il tipo di visita..."
            />
            {hasError('specificaTipoVisita') && <div className="form-error">{errors.specificaTipoVisita}</div>}
          </div>
        )}

        {/* Data Appuntamento */}
        <div className="form-group">
          <label className="form-label">Data Appuntamento *</label>
          {canSelectDate ? (
            <input
              type="date"
              className={`form-control ${hasError('dataOraAppuntamento') ? 'is-invalid' : ''}`}
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
            />
          ) : (
            <div style={{ color: 'var(--gray-500)', fontSize: '14px', padding: '8px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', background: 'var(--gray-50)' }}>
              Seleziona prima il tipo di visita
            </div>
          )}
        </div>

        {/* Ora Appuntamento */}
        <div className="form-group">
          <label className="form-label">Ora Appuntamento *</label>
          {canSelectDate ? (
            hasSelectedDate ? (
              availableHours.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '4px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  padding: '4px',
                  border: `1px solid ${hasError('dataOraAppuntamento') ? 'var(--danger)' : 'var(--gray-200)'}`,
                  borderRadius: 'var(--radius)',
                  background: 'var(--white)'
                }}>
                  {availableHours.map(h => (
                    <button
                      key={h}
                      type="button"
                      className={`btn btn-sm ${formData.dataOraAppuntamento === `${selectedDate}T${h}:00` ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleHourSelect(h)}
                      style={{ fontSize: '12px', padding: '4px 6px' }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--danger)', fontSize: '14px', padding: '8px' }}>
                  Nessuna ora disponibile per questa data
                </div>
              )
            ) : (
              <div style={{ color: 'var(--gray-500)', fontSize: '14px', padding: '8px' }}>
                Seleziona prima una data
              </div>
            )
          ) : (
            <div style={{ color: 'var(--gray-500)', fontSize: '14px', padding: '8px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', background: 'var(--gray-50)' }}>
              Seleziona prima il tipo di visita
            </div>
          )}
          {hasError('dataOraAppuntamento') && <div className="form-error">{errors.dataOraAppuntamento}</div>}
        </div>

        {/* Note */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Note</label>
          <input
            type="text"
            name="note"
            className="form-control"
            value={formData.note || ''}
            onChange={handleChange}
            placeholder="Note aggiuntive..."
          />
        </div>
      </div>
    </FormModal>
  );
}

export default PrenotazioneCreateStaff;
