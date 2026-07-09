import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrenotazioniCalendario.css';

// ==============================
// MOCK DATI PRENOTAZIONI
// (stessa fonte dati di PrenotazioniLista, arricchita con
// specie animale e durata della visita in minuti)
// ==============================
const MOCK_PRENOTAZIONI = [
  { id: 1, dataOraAppuntamento: '2024-07-10T10:30:00', motivo: 'Visita di controllo', statoPrenotazione: 'Confermata', priorita: 'Media', note: 'Richiesto esame del sangue', animaleNome: 'Fido', specie: 'Cane', proprietarioNome: 'Mario Rossi', durataMinuti: 30 },
  { id: 2, dataOraAppuntamento: '2024-07-10T09:00:00', motivo: 'Vaccinazione', statoPrenotazione: 'Completata', priorita: 'Bassa', note: '', animaleNome: 'Mimì', specie: 'Gatto', proprietarioNome: 'Laura Bianchi', durataMinuti: 15 },
  { id: 3, dataOraAppuntamento: '2024-07-11T14:30:00', motivo: 'Visita specialistica', statoPrenotazione: 'Attesa', priorita: 'Alta', note: 'Richiesta ecografia', animaleNome: 'Rex', specie: 'Cane', proprietarioNome: 'Giuseppe Verdi', durataMinuti: 60 },
  { id: 4, dataOraAppuntamento: '2024-07-12T11:00:00', motivo: "Visita d'urgenza", statoPrenotazione: 'Confermata', priorita: 'Alta', note: 'Animale con febbre', animaleNome: 'Luna', specie: 'Gatto', proprietarioNome: 'Maria Neri', durataMinuti: 45 },
  { id: 5, dataOraAppuntamento: '2024-07-12T16:15:00', motivo: 'Controllo post-operatorio', statoPrenotazione: 'Annullata', priorita: 'Bassa', note: 'Annullato dal proprietario', animaleNome: 'Pippo', specie: 'Cane', proprietarioNome: 'Antonio Ferrari', durataMinuti: 30 },
  { id: 6, dataOraAppuntamento: '2024-07-13T08:00:00', motivo: 'Vaccinazione', statoPrenotazione: 'Attesa', priorita: 'Media', note: '', animaleNome: 'Bella', specie: 'Cane', proprietarioNome: 'Sofia Esposito', durataMinuti: 15 },
  { id: 7, dataOraAppuntamento: '2024-07-13T15:30:00', motivo: 'Visita di controllo', statoPrenotazione: 'Confermata', priorita: 'Bassa', note: 'Controllo peso', animaleNome: 'Leo', specie: 'Gatto', proprietarioNome: 'Francesco Romano', durataMinuti: 30 },
  { id: 8, dataOraAppuntamento: '2024-07-14T10:00:00', motivo: "Visita d'urgenza", statoPrenotazione: 'Attesa', priorita: 'Alta', note: 'Vomito e diarrea', animaleNome: 'Daisy', specie: 'Cane', proprietarioNome: 'Elena Greco', durataMinuti: 45 },
  { id: 9, dataOraAppuntamento: '2024-07-14T13:00:00', motivo: 'Visita specialistica', statoPrenotazione: 'Confermata', priorita: 'Media', note: 'Visita cardiologica', animaleNome: 'Thor', specie: 'Cane', proprietarioNome: 'Marco Ferri', durataMinuti: 60 },
  { id: 10, dataOraAppuntamento: '2024-07-15T09:30:00', motivo: 'Vaccinazione', statoPrenotazione: 'Attesa', priorita: 'Bassa', note: '', animaleNome: 'Mia', specie: 'Gatto', proprietarioNome: 'Chiara De Luca', durataMinuti: 15 }
];

const MOTIVO_CLASS = {
  'Visita di controllo': 'tipo-controllo',
  'Vaccinazione': 'tipo-vaccinazione',
  'Visita specialistica': 'tipo-specialistica',
  "Visita d'urgenza": 'tipo-urgenza',
  'Controllo post-operatorio': 'tipo-post-operatorio'
};

const MOTIVO_LEGENDA = [
  { label: 'Controllo', color: '#3B82F6' },
  { label: 'Vaccinazione', color: '#8B5CF6' },
  { label: 'Specialistica', color: '#2A9D8F' },
  { label: "Urgenza", color: '#EF4444' },
  { label: 'Post-operatorio', color: '#F59E0B' }
];

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date('2024-07-08')));
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setPrenotazioni(MOCK_PRENOTAZIONI);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

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
      const start = new Date(p.dataOraAppuntamento);
      const dayIdx = weekDays.findIndex((d) => isSameDay(d, start));
      if (dayIdx === -1) return;
      const startMin = Math.max(0, minutesFromGridStart(start));
      const endMin = Math.min(SLOTS_COUNT * SLOT_MIN, startMin + (p.durataMinuti || 30));
      map[dayIdx].push({ ...p, _start: startMin, _end: endMin, _startDate: start });
    });
    return map.map((dayEvents) => layoutDayEvents(dayEvents));
  }, [prenotazioni, weekDays]);

  const gridHeight = SLOTS_COUNT * SLOT_HEIGHT;

  const goToPrevWeek = () => setWeekStart((d) => addDays(d, -7));
  const goToNextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goToToday = () => setWeekStart(getMonday(new Date()));

  const handleEventClick = (item) => {
    navigate(`/prenotazioni/${item.id}`);
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
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn-clear-filters" onClick={() => navigate('/prenotazioni')}>
            Vista Lista
          </button>
          <button className="btn-add">+ Nuova Prenotazione</button>
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
          {MOTIVO_LEGENDA.map((m) => (
            <span className="cal-legend-item" key={m.label}>
              <span className="cal-legend-dot" style={{ background: m.color }}></span>{m.label}
            </span>
          ))}
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

          <div className="cal-body" style={{ height: gridHeight }}>
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

                  const motivoClass = MOTIVO_CLASS[ev.motivo] || 'tipo-altro';
                  const statoModifier = ev.statoPrenotazione === 'Annullata'
                    ? 'is-annullata'
                    : ev.statoPrenotazione === 'Attesa'
                      ? 'is-attesa'
                      : '';

                  return (
                    <div
                      key={ev.id}
                      className={`cal-event ${motivoClass} ${statoModifier}`}
                      style={{
                        top,
                        height,
                        left: `calc(${leftPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`
                      }}
                      title={`${ev.animaleNome} (${ev.proprietarioNome}) - ${ev.motivo} - ${ev.statoPrenotazione}`}
                      onClick={() => handleEventClick(ev)}
                    >
                      {!isCompact && <div className="cal-event-time">{timeLabel}</div>}
                      <div className="cal-event-title">
                        {ev.animaleNome}
                      </div>
                      <div className="cal-event-owner">{ev.proprietarioNome}</div>
                      {!isCompact && height >= 56 && (
                        <div className="cal-event-motivo">{ev.motivo}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrenotazioniCalendario;