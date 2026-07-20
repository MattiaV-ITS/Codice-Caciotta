import React, { useState, useEffect } from 'react';
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

    // Days of week for display
    const daysOfWeek = [
      { value: 'LUNEDI', label: 'Lunedì' },
      { value: 'MARTEDI', label: 'Martedì' },
      { value: 'MERCOLEDI', label: 'Mercoledì' },
      { value: 'GIOVEDI', label: 'Giovedì' },
      { value: 'VENERDI', label: 'Venerdì' },
      { value: 'SABATO', label: 'Sabato' },
      { value: 'DOMENICA', label: 'Domenica' }
    ];

  // Fetch studio hours data
  useEffect(() => {
    const fetchStudioHours = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/orari', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch studio hours');
        }

        const data = await response.json();
        setDefaultHours(data.defaultOrari || []);
        setSpecificHours(data.specificOrari || []);
      } catch (error) {
        setMessage({ type: 'error', text: error.message });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStudioHours();
    }
  }, [token]);

  // Get current hours for selected day
  const getCurrentDayHours = () => {
    return defaultHours.find(h => h.giornoSettimana === selectedDay) || {
      oraApertura: '09:00',
      oraChiusura: '18:00',
      chiuso: false
    };
  };

  const currentDayHours = getCurrentDayHours();

  // Handle default hours update
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

      if (!response.ok) {
        throw new Error('Failed to update default hours');
      }

      // Refresh data
      const data = await response.json();
      setMessage({ type: 'success', text: data.message || 'Orari predefiniti aggiornati con successo' });

      // Refresh the list
      const refreshResponse = await fetch('/api/admin/orari', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const refreshData = await refreshResponse.json();
      setDefaultHours(refreshData.defaultOrari || []);

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  // Handle time change for default hours
  const handleTimeChange = (field, value) => {
    setDefaultHours(prev => prev.map(h =>
      h.giornoSettimana === selectedDay
        ? { ...h, [field]: value }
        : h
    ));
  };

  // Handle closed toggle for default hours
  const handleClosedToggle = () => {
    setDefaultHours(prev => prev.map(h =>
      h.giornoSettimana === selectedDay
        ? { ...h, chiuso: !h.chiuso }
        : h
    ));
  };

  // Handle update all days
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

      if (!response.ok) {
        throw new Error('Failed to update all default hours');
      }

      // Refresh data
      const data = await response.json();
      setMessage({ type: 'success', text: data.message || 'Tutti gli orari predefiniti aggiornati con successo' });

      // Refresh the list
      const refreshResponse = await fetch('/api/admin/orari', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const refreshData = await refreshResponse.json();
      setDefaultHours(refreshData.defaultOrari || []);
      setShowAllDaysModal(false);

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  // Handle specific date modal
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

  // Handle specific date save
  const handleSpecificDateSave = async () => {
    setSaving(true);
    try {
      const url = editingSpecificId
        ? `/api/admin/orari/specific/${editingSpecificId}`
        : '/api/admin/orari/specific';

      const method = editingSpecificId ? 'PUT' : 'POST';

      // For now, we'll remove existing and add new since we don't have PUT endpoint
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

      if (!response.ok) {
        throw new Error('Failed to save specific date hours');
      }

      // Refresh data
      const refreshResponse = await fetch('/api/admin/orari', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const refreshData = await refreshResponse.json();
      setSpecificHours(refreshData.specificOrari || []);

      setMessage({ type: 'success', text: 'Eccezione data specifica salvata con successo' });
      setShowSpecificDateModal(false);

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  // Handle specific date delete
  const handleSpecificDateDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler rimuovere questa eccezione?')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/orari/specific/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete specific date hours');
      }

      // Refresh data
      const refreshResponse = await fetch('/api/admin/orari', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const refreshData = await refreshResponse.json();
      setSpecificHours(refreshData.specificOrari || []);

      setMessage({ type: 'success', text: 'Eccezione data specifica rimossa con successo' });

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('it-IT', { weekday: 'long' });

      // Find specific override for this date
      const specificOverride = specificHours.find(h => h.dataSpecifica === dateStr);

      // Find default hours for this day of week
      const defaultDay = daysOfWeek.find(d => d.label.toUpperCase() === dayName.toUpperCase());
      const defaultOverride = defaultHours.find(h => h.giornoSettimana === defaultDay?.value);

      days.push({
        date: i,
        dateStr,
        isToday: dateStr === todayStr,
        hasOverride: !!specificOverride,
        isClosed: specificOverride ? specificOverride.chiuso : defaultOverride?.chiuso,
        hours: specificOverride
          ? `${specificOverride.oraApertura || 'Chiuso'} - ${specificOverride.oraChiusura || ''}`
          : defaultOverride
            ? `${defaultOverride.oraApertura} - ${defaultOverride.oraChiusura}`
            : 'Non impostato'
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  const currentMonthName = monthNames[currentMonth.getMonth()];
  const currentYear = currentMonth.getFullYear();

  if (loading) {
    return (
      <div className="studio-hours-container">
        <div className="loading-spinner">Caricamento...</div>
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
            <button
              onClick={() => setShowAllDaysModal(true)}
              className="update-all-button"
            >
              📅 Imposta Tutti i Giorni
            </button>
            <button
              onClick={() => setShowBlockedSpotModal(true)}
              className="btn-secondary"
            >
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

            <div className="form-group">
              <label>Stato:</label>
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
            <h4>{currentMonthName} {currentYear}</h4>
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
                className={`calendar-day ${day ? '' : 'empty'} ${day?.isToday ? 'today' : ''} ${day?.hasOverride ? 'has-override' : ''} ${day?.isClosed ? 'closed' : 'open'}`}
                onClick={() => day && openSpecificDateModal(day.dateStr)}
              >
                {day ? (
                  <>
                    <div className="day-number">{day.date}</div>
                    {day.hasOverride && <div className="override-badge">⭐</div>}
                    <div className="day-hours">{day.hours}</div>
                  </>
                ) : null}
              </div>
            ))}
          </div>

          <button
            onClick={() => openSpecificDateModal()}
            className="add-specific-button"
          >
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
            // Refresh the data to show the new blocked spot
            const fetchStudioHours = async () => {
              try {
                const response = await fetch('/api/admin/orari', {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });

                if (response.ok) {
                  const data = await response.json();
                  setDefaultHours(data.defaultOrari || []);
                  setSpecificHours(data.specificOrari || []);
                }
              } catch (error) {
                console.error('Error refreshing studio hours:', error);
              }
            };

            fetchStudioHours();
          }}
          selectedDate={currentMonth.toISOString().split('T')[0]}
        />
      )}
    </div>
  );
};

export default StudioHoursAdmin;