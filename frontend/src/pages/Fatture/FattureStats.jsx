import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../services/apiService';
import { InvoiceIcon } from '../../components/icons';
import './FattureStats.css';

const MESI_ITALIANI = [
  '', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

function FattureStats() {
  const { get } = useApi();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await get('/api/stats/fatture');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        throw new Error('Errore nel caricamento delle statistiche');
      }
    } catch (err) {
      logger.error('Error fetching fatture stats:', err);
      setError(err.message || 'Errore nel caricamento delle statistiche');
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatEuro = (value) => {
    if (value === null || value === undefined) return 'â‚¬ 0,00';
    return 'â‚¬ ' + Number(value).toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <div className="fatture-stats-page">
        <div className="loading-wrapper">
          <div className="loading-spinner-custom"></div>
          <span>Caricamento statistiche fatture...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fatture-stats-page">
        <div className="page-container">
          <div className="form-error">{error}</div>
          <button className="btn btn-primary mt-3" onClick={fetchStats}>
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const pagatePercent = stats.totaleFatture > 0
    ? Math.round((stats.fatturePagate / stats.totaleFatture) * 100)
    : 0;
  const nonPagatePercent = stats.totaleFatture > 0
    ? Math.round((stats.fattureNonPagate / stats.totaleFatture) * 100)
    : 0;

  return (
    <div className="fatture-stats-page">
      <div className="fatture-stats-header">
        <h1>
          <InvoiceIcon width="28" height="28" />
          Statistiche Fatture
        </h1>
        <p className="text-muted">Riepilogo delle fatture emesse e del loro stato di pagamento</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card border-primary">
          <div className="kpi-label">Totale Fatture</div>
          <div className="kpi-value">{stats.totaleFatture}</div>
          <div className="kpi-change">Emesse</div>
        </div>

        <div className="kpi-card border-success">
          <div className="kpi-label">Fatture Pagate</div>
          <div className="kpi-value">{stats.fatturePagate}</div>
          <div className="kpi-change">{pagatePercent}% del totale</div>
        </div>

        <div className="kpi-card border-danger">
          <div className="kpi-label">Fatture Non Pagate</div>
          <div className="kpi-value">{stats.fattureNonPagate}</div>
          <div className="kpi-change">{nonPagatePercent}% del totale</div>
        </div>

        <div className="kpi-card border-warning">
          <div className="kpi-label">Importo Totale</div>
          <div className="kpi-value">{formatEuro(stats.importoTotale)}</div>
          <div className="kpi-change">Complessivo</div>
        </div>
      </div>

      {/* Importi */}
      <div className="kpi-grid">
        <div className="kpi-card border-success">
          <div className="kpi-label">Importo Pagato</div>
          <div className="kpi-value">{formatEuro(stats.importoPagato)}</div>
          <div className="kpi-change" style={{ color: '#38a169' }}>
            Incassato
          </div>
        </div>

        <div className="kpi-card border-danger">
          <div className="kpi-label">Importo Non Pagato</div>
          <div className="kpi-value">{formatEuro(stats.importoNonPagato)}</div>
          <div className="kpi-change" style={{ color: '#e53e3e' }}>
            Da incassare
          </div>
        </div>
      </div>

      {/* Barra di progressione pagamenti */}
      <div className="card">
        <div className="card-header">
          <h3>Stato Pagamenti</h3>
        </div>
        <div className="card-body">
          <div className="fatture-progress-bar-container">
            <div className="fatture-progress-bar">
              <div
                className="fatture-progress-segment fatture-progress-pagate"
                style={{ width: `${pagatePercent}%` }}
                title={`Pagate: ${stats.fatturePagate} (${pagatePercent}%)`}
              ></div>
              <div
                className="fatture-progress-segment fatture-progress-non-pagate"
                style={{ width: `${nonPagatePercent}%` }}
                title={`Non pagate: ${stats.fattureNonPagate} (${nonPagatePercent}%)`}
              ></div>
            </div>
            <div className="fatture-progress-legend">
              <div className="fatture-legend-item">
                <span className="fatture-legend-dot fatture-dot-pagate"></span>
                Pagate: {stats.fatturePagate} ({pagatePercent}%)
              </div>
              <div className="fatture-legend-item">
                <span className="fatture-legend-dot fatture-dot-non-pagate"></span>
                Non Pagate: {stats.fattureNonPagate} ({nonPagatePercent}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabella mensile */}
      <div className="card">
        <div className="card-header">
          <h3>Dettaglio Mensile</h3>
        </div>
        <div className="card-body">
          {stats.fatturePerMese && stats.fatturePerMese.length > 0 ? (
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Mese</th>
                    <th>Totale</th>
                    <th>Pagate</th>
                    <th>Non Pagate</th>
                    <th style={{ textAlign: 'right' }}>Importo</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.fatturePerMese.map((mese, index) => (
                    <tr key={index}>
                      <td><strong>{MESI_ITALIANI[mese.mese]} {mese.anno}</strong></td>
                      <td>{mese.totale}</td>
                      <td>
                        <span className="fatture-badge fatture-badge-pagata">
                          {mese.pagate}
                        </span>
                      </td>
                      <td>
                        <span className="fatture-badge fatture-badge-non-pagata">
                          {mese.nonPagate}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatEuro(mese.importoTotale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-text">Nessun dato mensile disponibile</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FattureStats;
