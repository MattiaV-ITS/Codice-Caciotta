import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import SchedaAnimale from '../Animali/SchedaAnimale';
import VisitaForm from './VisitaForm';
import FattureLista from '../../components/FattureLista';
import VaccinazioneCreateModal from '../../components/VaccinazioneCreateModal/VaccinazioneCreateModal';
import DocumentiAllegati from '../../components/Documenti/DocumentiAllegati';
import { getCurrentISODatetime, toISODatetimeFormat, toISODateFormat, formatDate, formatDateShort, formatTime, parseDate } from '../../utils/dateUtils';
import { PlusIcon, SyringeIcon, DangerIcon } from '../../components/icons';

// ==============================
// COMPONENTE
// ==============================
function VisitePagina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const visitaId = parseInt(id);
  const api = useApi();
  const { get } = api;

  const [visita, setVisita] = useState(null);
  const [animale, setAnimale] = useState(null);
  const [visite, setvisite] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVaccinazioneModal, setShowVaccinazioneModal] = useState(false);
  const { user } = useAuth();
  const [vaccinazioni, setVaccinazioni] = useState([]);
  const [vaccinazioniLoading, setVaccinazioniLoading] = useState(true);
  const [vaccinazioniError, setVaccinazioniError] = useState(null);
  const [vaccinazioniRefresh, setVaccinazioniRefresh] = useState(0);
  const isStaffOrAdmin = user?.roles?.some(r => r === 'ROLE_STAFF' || r === 'ROLE_ADMIN');

  // ID della visita più recente per data (per il pulsante "Torna alla visita corrente")
  const visitaCorrenteId = visite.length > 0 ? Math.max(...visite.map(v => {
    const date = parseDate(v.dataOraVisita);
    return date ? date.getTime() : 0;
  })) : null;
  const visitaCorrente = visitaCorrenteId > 0 
    ? visite.find(v => {
        const date = parseDate(v.dataOraVisita);
        return date && date.getTime() === visitaCorrenteId;
      })?.id 
    : (visite.length > 0 ? Math.max(...visite.map(v => v.id)) : null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (visitaId) {
          // Fetch visita details
          const visitaResponse = await api.get(`/api/visite/${visitaId}`);
          if (!visitaResponse.ok) {
            throw new Error(`Failed to fetch visita: ${visitaResponse.status}`);
          }
          const visitaData = await visitaResponse.json();

          // Fetch animal details using the visita data
          let animaleData;
          if (visitaData.animaleId) {
            const animaleResponse = await api.get(`/api/animali/${visitaData.animaleId}`);
            if (!animaleResponse.ok) {
              throw new Error(`Failed to fetch animale: ${animaleResponse.status}`);
            }
            animaleData = await animaleResponse.json();
          } else {
            throw new Error('Animal ID is missing from visita data');
          }

          // Fetch previous visits for this animal
          const visiteResponse = await api.get(`/api/visite/animale/${animaleData.id}`);
          const visiteData = await visiteResponse.json();

          setVisita({
            id: visitaData.id,
            visitStart: visitaData.visitStart || visitaData.dataOraVisita,
            dataOraVisita: visitaData.dataOraVisita,
            dataOraFineVisita: visitaData.dataOraFineVisita,
            durata: visitaData.durata || 0, // This will be calculated from dataOraFineVisita if available
            tipoVisita: visitaData.tipoVisita || '',
            stato: visitaData.stato || 'Pianificata',
            sintomi: visitaData.sintomi || '',
            diagnosi: visitaData.diagnosi || '',
            trattamentoTerapia: visitaData.trattamentoTerapia || '',
            note: visitaData.note || '',
            notePrivate: visitaData.notePrivate || ''
          });

          setAnimale(animaleData);
          setvisite(visiteData);

        } else {
          // New visita - we need to know the animal ID from URL params or context
          // For now, let's assume it comes from URL params like /visite/new/:animaleId
          const animalId = parseInt(new URLSearchParams(window.location.search).get('animaleId'));

          if (animalId && !isNaN(animalId)) {
            const animaleResponse = await api.get(`/api/animali/${animalId}`);
            if (!animaleResponse.ok) {
              if (animaleResponse.status === 400) {
                throw new Error('Invalid animal ID provided');
              }
              throw new Error(`Failed to fetch animale: ${animalId}`);
            }
            const animaleData = await animaleResponse.json();
            setAnimale(animaleData);

            // Fetch previous visits for this animal
            const visiteResponse = await api.get(`/api/visite/animale/${animalId}`);
            const visiteData = await visiteResponse.json();
            setvisite(visiteData);
          }

          // Set default values for new visita
          const nowStr = getCurrentISODatetime();

          setVisita({
            id: null,
            visitStart: nowStr,
            dataOraVisita: nowStr,
            dataOraFineVisita: nowStr, // Default: end time same as start time
            tipoVisita: '',
            sintomi: '',
            diagnosi: '',
            trattamentoTerapia: '',
            note: '',
            notePrivate: ''
          });
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load visita data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [visitaId]);

  // Fetch vaccinazioni dell'animale per la sidebar
  useEffect(() => {
    let cancelled = false;
    const fetchVaccinazioni = async () => {
      try {
        if (!animale?.id) {
          setVaccinazioni([]);
          setVaccinazioniLoading(false);
          return;
        }
        setVaccinazioniLoading(true);
        const response = await api.get('/api/vaccinazioni', { params: { animaleId: animale.id, size: 200, page: 0 } });
        if (!cancelled && response.ok) {
          const data = await response.json();
          const list = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
          setVaccinazioni(list);
          setVaccinazioniError(null);
        }
      } catch (err) {
        if (!cancelled) setVaccinazioniError(err.message || 'Errore caricamento vaccinazioni');
      } finally {
        if (!cancelled) setVaccinazioniLoading(false);
      }
    };
    fetchVaccinazioni();
    return () => { cancelled = true; };
  }, [animale?.id, vaccinazioniRefresh, get]);

  // ----- SALVATAGGIO (senza popup) -----
  const saveVisita = async (visitaData) => {
    setIsSaving(true);
    try {
      if (visita.id) {
        // Aggiornamento visita esistente
        const response = await api.patch(`/api/visite/${visita.id}`, visitaData);
        if (!response.ok) {
          throw new Error(`Errore durante l'aggiornamento: ${response.status}`);
        }
        // Get the updated visita data from the response
        const updatedVisita = await response.json();
        
        // Update local state with the new data to avoid stale data
        setVisita(prev => ({
          ...prev,
          ...updatedVisita,
          // Ensure we maintain the correct format for datetime fields
          dataOraVisita: updatedVisita.dataOraVisita,
          dataOraFineVisita: updatedVisita.dataOraFineVisita,
          tipoVisita: updatedVisita.tipoVisita,
          sintomi: updatedVisita.sintomi,
          diagnosi: updatedVisita.diagnosi,
          trattamentoTerapia: updatedVisita.trattamentoTerapia,
          note: updatedVisita.note,
          notePrivate: updatedVisita.notePrivate
        }));
        
        // Force refresh of the visits list to ensure right panel updates
        if (animale?.id) {
          const visiteResponse = await api.get(`/api/visite/animale/${animale.id}`);
          if (visiteResponse.ok) {
            const visiteData = await visiteResponse.json();
            setvisite(visiteData);
          }
        }
      } else {
        // Creazione nuova visita
        const animalId = animale?.id;
        if (!animalId) {
          throw new Error('ID animale mancante');
        }
        const response = await api.post(`/api/visite/animale/${animalId}`, visitaData);
        if (!response.ok) {
          throw new Error(`Errore durante la creazione: ${response.status}`);
        }
        const createdVisita = await response.json();
        // Naviga alla visita appena creata
        navigate(`/visite/${createdVisita.id}`);
      }
    } catch (err) {
      // Rilancia l'errore per farlo gestire a VisitaForm (che lo mostrerà nel form)
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const goToVisita = (visitaId) => {
    navigate(`/visite/${visitaId}`);
  };

  const goToVisitaCorrente = () => {
    navigate(`/visite/${visitaCorrente}`);
  };



  if (isLoading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento visita...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-wrapper">
        <div className="error-icon">
          <DangerIcon width={32} height={32} style={{ color: '#C62828' }} />
        </div>
        <h3>Errore di caricamento</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Riprova</button>
      </div>
    );
  }

  if (!visita || !animale) {
    return (
      <div className="error-wrapper">
        <div className="error-icon" style={{ color: '#C62828', fontSize: '32px', fontWeight: 'bold' }}>✕</div>
        <h3>Dati non disponibili</h3>
        <p>Impossibile caricare i dati della visita o dell'animale</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Riprova</button>
      </div>
    );
  }

  const isVisitaCorrente = visitaId === visitaCorrente || !visita.id;

  return (
    <div className="visite-pagina">

      {/* ==================== COLONNA SINISTRA - DATI ANIMALE ==================== */}
      <SchedaAnimale animale={animale} />

      {/* ==================== COLONNA CENTRALE - FORM VISITA ==================== */}
      <VisitaForm
        visita={visita}
        animale={animale}
        proprietario={animale?.proprietario}
        onSave={saveVisita}
        onCancel={() => navigate('/visite')}
        isSaving={isSaving}
        initialEditMode={!visita.id} // New visits start in edit mode, existing visits start in read-only mode
      />

      {/* ==================== COLONNA DESTRA ==================== */}
      <div className="visite-colonna-destra">

        {/* 1. BLOCCO "DOCUMENTI DELLA VISITA" */}
        {visita.id && animale && (
          <div className="visite-card">
            <div className="visite-card-header">
              <h3>Documenti Visita</h3>
            </div>
            <div className="visite-card-body" style={{ padding: 'var(--space-2)' }}>
              <DocumentiAllegati
                animaleId={animale.id}
                visitaId={visita.id}
                titolo="Documenti visita"
                nascondiSeVuoto={false}
              />
            </div>
          </div>
        )}

        {/* 1b. BLOCCO "DOCUMENTI DELL'ANIMALE" (sempre visibili) */}
        {animale && (
          <div className="visite-card">
            <div className="visite-card-header">
              <h3>Documenti Animale</h3>
            </div>
            <div className="visite-card-body" style={{ padding: 'var(--space-2)' }}>
              <DocumentiAllegati
                animaleId={animale.id}
                titolo="Tutti i documenti"
                nascondiSeVuoto={false}
              />
            </div>
          </div>
        )}

        {/* 2. BLOCCO "FATTURE" */}
        {visita.id && (
          <FattureLista visitaId={visita.id} animaleId={animale.id} />
        )}

        {/* 3. BLOCCO "VACCINAZIONI" */}
        <div className="visite-card">
          <div className="visite-card-header">
            <h3>Vaccinazioni</h3>
          </div>
          <div className="visite-card-body">
            {vaccinazioniLoading ? (
              <div style={{ color: 'var(--gray-500)', fontSize: '13px' }}>Caricamento vaccinazioni...</div>
            ) : vaccinazioniError ? (
              <div style={{ color: 'var(--danger)', fontSize: '13px' }}>{vaccinazioniError}</div>
            ) : vaccinazioni.length === 0 ? (
              <p className="visite-empty" style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                Nessuna vaccinazione per {animale.nome}
              </p>
            ) : (
              <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                {vaccinazioni.map((v) => {
                  const stato = String(v.statoVaccinazione || '').toUpperCase();
                  const colors =
                    stato === 'VALIDO'
                      ? { bg: '#f0fff4', border: '#38a169' }
                      : stato === 'PROSSIMO'
                        ? { bg: '#fffaf0', border: '#dd6b20' }
                        : stato === 'SCADUTO'
                          ? { bg: '#fff5f5', border: '#e53e3e' }
                          : { bg: '#fff', border: '#ccc' };
                  return (
                    <div
                      key={v.id}
                      style={{
                        padding: '8px',
                        marginBottom: '6px',
                        borderRadius: '4px',
                        backgroundColor: colors.bg,
                        borderLeft: `3px solid ${colors.border}`,
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{v.tipoVaccino}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)', fontSize: '12px', marginTop: '2px' }}>
                        <span>Somministrazione: {v.dataSomministrazione}</span>
                        <span>Scadenza: {v.dataScadenza}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {isStaffOrAdmin && (
            <div className="visite-card-footer">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowVaccinazioneModal(true)}
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <SyringeIcon width={16} height={16} fill="currentColor" />
                Nuova Vaccinazione
              </button>
            </div>
          )}
        </div>

        {/* 4. BLOCCO "VISITE" */}
        <div className="visite-card visite-card-precedenti">
          <div className="visite-card-header">
            <h3>Visite</h3>
            <span className="visite-count">{visite.length}</span>
          </div>
          <div className="visite-card-body">
            {visite.length === 0 ? (
              <p className="visite-empty">Nessuna visita precedente</p>
            ) : (
              <>
                <ul className="visite-list">
                  {visite.map((v) => (
                    <li
                      key={v.id}
                      className={`visite-list-item ${v.id === visitaId ? 'active' : ''}`}
                      onClick={() => goToVisita(v.id)}
                    >
                      <div className="visite-list-item-date">
                        <span className="visite-list-day">{formatDateShort(v.dataOraVisita)}</span>
                        <span className="visite-list-time">{formatTime(v.dataOraVisita)}</span>
                      </div>
                      <div className="visite-list-item-info">
                        <span className="visite-list-tipo">{v.tipoVisita || 'Visita'}</span>
                        <span className="visite-list-id">#{v.id}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                {!isVisitaCorrente && (
                  <div className="visite-corrente-btn-wrapper">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={goToVisitaCorrente}
                    >
                      ← Torna alla visita corrente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="visite-card-footer">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/visite/new?animaleId=${animale.id}`)}
              style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <PlusIcon width={16} height={16} stroke="currentColor" />
              Nuova Visita
            </button>
          </div>
        </div>
      </div>

      {/* MODALE CREAZIONE VACCINAZIONE */}
      {showVaccinazioneModal && animale && (
        <VaccinazioneCreateModal
          animaleId={animale.id}
          animaleNome={animale.nome}
          onClose={() => setShowVaccinazioneModal(false)}
          onSuccess={() => {
            setShowVaccinazioneModal(false);
            setVaccinazioniRefresh((prev) => prev + 1);
          }}
        />
      )}

    </div>
  );
}

export default VisitePagina;