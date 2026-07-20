import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../services/apiService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import AnimaleCreate from '../Animali/AnimaleCreate';
import ProprietarioRegistrationModal from '../../components/ProprietarioRegistrationModal';
import './DashboardUser.css';

// ==============================
// SVG ICONS
// ==============================
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PawIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 5.5C8 4.5 8.8 3.5 10 3.5C11.2 3.5 12 4.5 12 5.5C12 6.5 11.2 7.5 10 7.5C8.8 7.5 8 6.5 8 5.5Z" />
    <path d="M15 5.5C15 4.5 15.8 3.5 17 3.5C18.2 3.5 19 4.5 19 5.5C19 6.5 18.2 7.5 17 7.5C15.8 7.5 15 6.5 15 5.5Z" />
    <path d="M5 10C5 9 5.8 8 7 8C8.2 8 9 9 9 10C9 11 8.2 12 7 12C5.8 12 5 11 5 10Z" />
    <path d="M15 10C15 9 15.8 8 17 8C18.2 8 19 9 19 10C19 11 18.2 12 17 12C15.8 12 15 11 15 10Z" />
    <path d="M21 10C21 9 21.8 8 23 8C24.2 8 25 9 25 10C25 11 24.2 12 23 12C21.8 12 21 11 21 10Z" />
    <ellipse cx="15" cy="16" rx="7" ry="5.5" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

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
      const animaliRes = await get(`/api/animali?proprietarioId=${user.id}&page=0&size=4`);
      const animaliData = await animaliRes.json();
      setAnimali(animaliData.content || []);

      const prenotazioniRes = await get(`/api/prenotazioni?proprietarioId=${user.id}&page=0&size=5&sortBy=dataOraAppuntamento&sortDir=asc`);
      const prenotazioniData = await prenotazioniRes.json();
      setPrenotazioni(prenotazioniData.content || []);

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
    navigate('/prenotazioni/nuova');
  };

  const handleCreateProprietarioSuccess = () => {
    setShowProprietarioModal(false);
    checkProprietario(); // Re-check proprietario status
  };

  const handleCreateProprietarioSkip = () => {
    setShowProprietarioModal(false);
  };

  const handleSchedaAnimale = (animaleId) => {
    navigate(`/animali/user/${animaleId}`); // ← ROUTE PER UTENTI
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
            <UserIcon className="user-icon" />
            Bentornato, <span className="dashboard-user-name">{user?.username || 'Utente'}</span>
          </h1>
          <p className="dashboard-user-subtitle">Prenota la tua prossima visita</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {!hasProprietario && (
            <button className="btn btn-secondary" onClick={() => setShowProprietarioModal(true)}>
              <PlusIcon /> Crea Profilo Proprietario
            </button>
          )}
          <button className="btn btn-primary" onClick={handlePrenotaVisita}>
            <PlusIcon /> Prenota visita
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card border-primary">
          <div className="kpi-label"><PawIcon /> I tuoi animali</div>
          <div className="kpi-value">{animali.length}</div>
          <div className="kpi-change">{animali.length > 0 ? 'Registrati' : 'Nessuno ancora'}</div>
        </div>

        <div className="kpi-card border-success">
          <div className="kpi-label"><CalendarIcon /> Prossima visita</div>
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
          <div className="kpi-label"><ListIcon /> Prenotazioni attive</div>
          <div className="kpi-value">{prenotazioniAttive}</div>
          <div className="kpi-change">{prenotazioniAttive > 0 ? 'In attesa' : 'Nessuna'}</div>
        </div>

        <div className="kpi-card border-danger">
          <div className="kpi-label"><ListIcon /> Totale prenotazioni</div>
          <div className="kpi-value">{prenotazioni.length}</div>
          <div className="kpi-change">{prenotazioni.length > 0 ? 'Registrate' : 'Nessuna'}</div>
        </div>
      </div>

      {/* PROSSIME VISITE */}
      <div className="card">
        <div className="card-header">
          <h3>Prossime visite</h3>
          <button className="btn btn-secondary btn-sm" onClick={handlePrenotaVisita}>Prenota</button>
        </div>
        <div className="card-body">
          {prenotazioni.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><CalendarIcon /></div>
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
            <PlusIcon /> Aggiungi animale
          </button>
        </div>
        <div className="card-body">
          {animali.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><PawIcon /></div>
              <div className="empty-title">Nessun animale registrato</div>
              <p className="empty-description">Aggiungi il tuo primo animale per iniziare.</p>
              <button className="btn btn-primary mt-3" onClick={() => setShowCreateModal(true)}>
                <PlusIcon /> Aggiungi animale
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
          proprietarioPrecompilatoId={user?.id}
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
    </div>
  );
}

export default DashboardUser;