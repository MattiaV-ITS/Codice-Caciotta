import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './StudioHoursAdmin.css';
import OrarioBloccatoCreateModal from '../../components/OrarioBloccatoCreateModal';

const StudioHoursAdmin = () => {
  const { token } = useAuth();
  const [defaultHours, setDefaultHours] = useState([]);
  const [specificHours, setSpecificHours] = useState([]);
  const [selectedDay, setSelectedDay] = useState('LUNEDI');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showSpecificDateModal, setShowSpecificDateModal] = useState(false);
  const [showBlockedSpotModal, setShowBlockedSpotModal] = useState(false);
  const [specificDateData, setSpecificDateData] = useState({
    data: '',
    oraApertura: '09:00',
    oraChiusura: '18:00',
    oraInizioPausaPranzo: '13:00',
    oraFinePausaPranzo: '14:00',
    chiuso: false
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingSpecificId, setEditingSpecificId] = useState(null);
  const [showAllDaysModal, setShowAllDaysModal] = useState(false);
  const [allDaysData, setAllDaysData] = useState({
    oraApertura: '09:00',
    oraChiusura: '18:00',
    oraInizioPausaPranzo: '13:00',
    oraFinePausaPranzo: '14:00',
    chiuso: false,
    giorniEsclusi: []
  });

  const daysOfWeek = [
    { value: 'LUNEDI', label: 'Lunedì' },
    { value: 'MARTEDI', label: 'Martedì' },
    { value: 'MERCOLEDI', label: 'Mercoledì' },
    { value: 'GIOVEDI', label: 'Giovedì' },
    { value: 'VENERDI', label: 'Venerdì' },
    { value: 'SABATO', label: 'Sabato' },
    { value: 'DOMENICA', label: 'Domenica' }
  ];

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const fetchStudioHours = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/admin/orari', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Errore nel recupero degli orari');
      const data = await response.json();
      setDefaultHours(data.defaultOrari || []);
      setSpecificHours(data.specificOrari || []);
    } catch (error) {
      showMessage('error', error.message);
    }
  }, [token, showMessage]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchStudioHours().finally(() => setLoading(false));
    }
  }, [token, fetchStudioHours]);

  const getCurrentDayHours = () => {
    return defaultHours.find(h => h.giornoSettimana === selectedDay) || {
      oraApertura: '09:00',
      oraChiusura: '18:00',
      oraInizioPausaPranzo: null,
      oraFinePausaPranzo: null,
      chiuso: false
    };
  };

  const currentDayHours = getCurrentDayHours();

  const handleDefaultHoursUpdate = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/orari/default/with-lunch', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          giornoSettimana: selectedDay,
          oraApertura: currentDayHours.oraApertura,
          oraChiusura: currentDayHours.oraChiusura,
          oraInizioPausaPranzo: currentDayHours.oraInizioPausaPranzo,
          oraFinePausaPranzo: currentDayHours.oraFinePausaPranzo,
          chiuso: currentDayHours.chiuso
        })
      });
      if (!response.ok) throw new Error('Salvataggio orari predefiniti fallito');
      await fetchStudioHours();
      showMessage('success', 'Orari predefiniti aggiornati');
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTimeChange = (field, value) => {
    setDefaultHours(prev => prev.map(h =>
      h.giornoSettimana === selectedDay ? { ...h, [field]: value } : h
    ));
  };

  const handleClosedToggle = () => {
    setDefaultHours(prev => prev.map(h =>
      h.giornoSettimana === selectedDay ? { ...h, chiuso: !h.chiuso } : h
    ));
  };

  const handleAllDaysUpdate = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/orari/default/all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(allDaysData)
      });
      if (!response.ok) throw new Error('Salvataggio globale fallito');
      await fetchStudioHours();
      setShowAllDaysModal(false);
      showMessage('success', 'Orari di tutti i giorni aggiornati');
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const openSpecificDateModal = (date = null, existing = null) => {
    if (existing) {
      setEditingSpecificId(existing.id);
      setSpecificDateData({
        data: existing.dataSpecifica,
        oraApertura: existing.oraApertura || '09:00',
        oraChiusura: existing.oraChiusura || '18:00',
        oraInizioPausaPranzo: existing.oraInizioPausaPranzo || '13:00',
        oraFinePausaPranzo: existing.oraFinePausaPranzo || '14:00',
        chiuso: existing.chiuso || false
      });
    } else {
      setEditingSpecificId(null);
      setSpecificDateData({
        data: date || '',
        oraApertura: '09:00',
        oraChiusura: '18:00',
        oraInizioPausaPranzo: '13:00',
        oraFinePausaPranzo: '14:00',
        chiuso: false
      });
    }
    setShowSpecificDateModal(true);
  };

  const handleSpecificDateSave = async () => {
    setSaving(true);
    try {
      if (editingSpecificId) {
        await fetch(`/api/admin/orari/specific/${editingSpecificId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      const response = await fetch('/api/admin/orari/specific/with-lunch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: specificDateData.data,
          oraApertura: specificDateData.oraApertura,
          oraChiusura: specificDateData.oraChiusura,
          oraInizioPausaPranzo: specificDateData.oraInizioPausaPranzo,
          oraFinePausaPranzo: specificDateData.oraFinePausaPranzo,
          chiuso: specificDateData.chiuso
        })
      });
      if (!response.ok) throw new Error('Salvataggio eccezione fallito');
      await fetchStudioHours();
      setShowSpecificDateModal(false);
      showMessage('success', 'Eccezione salvata');
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSpecificDateDelete = async (id) => {
    if (!window.confirm('Rimuovere questa eccezione?')) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/orari/specific/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Eliminazione fallita');
      await fetchStudioHours();
      showMessage('success', 'Eccezione rimossa');
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const goToPreviousMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  const goToNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  const goToToday = () => setCurrentMonth(new Date());

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('it-IT', { weekday: 'long' });
      const specificOverride = specificHours.find(h => h.dataSpecifica === dateStr);
      const defaultDay = daysOfWeek.find(d => d.label.toLowerCase() === dayName.toLowerCase());
      const defaultOverride = defaultHours.find(h => h.giornoSettimana === defaultDay?.value);

      // Verifica se esiste un orario (override o default non chiuso/null)
      const hasHours = !!(specificOverride || (defaultOverride && !defaultOverride.chiuso));

      days.push({
        date: i,
        dateStr,
        isToday: dateStr === todayStr,
        hasOverride: !!specificOverride,
        isClosed: specificOverride ? specificOverride.chiuso : (defaultOverride?.chiuso || false),
        hasHours, // true se c'è un orario disponibile (override o default non chiuso)
        hours: specificOverride
          ? (specificOverride.chiuso ? 'Chiuso' : `${specificOverride.oraApertura} - ${specificOverride.oraChiusura}`)
          : defaultOverride
            ? (defaultOverride.chiuso ? 'Chiuso' : `${defaultOverride.oraApertura} - ${defaultOverride.oraChiusura}`)
            : '—'
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const currentMonthName = monthNames[currentMonth.getMonth()];

  if (loading) {
    return (
      <div className="studio-hours-container">
        <div className="loading-spinner">Caricamento orari studio...</div>
      </div>
    );
  }

  return (
    <div className="studio-hours-container">
      <h2>Gestione Orari Studio</h2>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="message-close">×</button>
        </div>
      )}

      <div className="studio-hours-content">
        {/* Default Hours Section */}
        <div className="default-hours-section">
          <h3>Orari Predefiniti Settimanali</h3>

          <div className="all-days-actions">
            <button onClick={() => setShowAllDaysModal(true)} className="update-all-button">
              📅 Imposta Tutti i Giorni
            </button>
            <button onClick={() => setShowBlockedSpotModal(true)} className="btn-secondary">
              + Crea Orario Bloccato
            </button>
          </div>

          <div className="day-selector">
            {daysOfWeek.map(day => (
              <button
                key={day.value}
                className={`day-button ${selectedDay === day.value ? 'active' : ''}`}
                onClick={() => setSelectedDay(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>

          <div className="hours-editor">
            <div className="form-group">
              <label>Giorno:</label>
              <span className="day-name">{daysOfWeek.find(d => d.value === selectedDay)?.label}</span>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ marginBottom: 0 }}>Stato:</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={currentDayHours.chiuso || false}
                  onChange={handleClosedToggle}
                />
                <span className="slider round"></span>
                <span className="toggle-label">
                  {currentDayHours.chiuso ? 'Chiuso' : 'Aperto'}
                </span>
              </label>
            </div>

            {!currentDayHours.chiuso && (
              <>
                <div className="form-group">
                  <label>Ora Apertura:</label>
                  <input
                    type="time"
                    value={currentDayHours.oraApertura || '09:00'}
                    onChange={(e) => handleTimeChange('oraApertura', e.target.value)}
                    className="time-input"
                  />
                </div>

                <div className="form-group">
                  <label>Ora Chiusura:</label>
                  <input
                    type="time"
                    value={currentDayHours.oraChiusura || '18:00'}
                    onChange={(e) => handleTimeChange('oraChiusura', e.target.value)}
                    className="time-input"
                  />
                </div>

                <div className="form-group">
                  <label>Ora Inizio Pausa Pranzo:</label>
                  <input
                    type="time"
                    value={currentDayHours.oraInizioPausaPranzo || '13:00'}
                    onChange={(e) => handleTimeChange('oraInizioPausaPranzo', e.target.value)}
                    className="time-input"
                  />
                </div>

                <div className="form-group">
                  <label>Ora Fine Pausa Pranzo:</label>
                  <input
                    type="time"
                    value={currentDayHours.oraFinePausaPranzo || '14:00'}
                    onChange={(e) => handleTimeChange('oraFinePausaPranzo', e.target.value)}
                    className="time-input"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleDefaultHoursUpdate}
              disabled={saving}
              className="save-button"
            >
              {saving ? 'Salvataggio...' : 'Salva Orari Predefiniti'}
            </button>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="calendar-section">
          <h3>Calendario Eccezioni</h3>

          <div className="calendar-header">
            <button onClick={goToPreviousMonth} className="nav-button">‹</button>
            <h4>{currentMonthName} {currentMonth.getFullYear()}</h4>
            <button onClick={goToNextMonth} className="nav-button">›</button>
            <button onClick={goToToday} className="today-button">Oggi</button>
          </div>

          <div className="calendar-weekdays">
            {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${day ? '' : 'empty'} ${day?.isToday ? 'today' : ''} ${
                  day?.hasOverride ? 'has-override' : ''
                } ${
                  day && !day.hasHours ? 'no-hours' : (day?.isClosed ? 'closed' : 'open')
                }`}
                onClick={() => day && openSpecificDateModal(day.dateStr)}
              >
                {day && (
                  <>
                    <div className="day-number">{day.date}</div>
                    {day.hasOverride && <div className="override-badge">⭐</div>}
                    <div className="day-hours">{day.hours}</div>
                  </>
                )}
              </div>
            ))}
          </div>

          <button onClick={() => openSpecificDateModal()} className="add-specific-button">
            + Aggiungi Eccezione
          </button>
        </div>
      </div>

      {/* Update All Days Modal */}
      {showAllDaysModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Imposta Orari per Tutti i Giorni</h3>

            <div className="form-group">
              <label>Stato:</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={allDaysData.chiuso}
                  onChange={(e) => setAllDaysData({...allDaysData, chiuso: e.target.checked})}
                />
                <span className="slider round"></span>
                <span className="toggle-label">
                  {allDaysData.chiuso ? 'Chiuso' : 'Aperto'}
                </span>
              </label>
            </div>

            {!allDaysData.chiuso && (
              <>
                <div className="form-group">
                  <label>Ora Apertura:</label>
                  <input
                    type="time"
                    value={allDaysData.oraApertura}
                    onChange={(e) => setAllDaysData({...allDaysData, oraApertura: e.target.value})}
                    className="time-input"
                  />
                </div>

                <div className="form-group">
                  <label>Ora Chiusura:</label>
                  <input
                    type="time"
                    value={allDaysData.oraChiusura}
                    onChange={(e) => setAllDaysData({...allDaysData, oraChiusura: e.target.value})}
                    className="time-input"
                  />
                </div>

                <div className="form-group">
                  <label>Ora Inizio Pausa Pranzo:</label>
                  <input
                    type="time"
                    value={allDaysData.oraInizioPausaPranzo}
                    onChange={(e) => setAllDaysData({...allDaysData, oraInizioPausaPranzo: e.target.value})}
                    className="time-input"
                  />
                </div>

                <div className="form-group">
                  <label>Ora Fine Pausa Pranzo:</label>
                  <input
                    type="time"
                    value={allDaysData.oraFinePausaPranzo}
                    onChange={(e) => setAllDaysData({...allDaysData, oraFinePausaPranzo: e.target.value})}
                    className="time-input"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Escludi Giorni:</label>
              <div className="exclusion-checkboxes">
                {daysOfWeek.map(day => (
                  <label key={day.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={allDaysData.giorniEsclusi.includes(day.value)}
                      onChange={(e) => {
                        const newExclusions = e.target.checked
                          ? [...allDaysData.giorniEsclusi, day.value]
                          : allDaysData.giorniEsclusi.filter(d => d !== day.value);
                        setAllDaysData({...allDaysData, giorniEsclusi: newExclusions});
                      }}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowAllDaysModal(false)}
                className="cancel-button"
                disabled={saving}
              >
                Annulla
              </button>
              <button
                onClick={handleAllDaysUpdate}
                disabled={saving}
                className="save-button"
              >
                {saving ? 'Salvataggio...' : 'Imposta Tutti i Giorni'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specific Date Modal */}
      {showSpecificDateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingSpecificId ? 'Modifica Eccezione' : 'Aggiungi Eccezione'}</h3>

            <div className="form-group">
              <label>Data:</label>
              <input
                type="date"
                value={specificDateData.data}
                onChange={(e) => setSpecificDateData({...specificDateData, data: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Stato:</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={specificDateData.chiuso}
                  onChange={(e) => setSpecificDateData({...specificDateData, chiuso: e.target.checked})}
                />
                <span className="slider round"></span>
                <span className="toggle-label">
                  {specificDateData.chiuso ? 'Chiuso' : 'Aperto'}
                </span>
              </label>
            </div>

            {!specificDateData.chiuso && (
              <>
                <div className="form-group">
                  <label>Ora Apertura:</label>
                  <input
                    type="time"
                    value={specificDateData.oraApertura}
                    onChange={(e) => setSpecificDateData({...specificDateData, oraApertura: e.target.value})}
                    className="time-input"
                  />
                </div>

                <div className="form-group">
                  <label>Ora Chiusura:</label>
                  <input
                    type="time"
                    value={specificDateData.oraChiusura}
                    onChange={(e) => setSpecificDateData({...specificDateData, oraChiusura: e.target.value})}
                    className="time-input"
                  />
                </div>

                <div className="form-group">
                  <label>Ora Inizio Pausa Pranzo:</label>
                  <input
                    type="time"
                    value={specificDateData.oraInizioPausaPranzo}
                    onChange={(e) => setSpecificDateData({...specificDateData, oraInizioPausaPranzo: e.target.value})}
                    className="time-input"
                  />
                </div>

                <div className="form-group">
                  <label>Ora Fine Pausa Pranzo:</label>
                  <input
                    type="time"
                    value={specificDateData.oraFinePausaPranzo}
                    onChange={(e) => setSpecificDateData({...specificDateData, oraFinePausaPranzo: e.target.value})}
                    className="time-input"
                  />
                </div>
              </>
            )}

            <div className="modal-actions">
              <button
                onClick={() => setShowSpecificDateModal(false)}
                className="cancel-button"
                disabled={saving}
              >
                Annulla
              </button>
              <button
                onClick={handleSpecificDateSave}
                disabled={saving}
                className="save-button"
              >
                {saving ? 'Salvataggio...' : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Spot Modal */}
      {showBlockedSpotModal && (
        <OrarioBloccatoCreateModal
          onClose={() => setShowBlockedSpotModal(false)}
          onSuccess={() => {
            setShowBlockedSpotModal(false);
            fetchStudioHours();
          }}
          selectedDate={currentMonth.toISOString().split('T')[0]}
        />
      )}
    </div>
  );
};

export default StudioHoursAdmin;