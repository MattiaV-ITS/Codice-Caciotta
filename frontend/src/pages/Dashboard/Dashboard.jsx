// pages/Dashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../services/apiService';
import { StatusBadge } from "../../components/common/StatusBadge";
import { formatTime } from '../../utils/dateUtils';
import './Dashboard.css';

export function Dashboard() {
  const { get, patch } = useApi();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get('/api/stats/dashboard');
      if (!response.ok) throw new Error(`Errore: ${response.status}`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Errore caricamento dashboard:', err);
      setError('Impossibile caricare i dati della dashboard.');
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleChangeStato = useCallback(async (prenotazioneId, nuovoStato) => {
    if (!prenotazioneId) return;
    try {
      const response = await patch(`/api/prenotazioni/${prenotazioneId}/stato`, { stato: nuovoStato });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update stato: ${response.status}`);
      }
      // Refresh dashboard data to reflect changes
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating stato:', error);
      alert(`Errore aggiornando lo stato: ${error.message}`);
    }
  }, [fetchDashboardData, patch]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-wrapper">
          <div className="loading-spinner-custom"></div>
          <span>Caricamento dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="text-muted">Errore nel caricamento dei dati</p>
        </div>
        <div className="form-error" style={{ marginBottom: '16px' }}>{error}</div>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Riprova
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const { visiteOggi, prenotazioniTotali, fattureNonPagate, importoNonPagato, animaliTotali, visiteOggiList } = stats;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="text-muted">Bentornato, oggi hai {visiteOggi} visite programmate</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card border-primary" onClick={() => navigate('/prenotazioni/programma')} style={{ cursor: 'pointer' }}>
          <div className="kpi-label">Visite Oggi</div>
          <div className="kpi-value">{visiteOggi}</div>
          <div className="kpi-change">{visiteOggi > 0 ? 'Appuntamenti in programma' : 'Nessuna visita oggi'}</div>
        </div>
        <div className="kpi-card border-warning" onClick={() => navigate('/prenotazioni')} style={{ cursor: 'pointer' }}>
          <div className="kpi-label">Prenotazioni Totali</div>
          <div className="kpi-value">{prenotazioniTotali}</div>
          <div className="kpi-change">Registrate nel sistema</div>
        </div>
        <div className="kpi-card border-danger" onClick={() => navigate('/fatture/stats')} style={{ cursor: 'pointer' }}>
          <div className="kpi-label">Fatture da pagare</div>
          <div className="kpi-value">
            {importoNonPagato ? `€ ${Number(importoNonPagato).toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '€ 0,00'}
          </div>
          <div className="kpi-change down">{fattureNonPagate} fatture scadute</div>
        </div>
        <div className="kpi-card border-success" onClick={() => navigate('/animali')} style={{ cursor: 'pointer' }}>
          <div className="kpi-label">Animali Registrati</div>
          <div className="kpi-value">{animaliTotali}</div>
          <div className="kpi-change">Nello studio</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Visite di oggi</h3>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/prenotazioni/programma')}>Vedi tutte</button>
        </div>
        <div className="card-body">
          {visiteOggiList && visiteOggiList.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Animale</th>
                    <th>Proprietario</th>
                    <th>Orario</th>
                    <th style={{ textAlign: 'center' }}>STATO</th>
                    <th style={{ textAlign: 'center' }}>AZIONI</th>
                  </tr>
                </thead>
                <tbody>
                  {visiteOggiList.map((visita, index) => (
                    <tr key={visita.id || index}>
                      <td><strong>{visita.animaleNome}</strong></td>
                      <td>{visita.proprietarioNome} {visita.proprietarioCognome}</td>
                      <td>{formatTime(visita.dataOraAppuntamento)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <StatusBadge status={visita.stato || 'NON_ARRIVATO'} />
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div className="stato-actions">
                          <button
                            className={`stato-box stato-non-arrivato ${visita.stato === 'NON_ARRIVATO' ? 'active' : ''}`}
                            onClick={() => handleChangeStato(visita.id, 'NON_ARRIVATO')}
                            title="Non arrivato"
                          />
                          <button
                            className={`stato-box stato-in-attesa ${visita.stato === 'IN_ATTESA' ? 'active' : ''}`}
                            onClick={() => handleChangeStato(visita.id, 'IN_ATTESA')}
                            title="In attesa"
                          />
                          <button
                            className={`stato-box stato-completato ${visita.stato === 'COMPLETATO' ? 'active' : ''}`}
                            onClick={() => handleChangeStato(visita.id, 'COMPLETATO')}
                            title="Completato"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-title">Nessuna visita oggi</div>
              <p className="empty-description">Non ci sono appuntamenti programmati per oggi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}