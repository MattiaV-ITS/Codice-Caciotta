import React, { useEffect, useMemo, useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrenotazioniCalendario.css';
import { formatDate, formatTime, parseDate } from '../../utils/dateUtils';
import { useApi } from '../../services/apiService';
import PrenotazioneCreateStaff from './PrenotazioneCreateStaff';
const PrenotazioneContextMenu = lazy(() => import('../../components/PrenotazioneContextMenu/PrenotazioneContextMenu'));
import {
  getPrestazioneClass,
  getPrestazioneColor,
  getPrestazioneDuration,
  getPrestazioneLegenda,
  FALLBACK_COLOR
} from './prenotazioniUtils';
import { PlusIcon } from '../../components/icons'; // ✅ Import aggiunto
import OrarioBloccatoCreateModal from '../../components/OrarioBloccatoCreateModal';

const GIORNI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const SLOT_MIN = 30;    // blocchi da 30 minuti
const SLOT_HEIGHT = 48; // px per blocco da 30 minuti

// ==============================
// HELPER DATE
// ==============================
function getMonday(date) {
  // Handle both string dates and Date objects
  let d;
  if (typeof date === 'string' && date.includes('-')) {
    // Parse YYYY-MM-DD format as local date
    const parts = date.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
    const day = parseInt(parts[2], 10);
    // Create local date at midnight
    d = new Date(year, month, day, 0, 0, 0, 0);
  } else {
    d = new Date(date);
  }

  // Get day of week in local timezone (0 = Sunday, 1 = Monday, etc.)
  const day = d.getDay();

  // Calculate days to subtract to get to Monday
  // If Sunday (0), go back 6 days
  // If Monday (1), stay on same day (0 days back)
  // If Tuesday (2), go back 1 day, etc.
  const diff = day === 0 ? -6 : 1 - day;

  const result = new Date(d);
  result.setDate(d.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatRangeLabel(weekStart) {
  const weekEnd = addDays(weekStart, 6);
  const optsDay = { day: 'numeric' };
  const optsFull = { day: 'numeric', month: 'long', year: 'numeric' };
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    const startStr = weekStart.toLocaleDateString('it-IT', optsDay);
    const endStr = weekEnd.toLocaleDateString('it-IT', optsFull);
    return `${startStr} - ${endStr}`;
  }
  const startStr = weekStart.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  const endStr = weekEnd.toLocaleDateString('it-IT', optsFull);
  return `${startStr} - ${endStr}`;
}

// Calcola la disposizione degli eventi di un giorno, gestendo le sovrapposizioni
// affiancando gli eventi che si sovrappongono in orario (come Google Calendar).
function layoutDayEvents(events) {
  const sorted = [...events].sort((a, b) => a._start - b._start);
  const clusters = [];
  let current = [];
  let currentEnd = -Infinity;

  sorted.forEach((ev) => {
    if (current.length === 0 || ev._start < currentEnd) {
      current.push(ev);
      currentEnd = Math.max(currentEnd, ev._end);
    } else {
      clusters.push(current);
      current = [ev];
      currentEnd = ev._end;
    }
  });
  if (current.length > 0) clusters.push(current);

  const laidOut = [];
  clusters.forEach((cluster) => {
    const columns = [];
    cluster.forEach((ev) => {
      let colIndex = columns.findIndex((endTime) => ev._start >= endTime);
      if (colIndex === -1) {
        colIndex = columns.length;
        columns.push(ev._end);
      } else {
        columns[colIndex] = ev._end;
      }
      ev._col = colIndex;
    });
    const totalCols = columns.length;
    cluster.forEach((ev) => {
      laidOut.push({ ...ev, _totalCols: totalCols });
    });
  });

  return laidOut;
}

// ==============================
// COMPONENTE
// ==============================
function PrenotazioniCalendario() {
  const navigate = useNavigate();
  const { get, post } = useApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [now, setNow] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [prestazioni, setPrestazioni] = useState([]);
  const [loadingPrestazioni, setLoadingPrestazioni] = useState(true);
  const [showLegendPopup, setShowLegendPopup] = useState(false);
  const [studioHours, setStudioHours] = useState([]);
  const [specificOrari, setSpecificOrari] = useState([]);
  const [loadingStudioHours, setLoadingStudioHours] = useState(true);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [loadingBlockedTimes, setLoadingBlockedTimes] = useState(true);
  const [showBlockedSpotModal, setShowBlockedSpotModal] = useState(false);

  // Days of week mapping for studio hours
  const daysOfWeek = [
    { value: 'LUNEDI', label: 'Lunedì' },
    { value: 'MARTEDI', label: 'Martedì' },
    { value: 'MERCOLEDI', label: 'Mercoledì' },
    { value: 'GIOVEDI', label: 'Giovedì' },
    { value: 'VENERDI', label: 'Venerdì' },
    { value: 'SABATO', label: 'Sabato' },
    { value: 'DOMENICA', label: 'Domenica' }
  ];

  const fetchPrenotazioni = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch prenotazioni from backend
      const response = await get('/api/prenotazioni');
      if (!response.ok) {
        throw new Error(`Failed to fetch prenotazioni: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw prenotazioni data from backend:', data);

      // Transform backend data to match frontend format
      const transformedData = data.map(p => {
        // Ensure date format is correct for frontend
        let dataOraAppuntamento = p.dataOraAppuntamento;
        if (typeof dataOraAppuntamento === 'string') {
          if (!dataOraAppuntamento.includes('T')) {
            dataOraAppuntamento = `${dataOraAppuntamento}T00:00:00`;
          }
        } else if (dataOraAppuntamento instanceof Date) {
          dataOraAppuntamento = dataOraAppuntamento.toISOString();
        }

        let animaleNome = 'Sconosciuto';
        let specie = 'Sconosciuto';

        if (p.animaleNome) {
          animaleNome = p.animaleNome;
        } else if (p.animale && p.animale.nome) {
          animaleNome = p.animale.nome;
          specie = p.animale.specie || 'Sconosciuto';
        }

        let proprietarioNome = 'Sconosciuto';
        if (p.proprietarioNome) {
          proprietarioNome = `${p.proprietarioNome || ''} ${p.proprietarioCognome || ''}`.trim() || 'Sconosciuto';
        } else if (p.proprietario && p.proprietario.nome) {
          proprietarioNome = `${p.proprietario.nome || ''} ${p.proprietario.cognome || ''}`.trim() || 'Sconosciuto';
        }

        // FIXED: Preserve all ID and object fields for edit modal
        return {
          id: p.id,
          dataOraAppuntamento: dataOraAppuntamento,
          tipoVisita: p.tipoVisita,
          motivo: p.tipoVisita,
          statoPrenotazione: 'Confermata',
          priorita: 'Media',
          note: p.note || '',
          animaleId: p.animaleId,
          animaleNome: animaleNome,
          specie: specie,
          proprietarioId: p.proprietarioId,
          proprietarioNome: proprietarioNome,
          proprietarioCognome: p.proprietarioCognome || '',
          animale: p.animale,
          proprietario: p.proprietario,
          durataMinuti: 30 // Will be overridden in eventsByDay with real prestazione duration
        };
      });

      console.log('Transformed prenotazioni data:', transformedData);
      setPrenotazioni(transformedData);

    } catch (err) {
      console.error('Error fetching prenotazioni:', err);
      setError(err.message);
      setPrenotazioni([]);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchPrenotazioni();
  }, [fetchPrenotazioni]);

  // Fetch prestazioni for color mapping
  useEffect(() => {
    const fetchPrestazioni = async () => {
      try {
        setLoadingPrestazioni(true);
        const response = await get('/api/prestazioni');
        if (response.ok) {
          const data = await response.json();
          const prestazioniArray = Array.isArray(data)
            ? data
            : (data.content && Array.isArray(data.content)
              ? data.content
              : []);
          setPrestazioni(prestazioniArray);
        }
      } catch (error) {
        console.error('Error fetching prestazioni:', error);
      } finally {
        setLoadingPrestazioni(false);
      }
    };

    fetchPrestazioni();
  }, [get]);

  // Fetch studio hours (default + specific date overrides) for calendar display
  useEffect(() => {
    const fetchStudioHours = async () => {
      try {
        setLoadingStudioHours(true);
        const response = await get('/api/admin/orari');
        if (response.ok) {
          const data = await response.json();
          setStudioHours(data.defaultOrari || []);
          setSpecificOrari(data.specificOrari || []);
        }
      } catch (error) {
        console.error('Error fetching studio hours:', error);
      } finally {
        setLoadingStudioHours(false);
      }
    };

    fetchStudioHours();
  }, [get]);

  // Fetch blocked times for calendar display
  useEffect(() => {
    const fetchBlockedTimes = async () => {
      try {
        setLoadingBlockedTimes(true);
        const response = await get('/api/admin/orari/bloccati');
        if (response.ok) {
          const data = await response.json();
          setBlockedTimes(data || []);
        } else if (response.status === 403) {
          const publicResponse = await get('/api/orari/bloccati');
          if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            setBlockedTimes(publicData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching blocked times:', error);
        setBlockedTimes([]);
      } finally {
        setLoadingBlockedTimes(false);
      }
    };

    fetchBlockedTimes();
  }, [get]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Calculate week's opening hours range FIRST
  const calculateWeekOpeningHours = () => {
    if (!Array.isArray(studioHours) || studioHours.length === 0) {
      return { startHour: 10, endHour: 18 };
    }

    let minStartHour = 24;
    let maxEndHour = 0;

    weekDays.forEach((day, index) => {
      const dayName = day.toLocaleDateString('it-IT', { weekday: 'long' });
      const dayKey = daysOfWeek.find(d => d.label.toUpperCase() === dayName.toUpperCase())?.value;

      if (dayKey) {
        const dayHours = studioHours.find(h => h.giornoSettimana === dayKey);
        if (dayHours && !dayHours.chiuso && dayHours.oraApertura && dayHours.oraChiusura) {
          const startHour = parseInt(dayHours.oraApertura.split(':')[0]);
          const endHour = parseInt(dayHours.oraChiusura.split(':')[0]);

          if (startHour < minStartHour) minStartHour = startHour;
          if (endHour > maxEndHour) maxEndHour = endHour;
        }
      }
    });

    if (minStartHour === 24 || maxEndHour === 0) {
      return { startHour: 10, endHour: 18 };
    }

    // Start the calendar 30 minutes before the earliest opening and 30 minutes after the latest closing
    const calendarStartHour = minStartHour - 0.5;
    const calendarEndHour = maxEndHour + 0.5;
    return { startHour: calendarStartHour, endHour: calendarEndHour };
  };

  const { startHour: dynamicStartHour, endHour: dynamicEndHour } = calculateWeekOpeningHours();
  const DYNAMIC_SLOTS_COUNT = Math.max(1, ((dynamicEndHour - dynamicStartHour) * 60) / SLOT_MIN);
  const gridHeight = DYNAMIC_SLOTS_COUNT * SLOT_HEIGHT;

  // Extended hours are the same as dynamic hours in this case
  const extendedStartHour = dynamicStartHour;
  const extendedEndHour = dynamicEndHour;
  const EXTENDED_SLOTS_COUNT = Math.max(1, ((extendedEndHour - extendedStartHour) * 60) / SLOT_MIN);
  const extendedGridHeight = EXTENDED_SLOTS_COUNT * SLOT_HEIGHT;

  function minutesFromExtendedGridStart(date) {
    return (date.getHours() * 60 + date.getMinutes()) - extendedStartHour * 60;
  }

  const getDayOpeningHours = (dayIndex) => {
    if (!Array.isArray(studioHours) || studioHours.length === 0) {
      return null;
    }

    const day = weekDays[dayIndex];
    const dayName = day.toLocaleDateString('it-IT', { weekday: 'long' });
    const dayKey = daysOfWeek.find(d => d.label.toUpperCase() === dayName.toUpperCase())?.value;

    // First check if there's a specific date override for this day
    const dateStr = day.toISOString().split('T')[0];
    const specificOverride = Array.isArray(specificOrari)
      ? specificOrari.find(h => h.dataSpecifica === dateStr)
      : null;

    if (specificOverride) {
      return {
        chiuso: specificOverride.chiuso,
        start: specificOverride.oraApertura,
        end: specificOverride.oraChiusura,
        lunchStart: specificOverride.oraInizioPausaPranzo,
        lunchEnd: specificOverride.oraFinePausaPranzo
      };
    }

    if (dayKey) {
      const dayHours = studioHours.find(h => h.giornoSettimana === dayKey);
      if (dayHours) {
        return {
          chiuso: dayHours.chiuso,
          start: dayHours.oraApertura,
          end: dayHours.oraChiusura,
          lunchStart: dayHours.oraInizioPausaPranzo,
          lunchEnd: dayHours.oraFinePausaPranzo
        };
      }
    }

    return null;
  };

  const eventsByDay = useMemo(() => {
    const map = weekDays.map(() => []);
    prenotazioni.forEach((p) => {
      try {
        let start;
        if (typeof p.dataOraAppuntamento === 'string' && p.dataOraAppuntamento.includes('T')) {
          start = new Date(p.dataOraAppuntamento);
        } else {
          start = parseDate(p.dataOraAppuntamento) || new Date();
        }

        const dayIdx = weekDays.findIndex((d) => isSameDay(d, start));
        if (dayIdx === -1) return;
        const startMin = Math.max(0, minutesFromExtendedGridStart(start));
        // Use real prestazione duration instead of hardcoded 30
        const realDuration = getPrestazioneDuration(p.motivo, prestazioni);
        const endMin = startMin + realDuration;
        map[dayIdx].push({ ...p, _start: startMin, _end: endMin, _startDate: start, durataMinuti: realDuration });
      } catch (error) {
        console.error('Error parsing date for prenotazione:', p.id, error);
      }
    });
    return map.map((dayEvents) => layoutDayEvents(dayEvents));
  }, [prenotazioni, weekDays, extendedStartHour, prestazioni]);

  const blockedTimesByDay = useMemo(() => {
    const map = weekDays.map(() => []);
    blockedTimes.forEach((blocked) => {
      try {
        const blockedDate = new Date(blocked.data);
        const dayIdx = weekDays.findIndex((d) => isSameDay(d, blockedDate));
        if (dayIdx === -1) return;

        const [startHour, startMin] = blocked.oraInizio.split(':').map(Number);
        const [endHour, endMin] = blocked.oraFine.split(':').map(Number);

        const startDate = new Date(blockedDate);
        startDate.setHours(startHour, startMin, 0, 0);

        const endDate = new Date(blockedDate);
        endDate.setHours(endHour, endMin, 0, 0);

        const startOffset = minutesFromExtendedGridStart(startDate);
        const endOffset = minutesFromExtendedGridStart(endDate);

        if (startOffset >= 0 && endOffset > startOffset) {
          map[dayIdx].push({
            ...blocked,
            _start: startOffset,
            _end: endOffset,
            _startDate: startDate,
            _endDate: endDate
          });
        }
      } catch (error) {
        console.error('Error parsing blocked time:', blocked.id, error);
      }
    });
    return map;
  }, [blockedTimes, weekDays, extendedStartHour]);

  const timeSlots = useMemo(
    () => Array.from({ length: EXTENDED_SLOTS_COUNT }, (_, i) => {
      const totalMin = extendedStartHour * 60 + i * SLOT_MIN;
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      // Show only full hour labels, excluding those on boundary lines (9:30 and 18:30)
      const showHourLabel = m === 0 && `${h}:${String(m).padStart(2, '0')}` !== '9:30' && `${h}:${String(m).padStart(2, '0')}` !== '18:30';
      return {
        index: i,
        label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        isHour: m === 0,
        showLabel: showHourLabel
      };
    }),
    [extendedStartHour, EXTENDED_SLOTS_COUNT]
  );

  const goToPrevWeek = () => setWeekStart((d) => addDays(d, -7));
  const goToNextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goToToday = () => setWeekStart(getMonday(new Date()));

  const handlePrenotazioneDeleted = (deletedId) => {
    setPrenotazioni(prev => prev.filter(p => p.id !== deletedId));
  };

  const handlePrenotazioneUpdated = (updatedPrenotazione) => {
    setPrenotazioni(prev =>
      prev.map(p => p.id === updatedPrenotazione.id ? {
        ...p,
        dataOraAppuntamento: updatedPrenotazione.dataOraAppuntamento,
        tipoVisita: updatedPrenotazione.tipoVisita,
        motivo: updatedPrenotazione.tipoVisita,
        note: updatedPrenotazione.note,
        animaleId: updatedPrenotazione.animaleId,
        animaleNome: updatedPrenotazione.animale?.nome || p.animaleNome,
        specie: updatedPrenotazione.animale?.specie || p.specie,
        proprietarioId: updatedPrenotazione.proprietarioId,
        proprietarioNome: updatedPrenotazione.proprietarioNome || p.proprietarioNome,
        animale: updatedPrenotazione.animale || p.animale,
        proprietario: updatedPrenotazione.proprietario || p.proprietario
      } : p)
    );
  };

  const nowOffset = minutesFromExtendedGridStart(now);
  const showNowLine = nowOffset >= 0 && nowOffset <= EXTENDED_SLOTS_COUNT * SLOT_MIN;
  const todayIndex = weekDays.findIndex((d) => isSameDay(d, now));

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento calendario...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="form-error">Errore: {error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Calendario Prenotazioni</h2>
          <p className="page-subtitle">Vista settimanale degli appuntamenti</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button className="btn-clear-filters" onClick={() => navigate('/')}>
            ← Dashboard
          </button>
          <button className="btn-clear-filters" onClick={() => navigate('/prenotazioni/programma')}>
            Vista Lista
          </button>
          <button className="btn-add" onClick={() => setShowCreateModal(true)}>
            <PlusIcon width={16} height={16} stroke="currentColor" />
            Nuova Prenotazione
          </button>
          <button className="btn-secondary" onClick={() => setShowBlockedSpotModal(true)}>
            <PlusIcon width={16} height={16} stroke="currentColor" />
            Crea Orario Bloccato
          </button>
        </div>
      </div>

      <div className="cal-toolbar">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={goToPrevWeek} aria-label="Settimana precedente">‹</button>
          <button className="cal-today-btn" onClick={goToToday}>Oggi</button>
          <button className="cal-nav-btn" onClick={goToNextWeek} aria-label="Settimana successiva">›</button>
          <span className="cal-range-label">{formatRangeLabel(weekStart)}</span>

          <div className="cal-date-input">
            <input
              type="date"
              value={weekStart.toISOString().split('T')[0]}
              onChange={(e) => {
                try {
                  if (!e.target.value) {
                    // Handle empty/cleared date - keep current week
                    return;
                  }

                  // Parse date correctly handling timezone
                  // Date input value is in YYYY-MM-DD format (local timezone)
                  const parts = e.target.value.split('-');
                  const year = parseInt(parts[0], 10);
                  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
                  const day = parseInt(parts[2], 10);

                  // Create date in local timezone at midnight
                  const selectedDate = new Date(year, month, day, 0, 0, 0, 0);

                  // Check if date is valid
                  if (isNaN(selectedDate.getTime())) {
                    console.error('Invalid date selected');
                    return;
                  }

                  setWeekStart(getMonday(selectedDate));
                } catch (error) {
                  console.error('Error handling date selection:', error);
                  // Keep current week if any error occurs
                }
              }}
            />
          </div>
        </div>

        <div className="cal-legend">
          {getPrestazioneLegenda(prestazioni).map((m) => (
            <span className="cal-legend-item" key={m.label}>
              <span className="cal-legend-dot" style={{ background: m.color }}></span>{m.label}
            </span>
          ))}
          {prestazioni.length > 5 && (
            <button
              className="cal-legend-more"
              onClick={() => setShowLegendPopup(!showLegendPopup)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <PlusIcon width={12} height={12} stroke="currentColor" />
              {prestazioni.length - 5} altre
            </button>
          )}
        </div>
      </div>

      <div className="cal-scroll-wrapper">
        <div className="cal-grid">
          <div className="cal-header-row">
            <div className="cal-header-gutter"></div>
            {weekDays.map((d, i) => (
              <div key={i} className={`cal-header-day ${isSameDay(d, now) ? 'is-today' : ''}`}>
                <div className="cal-header-day-name">{GIORNI[i]}</div>
                <div className="cal-header-day-num">{d.getDate()}</div>
              </div>
            ))}
          </div>

          <div className="cal-body" style={{ height: extendedGridHeight }}>
            <div className="cal-gutter-col">
              {timeSlots.map((slot) => (
                <div key={slot.index} className="cal-gutter-slot" style={{ height: SLOT_HEIGHT }}>
                  {slot.showLabel && <span className="cal-gutter-slot-label">{slot.label}</span>}
                </div>
              ))}

              {showNowLine && todayIndex !== -1 && (
                <div className="cal-now-time-badge" style={{ top: (nowOffset / SLOT_MIN) * SLOT_HEIGHT }}>
                  {now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>

            {weekDays.map((d, dayIdx) => {
              const dayHours = getDayOpeningHours(dayIdx);
              return (
                <div key={dayIdx} className={`cal-day-col ${isSameDay(d, now) ? 'is-today' : ''}`}>
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.index}
                      className={`cal-slot-line ${slot.isHour ? 'is-hour' : ''}`}
                      style={{ height: SLOT_HEIGHT }}
                    ></div>
                  ))}

                  {showNowLine && todayIndex === dayIdx && (
                    <div className="cal-now-line" style={{ top: (nowOffset / SLOT_MIN) * SLOT_HEIGHT }}>
                      <span className="cal-now-dot"></span>
                    </div>
                  )}

                  {dayHours && (
                    <>
                      {/* Background for hours before opening */}
                      {parseInt(dayHours.start.split(':')[0]) > extendedStartHour && (
                        <div
                          className="cal-closed-hours-bg"
                          style={{
                            top: '0',
                            height: `${(parseInt(dayHours.start.split(':')[0]) - extendedStartHour) * (60 / SLOT_MIN) * SLOT_HEIGHT}px`
                          }}
                        ></div>
                      )}

                      {/* Background for hours after closing */}
                      {parseInt(dayHours.end.split(':')[0]) < extendedEndHour && (
                        <div
                          className="cal-closed-hours-bg"
                          style={{
                            top: `${(parseInt(dayHours.end.split(':')[0]) - extendedStartHour) * (60 / SLOT_MIN) * SLOT_HEIGHT}px`,
                            height: `${(extendedEndHour - parseInt(dayHours.end.split(':')[0])) * (60 / SLOT_MIN) * SLOT_HEIGHT}px`
                          }}
                        ></div>
                      )}

                      {/* Background for full days when studio is closed */}
                      {dayHours.chiuso && (
                        <div
                          className="cal-closed-hours-bg"
                          style={{
                            top: '0',
                            height: `${extendedGridHeight}px`
                          }}
                        ></div>
                      )}

                      {dayHours.lunchStart && dayHours.lunchEnd && (
                        <div
                          className="cal-lunch-break"
                          style={{
                            top: `${(parseInt(dayHours.lunchStart.split(':')[0]) - extendedStartHour) * (60 / SLOT_MIN) * SLOT_HEIGHT}px`,
                            height: `${(parseInt(dayHours.lunchEnd.split(':')[0]) - parseInt(dayHours.lunchStart.split(':')[0])) * (60 / SLOT_MIN) * SLOT_HEIGHT}px`
                          }}
                        >
                          <span className="cal-lunch-label">Pausa Pranzo</span>
                        </div>
                      )}
                    </>
                  )}

                  {eventsByDay[dayIdx].map((ev) => {
                    const top = (ev._start / SLOT_MIN) * SLOT_HEIGHT;
                    const height = Math.max(((ev._end - ev._start) / SLOT_MIN) * SLOT_HEIGHT - 2, 20);
                    const widthPct = 100 / ev._totalCols;
                    const leftPct = ev._col * widthPct;
                    const isCompact = height < 40;
                    const endDate = new Date(ev._startDate.getTime() + ev.durataMinuti * 60000);
                    const timeLabel = `${ev._startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}–${endDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;

                    const prestazioneColor = getPrestazioneColor(ev.motivo, prestazioni);
                    const prestazioneClass = getPrestazioneClass(ev.motivo, prestazioni);
                    const statoModifier = ev.statoPrenotazione === 'Annullata'
                      ? 'is-annullata'
                      : ev.statoPrenotazione === 'Attesa'
                        ? 'is-attesa'
                        : '';

                    return (
                      <Suspense key={ev.id} fallback={<div className="cal-event" style={{ top, height, left: `calc(${leftPct}% + 2px)`, width: `calc(${widthPct}% - 4px)` }} />}>
                        <PrenotazioneContextMenu
                          prenotazione={ev}
                          onPrenotazioneDeleted={handlePrenotazioneDeleted}
                          onPrenotazioneUpdated={handlePrenotazioneUpdated}
                        >
                          <>
                            {/* Full opacity background layer to block hours/lines - use page background color */}
                            <div
                              className={`cal-event-bg ${prestazioneClass} ${statoModifier}`}
                              style={{
                                top,
                                height,
                                left: `calc(${leftPct}% + 2px)`,
                                width: `calc(${widthPct}% - 4px)`,
                                background: 'var(--white)',
                                borderLeftColor: prestazioneColor || undefined
                              }}
                            ></div>

                            {/* Semi-transparent overlay with content - exactly like PrenotazioniProgramma */}
                            <div
                              className={`cal-event ${prestazioneClass} ${statoModifier}`}
                              style={{
                                top,
                                height,
                                left: `calc(${leftPct}% + 2px)`,
                                width: `calc(${widthPct}% - 4px)`,
                                ...(prestazioneColor && prestazioneColor !== FALLBACK_COLOR
                                  ? {
                                      background: `${prestazioneColor}22`,
                                      borderLeftColor: prestazioneColor,
                                      color: prestazioneColor
                                    }
                                  : {})
                              }}
                              title={`${timeLabel} - ${ev.proprietarioNome || 'Proprietario sconosciuto'} - ${ev.animaleNome} - ${ev.motivo}`}
                            >
                              <div className="cal-event-content">
                                {!isCompact && <div className="cal-event-time">{timeLabel}</div>}
                                <div className="cal-event-title">{ev.animaleNome}</div>
                                <div className="cal-event-owner">{ev.proprietarioNome || 'Proprietario sconosciuto'}</div>
                                {!isCompact && height >= 56 && (
                                  <div className="cal-event-motivo">{ev.motivo}</div>
                                )}
                              </div>
                            </div>
                          </>
                        </PrenotazioneContextMenu>
                      </Suspense>
                    );
                  })}

                  {blockedTimesByDay[dayIdx].map((blocked) => {
                    const top = (blocked._start / SLOT_MIN) * SLOT_HEIGHT;
                    const height = Math.max(((blocked._end - blocked._start) / SLOT_MIN) * SLOT_HEIGHT - 2, 20);
                    const timeLabel = `${blocked._startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}–${blocked._endDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;

                    return (
                      <div
                        key={`blocked-${blocked.id}`}
                        className="cal-blocked-time"
                        style={{
                          top,
                          height,
                          left: '2px',
                          width: 'calc(100% - 4px)'
                        }}
                        title={`Orario bloccato: ${blocked.motivo || 'Non specificato'} (${timeLabel})`}
                      >
                        <div className="cal-blocked-label">
                          {blocked.motivo || 'Orario bloccato'}
                        </div>
                        <div className="cal-blocked-time-label">
                          {timeLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <PrenotazioneCreateStaff
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newPrenotazione) => {
            setShowCreateModal(false);
            fetchPrenotazioni();
          }}
        />
      )}

      {showBlockedSpotModal && (
        <OrarioBloccatoCreateModal
          onClose={() => setShowBlockedSpotModal(false)}
          onSuccess={() => {
            setShowBlockedSpotModal(false);
            // Refresh blocked times
            const fetchBlockedTimes = async () => {
              try {
                const response = await get('/api/admin/orari/bloccati');
                if (response.ok) {
                  const data = await response.json();
                  setBlockedTimes(data || []);
                }
              } catch (error) {
                console.error('Error refreshing blocked times:', error);
              }
            };
            fetchBlockedTimes();
          }}
          selectedDate={weekStart.toISOString().split('T')[0]}
        />
      )}

      {showLegendPopup && (
        <div className="cal-legend-popup-overlay" onClick={() => setShowLegendPopup(false)}>
          <div className="cal-legend-popup" onClick={e => e.stopPropagation()}>
            <div className="cal-legend-popup-header">
              <h3>Tutte le Prestazioni</h3>
              <button className="cal-legend-popup-close" onClick={() => setShowLegendPopup(false)}>
                ×
              </button>
            </div>
            <div className="cal-legend-popup-content">
              {prestazioni.map((p) => (
                <div key={p.id} className="cal-legend-popup-item">
                  <span className="cal-legend-popup-dot" style={{ backgroundColor: p.colore || '#6B7280' }}></span>
                  <span className="cal-legend-popup-label">{p.nomePrestazione}</span>
                  <span className="cal-legend-popup-cost">€{p.costoBase?.toFixed(2) || '0.00'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrenotazioniCalendario;