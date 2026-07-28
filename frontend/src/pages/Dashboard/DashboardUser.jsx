import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../services/apiService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import AnimaleCreate from '../Animali/AnimaleCreate';
import ProprietarioRegistrationModal from '../../components/ProprietarioRegistrationModal';
import PrenotazioneCreateUser from '../Prenotazioni/PrenotazioneCreateUser';
import './DashboardUser.css';
import { 
  UserIcon, 
  PawIcon, 
  CalendarIcon, 
  CalendarIcon2, 
  ChartIcon, 
  PlusIcon,
  SyringeIcon 
} from '../../components/icons';

function DashboardUser() {
  const { user, updateUser } = useAuth();
  const { get } = useApi();
  const navigate = useNavigate();

  const [animali, setAnimali] = useState([]);
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProprietarioModal, setShowProprietarioModal] = useState(false);
  const [showPrenotazioneModal, setShowPrenotazioneModal] = useState(false);
  const [hasProprietario, setHasProprietario] = useState(false);
  const [vaccinazioniScaduteIds, setVaccinazioniScaduteIds] = useState([]);
  const [animaleVaccinazioni, setAnimaleVaccinazioni] = useState({});

  const checkProprietario = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      const response = await get(`/api/auth/me`);
      const data = await response.json();
      
      if (response.ok && data.proprietarioId) {
        setHasProprietario(true);
        updateUser({
          ...user,
          proprietarioId: data.proprietarioId
        });
        return true;
      }
      return false;
    } catch (err) {
      logger.error('Errore nel controllo del proprietario:', err);
      return false;
    }
  }, [get, updateUser, user.id]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const proprietarioId = user.proprietarioId;
      if (!proprietarioId) {
        setAnimali([]);
        setVaccinazioniScaduteIds([]);
        setAnimaleVaccinazioni({});
        setLoading(false);
        return;
      }
      
      const animaliRes = await get(`/api/animali?proprietarioId=${proprietarioId}&page=0&size=10`);
      const animaliData = await animaliRes.json();
      const animaliList = animaliData.content || [];
      setAnimali(animaliList);
      
      // Fetch vaccinations for each animal and find expired ones
      let scaduteIds = [];
      let vaccMap = {};
      
      await Promise.all(animaliList.map(async (animale) => {
        try {
          const vaccRes = await get(`/api/vaccinazioni?animaleId=${animale.id}&size=50&page=0`);
          if (vaccRes.ok) {
            const vaccData = await vaccRes.json();
            const vaccList = vaccData.content || [];
            vaccMap[animale.id] = vaccList;
            
            const hasScadute = vaccList.some(v => {
              const stato = String(v.statoVaccinazione || '').toUpperCase();
              return stato === 'SCADUTO';
            });
            
            if (hasScadute) {
              scaduteIds.push(animale.id);
            }
          }
        } catch (err) {
          logger.error(`Error fetching vaccinations for animal ${animale.id}:`, err);
        }
      }));
      
      setVaccinazioniScaduteIds(scaduteIds);
      setAnimaleVaccinazioni(vaccMap);

      const prenotazioniRes = await get(`/api/prenotazioni?proprietarioId=${proprietarioId}`);
      const prenotazioniData = await prenotazioniRes.json();
      setPrenotazioni(Array.isArray(prenotazioniData) ? prenotazioniData : []);

      setLoading(false);
    } catch (err) {
      logger.error('Errore caricamento dashboard utente:', err);
      setError('Impossibile caricare i dati. Riprova pi\u00F9 tardi.');
      setLoading(false);
    }
  }, [get, user]);

  const isInitialized = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      if (isInitialized.current) return;
      isInitialized.current = true;

      await checkProprietario();
      await loadData();
    };
    initialize();
  }, [checkProprietario, loadData]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadData();
  };

  const handlePrenotaVisita = () => {
    setShowPrenotazioneModal(true);
  };

  const handlePrenotazioneSuccess = () => {
    setShowPrenotazioneModal(false);
    loadData();
  };

  const handleCreateProprietarioSuccess = () => {
    setShowProprietarioModal(false);
    checkProprietario();
  };

  const handleCreateProprietarioSkip = () => {
    setShowProprietarioModal(false);
  };

  const handleSchedaAnimale = (animaleId) => {
    navigate(`/animali/user/${animaleId}`);
  };

  const prossimaVisita = prenotazioni.length > 0 ? prenotazioni[0] : null;
  const prenotazioniAttive = prenotazioni.filter(p => {
    const now = new Date();
    const appuntamento = new Date(p.dataOraAppuntamento);
    return appuntamento > now;
  }).length;

  const getVaccStatusColor = (vaccinazione) => {
    const stato = String(vaccinazione.statoVaccinazione || '').toUpperCase();
    if (stato === 'SCADUTO') return '#e53e3e';
    if (stato === 'PROSSIMO') return '#dd6b20';
    return '#38a169';
  };

  const getVaccStatusBg = (vaccinazione) => {
    const stato = String(vaccinazione.statoVaccinazione || '').toUpperCase();
    if (stato === 'SCADUTO') return '#fff5f5';
    if (stato === 'PROSSIMO') return '#fffaf0';
    return '#f0fff4';
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="form-error">{error}</div>
        <button className="btn btn-primary mt-3" onClick={loadData}>
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-user">

      {/* HEADER */}
      <div className="dashboard-user-header">
        <div>
          <h1 className="dashboard-user-title">
            Bentornato, <span className="dashboard-user-name">{user?.username || 'Utente'}</span>
          </h1>
          <p className="dashboard-user-subtitle">Gestisci i tuoi animali e le tue prenotazioni</p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {!hasProprietario && (
            <button className="btn btn-secondary" onClick={() => setShowProprietarioModal(true)}>
                <PlusIcon width="16" height="16" stroke="currentColor" />
                Crea Profilo Proprietario
            </button>
          )}
          <button className="btn btn-primary" onClick={handlePrenotaVisita}>
          <PlusIcon width="16" height="16" stroke="currentColor" />
          Prenota visita
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card border-primary">
          <div className="kpi-label">
            <PawIcon width="20" height="20" fill="var(--gray-500)" />
            I tuoi animali
          </div>
          <div className="kpi-value">{animali.length}</div>
          <div className="kpi-change">{animali.length > 0 ? 'Registrati' : 'Nessuno ancora'}</div>
        </div>

        <div className="kpi-card border-success">
          <div className="kpi-label">
            <CalendarIcon2 width="20" height="20" fill="var(--gray-500)" />
            Prossima visita
          </div>
          <div className="kpi-value">
            {prossimaVisita ? (
              <span style={{ fontSize: '20px', fontWeight: '600' }}>
                {formatDate(prossimaVisita.dataOraAppuntamento)}
              </span>
            ) : (
              '-'
            )}
          </div>
          <div className="kpi-change" style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
            {prossimaVisita 
              ? `${prossimaVisita.animaleNome} \u2022 ${formatTime(prossimaVisita.dataOraAppuntamento)}`
              : 'Nessuna visita programmata'}
          </div>
        </div>

        <div className="kpi-card border-warning">
          <div className="kpi-label">
            <CalendarIcon width="20" height="20" stroke="var(--gray-500)" />
            Prenotazioni attive
          </div>
          <div className="kpi-value">{prenotazioniAttive}</div>
          <div className="kpi-change">{prenotazioniAttive > 0 ? 'In attesa' : 'Nessuna'}</div>
        </div>

        <div className="kpi-card border-danger">
          <div className="kpi-label">
            <ChartIcon width="20" height="20" stroke="var(--gray-500)" />
            Totale prenotazioni
          </div>
          <div className="kpi-value">{prenotazioni.length}</div>
          <div className="kpi-change">{prenotazioni.length > 0 ? 'Registrate' : 'Nessuna'}</div>
        </div>
      </div>

      {/* PROSSIME VISITE */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card-header">
          <h3>Prossime visite</h3>
          <button className="btn btn-primary btn-sm" onClick={handlePrenotaVisita}>Prenota</button>
        </div>
        <div className="card-body">
          {prenotazioni.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <CalendarIcon width="48" height="48" stroke="var(--gray-400)" opacity="0.5" />
              </div>
              <div className="empty-title">Nessuna visita programmata</div>
              <p className="empty-description">Non hai visite in programma. Prenota ora il tuo appuntamento.</p>
              <button className="btn btn-primary mt-3" onClick={handlePrenotaVisita}>Prenota ora</button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Animale</th>
                    <th>Data</th>
                    <th>Ora</th>
                    <th>Tipo</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {prenotazioni.map((prenotazione) => (
                    <tr key={prenotazione.id}>
                      <td>
                        <div className="cell-content" style={{ gap: '8px' }}>
                          <div className="avatar-circle avatar-primary" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                            {prenotazione.animaleNome?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <strong>{prenotazione.animaleNome}</strong>
                        </div>
                      </td>
                      <td>{formatDate(prenotazione.dataOraAppuntamento)}</td>
                      <td>{formatTime(prenotazione.dataOraAppuntamento)}</td>
                      <td>{prenotazione.tipoVisita}</td>
                      <td className="actions-menu">\u22EF</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* I TUOI ANIMALI - Card unica con vaccinazioni integrate */}
      <div className="card animali-master-card">
        <div className="card-header">
          <h3>
            <PawIcon width="20" height="20" fill="var(--primary)" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            I tuoi animali
            {animali.length > 0 && (
              <span className="badge badge-primary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                {animali.length}
              </span>
            )}
          </h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <PlusIcon width={16} height={16} stroke="currentColor" />
            Aggiungi
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {animali.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <PawIcon width="48" height="48" fill="var(--gray-400)" opacity="0.5" />
              </div>
              <div className="empty-title">Nessun animale registrato</div>
              <p className="empty-description">Aggiungi il tuo primo animale per iniziare.</p>
              <button className="btn btn-primary mt-3" onClick={() => setShowCreateModal(true)}>
                <PlusIcon width="16" height="16" stroke="currentColor" />
                Aggiungi animale
              </button>
            </div>
          ) : (
            <div className="animali-modern-list">
              {animali.map((animale) => {
                const vaccList = animaleVaccinazioni[animale.id] || [];
                const hasScadute = vaccinazioniScaduteIds.includes(animale.id);
                const scaduteCount = vaccList.filter(v => {
                  const stato = String(v.statoVaccinazione || '').toUpperCase();
                  return stato === 'SCADUTO';
                }).length;
                const prossimeCount = vaccList.filter(v => {
                  const stato = String(v.statoVaccinazione || '').toUpperCase();
                  return stato === 'PROSSIMO';
                }).length;
                const valideCount = vaccList.filter(v => {
                  const stato = String(v.statoVaccinazione || '').toUpperCase();
                  return stato === 'VALIDO';
                }).length;

                return (
                  <div
                    key={animale.id}
                    className={`animale-modern-card ${hasScadute ? 'has-scadute' : ''}`}
                    onClick={() => handleSchedaAnimale(animale.id)}
                  >
                    <div className="animale-modern-avatar" data-specie={animale.specie}>
                      {animale.nome?.charAt(0).toUpperCase() || '?'}
                    </div>
                    
                    <div className="animale-modern-info">
                      <div className="animale-modern-nome">
                        {animale.nome}
                        {animale.stato && (
                          <span className={`animale-modern-badge badge-${animale.stato.toLowerCase()}`}>
                            {animale.stato.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="animale-modern-meta">
                        <span>{animale.specie}</span>
                        {animale.razza && <span> \u2022 {animale.razza}</span>}
                        {animale.sesso && <span> \u2022 {animale.sesso === 'M' ? 'Maschio' : animale.sesso === 'F' ? 'Femmina' : ''}</span>}
                      </div>
                    </div>

                    <div className="animale-modern-vacc-status">
                      {/* Vaccination summary dots */}
                      <div className="vacc-status-dots">
                        {valideCount > 0 && (
                          <div className="vacc-dot vacc-dot-valido" title={`${valideCount} valide`}>
                            <span>{valideCount}</span>
                          </div>
                        )}
                        {prossimeCount > 0 && (
                          <div className="vacc-dot vacc-dot-prossimo" title={`${prossimeCount} in scadenza`}>
                            <span>{prossimeCount}</span>
                          </div>
                        )}
                        {scaduteCount > 0 && (
                          <div className="vacc-dot vacc-dot-scaduto" title={`${scaduteCount} scadute`}>
                            <span>{scaduteCount}</span>
                          </div>
                        )}
                        {vaccList.length === 0 && (
                          <div className="vacc-dot vacc-dot-none" title="Nessuna vaccinazione">
                            <span>0</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="animale-modern-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>

                    {/* Vaccination details expand */}
                    {vaccList.length > 0 && (
                      <div className="animale-modern-vacc-details">
                        {vaccList.slice(0, 3).map(v => {
                          const color = getVaccStatusColor(v);
                          const bg = getVaccStatusBg(v);
                          const stato = String(v.statoVaccinazione || '').toUpperCase();
                          const label = stato === 'SCADUTO' ? 'Scaduta' : stato === 'PROSSIMO' ? 'In scadenza' : 'Valida';
                          return (
                            <div key={v.id} className="animale-vacc-item" style={{ backgroundColor: bg, borderLeftColor: color }}>
                              <div className="animale-vacc-item-info">
                                <span className="animale-vacc-item-name">{v.tipoVaccino}</span>
                                <span className="animale-vacc-item-date">Scad. {v.dataScadenza}</span>
                              </div>
                              <span className="animale-vacc-item-badge" style={{ color, fontWeight: 600, fontSize: '11px' }}>
                                {label}
                              </span>
                            </div>
                          );
                        })}
                        {vaccList.length > 3 && (
                          <div className="animale-vacc-more">
                            +{vaccList.length - 3} altre vaccinazioni
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODALE CREAZIONE ANIMALE */}
      {showCreateModal && (
        <AnimaleCreate
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          proprietarioPrecompilatoId={user?.proprietarioId}
        />
      )}

      {/* MODALE CREAZIONE PROPRIETARIO */}
      {showProprietarioModal && (
        <ProprietarioRegistrationModal
          onClose={() => setShowProprietarioModal(false)}
          onSuccess={handleCreateProprietarioSuccess}
          onSkip={handleCreateProprietarioSkip}
        />
      )}

      {/* MODALE PRENOTAZIONE VISITA */}
      {showPrenotazioneModal && (
        <PrenotazioneCreateUser
          onClose={() => setShowPrenotazioneModal(false)}
          onSuccess={handlePrenotazioneSuccess}
        />
      )}
    </div>
  );
}

export default DashboardUser;