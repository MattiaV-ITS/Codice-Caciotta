import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../services/apiService';
import { usePrenotazioneForm } from '../../hooks/usePrenotazioneForm';
import FormModal from '../../components/FormModal/FormModal';

function PrenotazioneCreateUser({ onClose, onSuccess }) {
  const { user } = useAuth();
  const { get } = useApi();

  // Use shared hook
  const {
    prestazioni, loadingPrestazioni, errorPrestazioni, availablePrestazioni,
    formData, setFormData,
    errors, hasError,
    isSubmitting, submitError,
    selectedDate, availableHours, hasSelectedDate, isTipoVisitaSelected, showSpecificaTipo,
    handleChange, handleBlur, handleDateChange, handleHourSelect, handleSubmit,
    setErrors, setTouched,
  } = usePrenotazioneForm({ onClose, onSuccess });

  // User's animals - simple select
  const [animali, setAnimali] = useState([]);
  const [loadingAnimali, setLoadingAnimali] = useState(true);

  // Fetch user's animals and auto-set proprietario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user info to find proprietarioId
        const meResponse = await get('/api/auth/me');
        if (meResponse.ok) {
          const meData = await meResponse.json();
          const proprietarioId = meData.proprietarioId;

          if (proprietarioId) {
            // Auto-set proprietario
            setFormData(prev => ({ ...prev, proprietarioId: proprietarioId.toString() }));

            // Fetch user's animals
            const animaliResponse = await get(`/api/animali?proprietarioId=${proprietarioId}&size=100`);
            if (animaliResponse.ok) {
              const data = await animaliResponse.json();
              const animaliList = Array.isArray(data) ? data : (data.content || []);
              setAnimali(animaliList);
            }
          }
        }
      } catch (error) {
        logger.error('Error fetching user data:', error);
      } finally {
        setLoadingAnimali(false);
      }
    };

    fetchUserData();
  }, [get, setFormData]);

  const handleAnimaleSelect = (e) => {
    const animaleId = e.target.value;
    setFormData(prev => ({ ...prev, animaleId }));
    setTouched(prev => ({ ...prev, animaleId: true }));
    if (animaleId) {
      setErrors(prev => ({ ...prev, animaleId: '' }));
    }
  };

  return (
    <FormModal
      title="Nuova Prenotazione"
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Prenota"
      submitError={submitError}
    >
      <div className="proprietario-form-grid">
        {/* Animale (solo i tuoi animali) */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Il tuo animale *</label>
          {loadingAnimali ? (
            <div style={{ color: 'var(--gray-500)', fontSize: '14px', padding: '8px' }}>
              Caricamento animali...
            </div>
          ) : animali.length === 0 ? (
            <div style={{
              color: 'var(--warning)', fontSize: '14px', padding: '12px',
              background: 'var(--warning-light)', borderRadius: 'var(--radius)',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              Non hai ancora animali registrati. Aggiungi un animale prima di prenotare.
            </div>
          ) : (
            <>
              <select
                name="animaleId"
                className={`form-control ${hasError('animaleId') ? 'is-invalid' : ''}`}
                value={formData.animaleId}
                onChange={handleAnimaleSelect}
                onBlur={handleBlur}
              >
                <option value="">Seleziona il tuo animale</option>
                {animali.map((animale) => (
                  <option key={animale.id} value={animale.id}>
                    {animale.nome} - {animale.specie}{animale.razza ? ` (${animale.razza})` : ''}
                  </option>
                ))}
              </select>
              {hasError('animaleId') && <div className="form-error">{errors.animaleId}</div>}
            </>
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
                {prestazioni.map((prestazione) => {
                  const isAvailable = availablePrestazioni.some(p => p.id === prestazione.id);
                  return (
                    <option 
                      key={prestazione.id} 
                      value={prestazione.nomePrestazione}
                      disabled={!isAvailable}
                    >
                      {prestazione.nomePrestazione} - €{prestazione.costoBase?.toFixed(2) || '0.00'}
                      {!isAvailable ? ' (Non disponibile)' : ''}
                    </option>
                  );
                })}
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
          {isTipoVisitaSelected ? (
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
          {isTipoVisitaSelected ? (
            hasSelectedDate ? (
              availableHours.length > 0 ? (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px',
                  maxHeight: '120px', overflowY: 'auto', padding: '4px',
                  border: `1px solid ${hasError('dataOraAppuntamento') ? 'var(--danger)' : 'var(--gray-200)'}`,
                  borderRadius: 'var(--radius)', background: 'var(--white)'
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

export default PrenotazioneCreateUser;
