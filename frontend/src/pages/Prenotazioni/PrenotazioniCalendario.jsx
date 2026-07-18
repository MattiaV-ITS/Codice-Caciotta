import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrenotazioniCalendario.css';
import { formatDate, formatTime, parseDate } from '../../utils/dateUtils';
import { useApi } from '../../services/apiService';
import PrenotazioneCreateStaff from './PrenotazioneCreateStaff';
import PrenotazioneContextMenu from '../../components/PrenotazioneContextMenu/PrenotazioneContextMenu';

const GIORNI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const START_HOUR = 8;   // 08:00
const END_HOUR = 20;    // 20:00
const SLOT_MIN = 30;    // blocchi da 30 minuti
const SLOT_HEIGHT = 48; // px per blocco da 30 minuti
const SLOTS_COUNT = ((END_HOUR - START_HOUR) * 60) / SLOT_MIN;

// ==============================
// HELPER DATE
// ==============================
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Domenica
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
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

// Offset in minuti dall'inizio della griglia (START_HOUR:00)
function minutesFromGridStart(date) {
  return (date.getHours() * 60 + date.getMinutes()) - START_HOUR * 60;
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
    const columns = []; // ogni colonna tiene l'orario di fine dell'ultimo evento inserito
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

  const fetchPrenotazioni = async () => {
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
          // If it's already a string, ensure it's in the right format
          if (!dataOraAppuntamento.includes('T')) {
            // Convert from date-only to datetime format
            dataOraAppuntamento = `${dataOraAppuntamento}T00:00:00`;
          }
        } else if (dataOraAppuntamento instanceof Date) {
          // Convert Date object to ISO string
          dataOraAppuntamento = dataOraAppuntamento.toISOString();
        }
        
        // Handle animal name - prefer animaleNome from DTO, fallback to animal object
        let animaleNome = 'Sconosciuto';
        let specie = 'Sconosciuto';
        
        if (p.animaleNome) {
          animaleNome = p.animaleNome;
        } else if (p.animale && p.animale.nome) {
          animaleNome = p.animale.nome;
          specie = p.animale.specie || 'Sconosciuto';
        }
        
        // Handle proprietario name
        let proprietarioNome = 'Sconosciuto';
        if (p.proprietarioNome) {
          proprietarioNome = `${p.proprietarioNome || ''} ${p.proprietarioCognome || ''}`.trim() || 'Sconosciuto';
        } else if (p.proprietario && p.proprietario.nome) {
          proprietarioNome = `${p.proprietario.nome || ''} ${p.proprietario.cognome || ''}`.trim() || 'Sconosciuto';
        }
        
        return {
          id: p.id,
          dataOraAppuntamento: dataOraAppuntamento,
          motivo: p.tipoVisita,
          statoPrenotazione: 'Confermata', // Default status
          priorita: 'Media', // Default priority
          note: p.note || '',
          animaleNome: animaleNome,
          specie: specie,
          proprietarioNome: proprietarioNome,
          durataMinuti: 30 // Default duration
        };
      });
      
      console.log('Transformed prenotazioni data:', transformedData);
      setPrenotazioni(transformedData);
      
    } catch (err) {
      console.error('Error fetching prenotazioni:', err);
      setError(err.message);
      // Show empty array on error
      setPrenotazioni([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrenotazioni();
  }, [get]);

  // Fetch prestazioni for color mapping
  useEffect(() => {
    const fetchPrestazioni = async () => {
      try {
        setLoadingPrestazioni(true);
        const response = await get('/api/prestazioni');
        if (response.ok) {
          const data = await response.json();
          // Handle both array and Spring Page response formats
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

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const timeSlots = useMemo(
    () => Array.from({ length: SLOTS_COUNT }, (_, i) => {
      const totalMin = START_HOUR * 60 + i * SLOT_MIN;
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return { index: i, label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, isHour: m === 0 };
    }),
    []
  );

  const eventsByDay = useMemo(() => {
    const map = weekDays.map(() => []);
    prenotazioni.forEach((p) => {
      try {
        const start = parseDate(p.dataOraAppuntamento) || new Date();
        const dayIdx = weekDays.findIndex((d) => isSameDay(d, start));
        if (dayIdx === -1) return;
        const startMin = Math.max(0, minutesFromGridStart(start));
        const endMin = Math.min(SLOTS_COUNT * SLOT_MIN, startMin + (p.durataMinuti || 30));
        map[dayIdx].push({ ...p, _start: startMin, _end: endMin, _startDate: start });
      } catch (error) {
        console.error('Error parsing date for prenotazione:', p.id, error);
        // Skip this prenotazione if date parsing fails
      }
    });
    return map.map((dayEvents) => layoutDayEvents(dayEvents));
  }, [prenotazioni, weekDays]);

  const gridHeight = SLOTS_COUNT * SLOT_HEIGHT;

  const goToPrevWeek = () => setWeekStart((d) => addDays(d, -7));
  const goToNextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goToToday = () => setWeekStart(getMonday(new Date()));

  const handlePrenotazioneDeleted = (deletedId) => {
    // Remove the deleted prenotazione from the list
    setPrenotazioni(prev => prev.filter(p => p.id !== deletedId));
  };

  const handlePrenotazioneUpdated = (updatedPrenotazione) => {
    // Update the prenotazione in the list
    setPrenotazioni(prev => 
      prev.map(p => p.id === updatedPrenotazione.id ? {
        ...p,
        dataOraAppuntamento: updatedPrenotazione.dataOraAppuntamento,
        motivo: updatedPrenotazione.tipoVisita,
        note: updatedPrenotazione.note,
        animaleNome: updatedPrenotazione.animale?.nome || p.animaleNome,
        specie: updatedPrenotazione.animale?.specie || p.specie,
        proprietarioNome: updatedPrenotazione.proprietarioNome || p.proprietarioNome
      } : p)
    );
  };

  // Helper function to get prestazione color
  const getPrestazioneColor = (motivo) => {
    if (!Array.isArray(prestazioni) || prestazioni.length === 0) {
      // Fallback to old color scheme if prestazioni not loaded
      const fallbackColors = {
        'Visita di controllo': '#3B82F6',
        'Vaccinazione': '#8B5CF6',
        'Visita specialistica': '#2A9D8F',
        "Visita d'urgenza": '#EF4444',
        'Controllo post-operatorio': '#F59E0B'
      };
      return fallbackColors[motivo] || '#6B7280';
    }

    // Find prestazione by name match
    const prestazione = prestazioni.find(p =>
      p.nomePrestazione === motivo ||
      p.nomePrestazione.includes(motivo) ||
      motivo.includes(p.nomePrestazione)
    );

    return prestazione?.colore || '#6B7280';
  };

  // Generate legend from prestazioni
  const getPrestazioneLegenda = () => {
    if (!Array.isArray(prestazioni) || prestazioni.length === 0) {
      return [
        { label: 'Controllo', color: '#3B82F6' },
        { label: 'Vaccinazione', color: '#8B5CF6' },
        { label: 'Specialistica', color: '#2A9D8F' },
        { label: "Urgenza", color: '#EF4444' },
        { label: 'Post-operatorio', color: '#F59E0B' }
      ];
    }

    return prestazioni.map(p => ({
      label: p.nomePrestazione,
      color: p.colore || '#6B7280'
    })).slice(0, 5); // Show top 5 prestazioni
  };

  const nowOffset = minutesFromGridStart(now);
  const showNowLine = nowOffset >= 0 && nowOffset <= SLOTS_COUNT * SLOT_MIN;
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
          <button className="btn-add" onClick={() => setShowCreateModal(true)}>+ Nuova Prenotazione</button>
        </div>
      </div>

      <div className="cal-toolbar">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={goToPrevWeek} aria-label="Settimana precedente">‹</button>
          <button className="cal-today-btn" onClick={goToToday}>Oggi</button>
          <button className="cal-nav-btn" onClick={goToNextWeek} aria-label="Settimana successiva">›</button>
          <span className="cal-range-label">{formatRangeLabel(weekStart)}</span>
        </div>

        <div className="cal-legend">
          {getPrestazioneLegenda().map((m) => (
            <span className="cal-legend-item" key={m.label}>
              <span className="cal-legend-dot" style={{ background: m.color }}></span>{m.label}
            </span>
          ))}
          {prestazioni.length > 5 && (
            <button
              className="cal-legend-more"
              onClick={() => setShowLegendPopup(!showLegendPopup)}
            >
              +{prestazioni.length - 5} altre
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

          <div className="cal-body" style={{ height: gridHeight + 50 }}>
            <div className="cal-gutter-col">
              {timeSlots.map((slot) => (
                <div key={slot.index} className="cal-gutter-slot" style={{ height: SLOT_HEIGHT }}>
                  {slot.isHour && <span className="cal-gutter-slot-label">{slot.label}</span>}
                </div>
              ))}

              {showNowLine && todayIndex !== -1 && (
                <div className="cal-now-time-badge" style={{ top: (nowOffset / SLOT_MIN) * SLOT_HEIGHT }}>
                  {now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>

            {weekDays.map((d, dayIdx) => (
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

                {eventsByDay[dayIdx].map((ev) => {
                  const top = (ev._start / SLOT_MIN) * SLOT_HEIGHT;
                  const height = Math.max(((ev._end - ev._start) / SLOT_MIN) * SLOT_HEIGHT - 2, 20);
                  const widthPct = 100 / ev._totalCols;
                  const leftPct = ev._col * widthPct;
                  const isCompact = height < 40;
                  const endDate = new Date(ev._startDate.getTime() + (ev.durataMinuti || 30) * 60000);
                  const timeLabel = `${ev._startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}–${endDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;

                  const prestazioneColor = getPrestazioneColor(ev.motivo);
                  const statoModifier = ev.statoPrenotazione === 'Annullata'
                    ? 'is-annullata'
                    : ev.statoPrenotazione === 'Attesa'
                      ? 'is-attesa'
                      : '';

                  return (
                    <PrenotazioneContextMenu
                      key={ev.id}
                      prenotazione={ev}
                      onPrenotazioneDeleted={handlePrenotazioneDeleted}
                      onPrenotazioneUpdated={handlePrenotazioneUpdated}
                    >
                      <div
                        className={`cal-event ${statoModifier}`}
                        style={{
                          top,
                          height,
                          left: `calc(${leftPct}% + 2px)`,
                          width: `calc(${widthPct}% - 4px)`,
                          backgroundColor: prestazioneColor,
                          borderColor: prestazioneColor
                        }}
                        title={`${ev.animaleNome} (${ev.proprietarioNome || 'Proprietario sconosciuto'}) - ${ev.motivo} - ${ev.statoPrenotazione}`}
                      >
                        {!isCompact && <div className="cal-event-time">{timeLabel}</div>}
                        <div className="cal-event-title">
                          {ev.animaleNome}
                        </div>
                        <div className="cal-event-owner">{ev.proprietarioNome || 'Proprietario sconosciuto'}</div>
                        {!isCompact && height >= 56 && (
                          <div className="cal-event-motivo">{ev.motivo}</div>
                        )}
                      </div>
                    </PrenotazioneContextMenu>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {showCreateModal && (
        <PrenotazioneCreateStaff
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newPrenotazione) => {
            setShowCreateModal(false);
            // Refresh the list after successful creation
            fetchPrenotazioni();
          }}
        />
      )}

      {/* Legend Popup */}
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