import React, { useCallback, useEffect, useState } from 'react';
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
  PlusIcon 
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

  const checkProprietario = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      const response = await get(`/api/auth/me`);
      const data = await response.json();
      
      if (response.ok && data.proprietarioId) {
        setHasProprietario(true);
        // Update user context with proprietarioId
        updateUser({
          ...user,
          proprietarioId: data.proprietarioId
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Errore nel controllo del proprietario:', err);
      return false;
    }
  }, [get, updateUser, user]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const proprietarioId = user.proprietarioId;
      if (!proprietarioId) {
        setAnimali([]);
        setLoading(false);
        return;
      }
      const animaliRes = await get(`/api/animali?proprietarioId=${proprietarioId}&page=0&size=4`);
      const animaliData = await animaliRes.json();
      setAnimali(animaliData.content || []);

      const prenotazioniRes = await get(`/api/prenotazioni?proprietarioId=${proprietarioId}`);
      const prenotazioniData = await prenotazioniRes.json();
      setPrenotazioni(Array.isArray(prenotazioniData) ? prenotazioniData : []);

      setLoading(false);
    } catch (err) {
      console.error('Errore caricamento dashboard utente:', err);
      setError('Impossibile caricare i dati. Riprova più tardi.');
      setLoading(false);
    }
  }, [get, user]);

  useEffect(() => {
    const initialize = async () => {
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
    checkProprietario(); // Re-check proprietario status
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
          <p className="dashboard-user-subtitle">Prenota la tua prossima visita</p>
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
              ? `${prossimaVisita.animaleNome} • ${formatTime(prossimaVisita.dataOraAppuntamento)}`
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
      <div className="card">
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
                      <td className="actions-menu">⋯</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* I TUOI ANIMALI */}
      <div className="card" style={{ marginTop: 'var(--space-4)' }}>
        <div className="card-header">
          <h3>I tuoi animali</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <PlusIcon width="16" height="16" stroke="currentColor" />
            Aggiungi
          </button>
        </div>
        <div className="card-body">
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
            <div className="animali-user-grid-compact">
              {animali.map((animale) => (
                <div
                  key={animale.id}
                  className="animali-user-card-compact"
                  data-specie={animale.specie}
                  onClick={() => handleSchedaAnimale(animale.id)}
                >
                  <div className="animali-user-avatar-small">
                    {animale.nome?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="animali-user-card-info-compact">
                    <div className="animali-user-card-nome">{animale.nome}</div>
                    <div className="animali-user-card-specie">{animale.specie}</div>
                  </div>
                </div>
              ))}
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