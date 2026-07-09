import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrenotazioniProgramma.css';

// ==============================
// MOCK DATI PRENOTAZIONI
// (stessa fonte dati di PrenotazioniCalendario)
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
  { label: 'Urgenza', color: '#EF4444' },
  { label: 'Post-operatorio', color: '#F59E0B' }
];

const GIORNI_BREVI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

// ==============================
// HELPER DATE
// ==============================
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfDay(d) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function weekdayShort(d) {
  // getDay(): 0 = Domenica ... 6 = Sabato -> rimappa su Lun..Dom
  const idx = (d.getDay() + 6) % 7;
  return GIORNI_BREVI[idx];
}

function formatGapRange(start, end) {
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startStr = start.toLocaleDateString('it-IT', sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'short' });
  const endStr = end.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

function formatTimeRange(start, minutes) {
  const end = new Date(start.getTime() + (minutes || 30) * 60000);
  const opt = { hour: '2-digit', minute: '2-digit' };
  return `${start.toLocaleTimeString('it-IT', opt)} – ${end.toLocaleTimeString('it-IT', opt)}`;
}

// ==============================
// COMPONENTE
// ==============================
function PrenotazioniProgramma() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [now, setNow] = useState(new Date());
  const todayRef = useRef(null);

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

  // Raggruppa le prenotazioni per giorno e garantisce sempre la presenza
  // del giorno odierno (anche se vuoto), cosi' la barra "adesso" e' sempre visibile.
  const dayGroups = useMemo(() => {
    const map = new Map();

    prenotazioni.forEach((p) => {
      const start = new Date(p.dataOraAppuntamento);
      const key = dateKey(start);
      if (!map.has(key)) map.set(key, { date: startOfDay(start), events: [] });
      map.get(key).events.push({ ...p, _start: start });
    });

    const todayKey = dateKey(now);
    if (!map.has(todayKey)) {
      map.set(todayKey, { date: startOfDay(now), events: [] });
    }

    const groups = Array.from(map.values()).sort((a, b) => a.date - b.date);
    groups.forEach((g) => g.events.sort((a, b) => a._start - b._start));
    return groups;
  }, [prenotazioni, now]);

  // Costruisce la lista finale intervallando etichette per gli intervalli di
  // giorni senza prenotazioni (come fa Google Calendar nella vista Programma).
  const items = useMemo(() => {
    const result = [];
    dayGroups.forEach((group, idx) => {
      if (idx > 0) {
        const prevDate = dayGroups[idx - 1].date;
        const gapStart = addDays(prevDate, 1);
        const gapEnd = addDays(group.date, -1);
        if (gapEnd >= gapStart) {
          result.push({ type: 'gap', key: `gap-${idx}`, start: gapStart, end: gapEnd });
        }
      }
      result.push({ type: 'day', key: `day-${dateKey(group.date)}`, ...group });
    });
    return result;
  }, [dayGroups]);

  const handleEventClick = (item) => {
    navigate(`/prenotazioni/${item.id}`);
  };

  const scrollToToday = () => {
    todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento programma...</span>
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
          <h2>Programma Prenotazioni</h2>
          <p className="page-subtitle">Tutti gli appuntamenti in un'unica lista, giorno per giorno</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button className="btn-clear-filters" onClick={() => navigate('/prenotazioni')}>
            Vista Lista
          </button>
          <button className="btn-clear-filters" onClick={() => navigate('/prenotazioni/calendario')}>
            Vista Calendario
          </button>
          <button className="btn-add">+ Nuova Prenotazione</button>
        </div>
      </div>

      <div className="prog-toolbar">
        <button className="cal-today-btn" onClick={scrollToToday}>Vai a oggi</button>
        <div className="cal-legend">
          {MOTIVO_LEGENDA.map((m) => (
            <span className="cal-legend-item" key={m.label}>
              <span className="cal-legend-dot" style={{ background: m.color }}></span>{m.label}
            </span>
          ))}
        </div>
      </div>

      <div className="prog-list">
        {items.map((item) => {
          if (item.type === 'gap') {
            return (
              <div className="prog-gap-label" key={item.key}>
                {formatGapRange(item.start, item.end)}
              </div>
            );
          }

          const isToday = isSameDay(item.date, now);
          const nowIndex = isToday
            ? item.events.findIndex((ev) => ev._start > now)
            : -1;
          const insertIndex = nowIndex === -1 ? item.events.length : nowIndex;

          return (
            <div
              className="prog-day-group"
              key={item.key}
              ref={isToday ? todayRef : null}
            >
              <div className="prog-day-label">
                <span className="prog-day-name">{weekdayShort(item.date)}</span>
                <span className={`prog-day-num ${isToday ? 'is-today' : ''}`}>{item.date.getDate()}</span>
              </div>

              <div className="prog-day-events">
                {item.events.length === 0 && (
                  <div className="prog-empty">Nessun appuntamento in programma</div>
                )}

                {item.events.map((ev, idx) => (
                  <React.Fragment key={ev.id}>
                    {isToday && idx === insertIndex && (
                      <div className="prog-now-line">
                        <span className="prog-now-dot"></span>
                        <span className="prog-now-time">
                          {now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="prog-now-rule"></span>
                      </div>
                    )}
                    <div
                      className={`prog-event ${MOTIVO_CLASS[ev.motivo] || 'tipo-altro'} ${
                        ev.statoPrenotazione === 'Annullata' ? 'is-annullata' :
                        ev.statoPrenotazione === 'Attesa' ? 'is-attesa' : ''
                      }`}
                      onClick={() => handleEventClick(ev)}
                    >
                      <div className="prog-event-title">{ev.animaleNome}</div>
                      <div className="prog-event-time">{formatTimeRange(ev._start, ev.durataMinuti)}</div>
                      <div className="prog-event-owner">{ev.proprietarioNome}</div>
                      <div className="prog-event-motivo">{ev.motivo}</div>
                    </div>
                  </React.Fragment>
                ))}

                {isToday && insertIndex === item.events.length && (
                  <div className="prog-now-line">
                    <span className="prog-now-dot"></span>
                    <span className="prog-now-time">
                      {now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="prog-now-rule"></span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button className="prog-fab" onClick={() => {}} aria-label="Nuova prenotazione">+</button>
    </div>
  );
}

export default PrenotazioniProgramma;