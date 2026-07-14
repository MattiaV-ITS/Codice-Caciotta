import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../services/apiService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import AnimaleCreate from '../Animali/AnimaleCreate';
import './DashboardUser.css';

function DashboardUser() {
  const { user } = useAuth();
  const { get } = useApi();
  const navigate = useNavigate();

  const [animali, setAnimali] = useState([]);
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Carica i dati
  const loadData = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Carica animali dell'utente
      const animaliRes = await get(`/api/animali?proprietarioId=${user.id}&page=0&size=4`);
      const animaliData = await animaliRes.json();
      setAnimali(animaliData.content || []);

      // 2. Carica prenotazioni dell'utente (prossime, ordinate per data)
      const prenotazioniRes = await get(`/api/prenotazioni?proprietarioId=${user.id}&page=0&size=5&sortBy=dataOraAppuntamento&sortDir=asc`);
      const prenotazioniData = await prenotazioniRes.json();
      setPrenotazioni(prenotazioniData.content || []);

      setLoading(false);
    } catch (err) {
      console.error('Errore caricamento dashboard utente:', err);
      setError('Impossibile caricare i dati. Riprova più tardi.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadData(); // Ricarica i dati dopo la creazione
  };

  const handlePrenotaVisita = () => {
    navigate('/prenotazioni/nuova');
  };

  const handleVediAnimali = () => {
    navigate('/animali/user');
  };

  // Statistiche
  const prossimaVisita = prenotazioni.length > 0 ? prenotazioni[0] : null;
  const prenotazioniAttive = prenotazioni.filter(p => {
    // Se non hai un campo stato, considera tutte le prenotazioni future come attive
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
            Bentornato, <span className="dashboard-user-name">{user?.username || 'Utente'}</span> 👋
          </h1>
          <p className="dashboard-user-subtitle">Prenota la tua prossima visita</p>
        </div>
        <button className="btn btn-primary" onClick={handlePrenotaVisita}>
          + Prenota visita
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card border-primary">
          <div className="kpi-label">I tuoi animali</div>
          <div className="kpi-value">{animali.length}</div>
          <div className="kpi-change">
            {animali.length > 0 ? 'Registrati' : 'Nessuno ancora'}
          </div>
        </div>

        <div className="kpi-card border-success">
          <div className="kpi-label">Prossima visita</div>
          <div className="kpi-value">
            {prossimaVisita ? (
              <span style={{ fontSize: '20px', fontWeight: '600' }}>
                {formatDate(prossimaVisita.dataOraAppuntamento)}
              </span>
            ) : (
              '-'
            )}
          </div>
          <div className="kpi-change" style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
            {prossimaVisita 
              ? `${prossimaVisita.animaleNome} • ${formatTime(prossimaVisita.dataOraAppuntamento)}`
              : 'Nessuna visita programmata'
            }
          </div>
        </div>

        <div className="kpi-card border-warning">
          <div className="kpi-label">Prenotazioni attive</div>
          <div className="kpi-value">{prenotazioniAttive}</div>
          <div className="kpi-change">
            {prenotazioniAttive > 0 ? 'In attesa' : 'Nessuna'}
          </div>
        </div>

        <div className="kpi-card border-danger">
          <div className="kpi-label">Totale prenotazioni</div>
          <div className="kpi-value">{prenotazioni.length}</div>
          <div className="kpi-change">
            {prenotazioni.length > 0 ? 'Registrate' : 'Nessuna'}
          </div>
        </div>
      </div>

      {/* PROSSIME VISITE */}
      <div className="card">
        <div className="card-header">
          <h3>Prossime visite</h3>
          <button className="btn btn-secondary btn-sm" onClick={handlePrenotaVisita}>
            Prenota
          </button>
        </div>
        <div className="card-body">
          {prenotazioni.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
              Non hai visite programmate.
              <br />
              <button className="btn btn-primary btn-sm mt-3" onClick={handlePrenotaVisita}>
                Prenota ora
              </button>
            </p>
          ) : (
            <div className="table-container">
              <table className="table">
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
                      <td><strong>{prenotazione.animaleNome}</strong></td>
                      <td>{formatDate(prenotazione.dataOraAppuntamento)}</td>
                      <td>{formatTime(prenotazione.dataOraAppuntamento)}</td>
                      <td>{prenotazione.tipoVisita}</td>
                      <td>
                        <span className="actions-menu">⋯</span>
                      </td>
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
            + Aggiungi animale
          </button>
        </div>
        <div className="card-body">
          {animali.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
              Non hai ancora animali registrati.
              <br />
              <button className="btn btn-primary btn-sm mt-3" onClick={() => setShowCreateModal(true)}>
                + Aggiungi animale
              </button>
            </p>
          ) : (
            <>
              <div className="animali-user-grid-compact">
                {animali.map((animale) => (
                  <div
                    key={animale.id}
                    className="animali-user-card-compact"
                    onClick={() => navigate(`/animali/user/${animale.id}`)}
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
              {animali.length >= 4 && (
                <div style={{ marginTop: 'var(--space-3)', textAlign: 'center' }}>
                  <button className="btn btn-secondary btn-sm" onClick={handleVediAnimali}>
                    Vedi tutti gli animali →
                  </button>
                </div>
              )}
            </>
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
    </div>
  );
}

export default DashboardUser;