import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrenotazioniProgramma.css';
import { formatDate, formatTime, parseDate } from '../../utils/dateUtils';
import { useApi } from '../../services/apiService';
import PrenotazioneCreateStaff from './PrenotazioneCreateStaff';
import PrenotazioneContextMenu from '../../components/PrenotazioneContextMenu/PrenotazioneContextMenu';



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
  const { get, post } = useApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [now, setNow] = useState(new Date());
  const todayRef = useRef(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  // Raggruppa le prenotazioni per giorno e garantisce sempre la presenza
  // del giorno odierno (anche se vuoto), cosi' la barra "Ora" e' sempre visibile.
  const dayGroups = useMemo(() => {
    const map = new Map();

    prenotazioni.forEach((p) => {
      try {
        const start = parseDate(p.dataOraAppuntamento) || new Date();
        const key = dateKey(start);
        if (!map.has(key)) map.set(key, { date: startOfDay(start), events: [] });
        map.get(key).events.push({ ...p, _start: start });
      } catch (error) {
        console.error('Error parsing date for prenotazione:', p.id, error);
        // Skip this prenotazione if date parsing fails
      }
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
          <button className="btn-clear-filters" onClick={() => navigate('/')}>
            ← Dashboard
          </button>
          <button className="btn-clear-filters" onClick={() => navigate('/prenotazioni/calendario')}>
            Vista Calendario
          </button>
          <button className="btn-add" onClick={() => setShowCreateModal(true)}>+ Nuova Prenotazione</button>
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
                    <PrenotazioneContextMenu
                      prenotazione={ev}
                      onPrenotazioneDeleted={handlePrenotazioneDeleted}
                      onPrenotazioneUpdated={handlePrenotazioneUpdated}
                    >
                      <div
                        className={`prog-event ${MOTIVO_CLASS[ev.motivo] || 'tipo-altro'} ${
                          ev.statoPrenotazione === 'Annullata' ? 'is-annullata' :
                          ev.statoPrenotazione === 'Attesa' ? 'is-attesa' : ''
                        }`}
                      >
                        <div className="prog-event-title">{ev.animaleNome}</div>
                        <div className="prog-event-time">{formatTimeRange(ev._start, ev.durataMinuti)}</div>
                        <div className="prog-event-owner">{ev.proprietarioNome || 'Proprietario sconosciuto'}</div>
                        <div className="prog-event-motivo">{ev.motivo}</div>
                      </div>
                    </PrenotazioneContextMenu>
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

      <button className="prog-fab" onClick={() => setShowCreateModal(true)} aria-label="Nuova prenotazione">+</button>
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
    </div>
  );
}

export default PrenotazioniProgramma;