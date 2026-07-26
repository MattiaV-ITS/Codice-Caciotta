// pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { StatusBadge } from "../../components/common/StatusBadge";
import './Dashboard.css';

export function Dashboard() {
  const [stats, setStats] = useState({
    visiteOggi: 8,
    prenotazioni: 12,
    fattureScadute: 5,
    emergenze: 3
  });

  // Dati di esempio per le visite recenti
  const recentiVisite = [
    { id: 1, animale: 'Fido', proprietario: 'Mario Rossi', ora: '10:30', stato: 'Completata' },
    { id: 2, animale: 'Mimì', proprietario: 'Laura Bianchi', ora: '11:45', stato: 'In corso' },
    { id: 3, animale: 'Rex', proprietario: 'Giuseppe Verdi', ora: '14:00', stato: 'Pianificata' },
    { id: 4, animale: 'Luna', proprietario: 'Maria Neri', ora: '16:15', stato: 'Pianificata' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="text-muted">Bentornato, oggi hai {stats.visiteOggi} visite programmate</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card border-primary">
          <div className="kpi-label">Visite Oggi</div>
          <div className="kpi-value">{stats.visiteOggi}</div>
          <div className="kpi-change up">↑ 2 rispetto a ieri</div>
        </div>
        <div className="kpi-card border-warning">
          <div className="kpi-label">Prenotazioni</div>
          <div className="kpi-value">{stats.prenotazioni}</div>
          <div className="kpi-change up">3 in attesa di conferma</div>
        </div>
        <div className="kpi-card border-danger">
          <div className="kpi-label">Fatture da pagare</div>
          <div className="kpi-value">€ 1.240</div>
          <div className="kpi-change down">5 fatture scadute</div>
        </div>
        <div className="kpi-card border-danger">
          <div className="kpi-label">Emergenze</div>
          <div className="kpi-value">{stats.emergenze}</div>
          <div className="kpi-change">Priorità alta</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Visite di oggi</h3>
          <button className="btn btn-primary btn-sm">Vedi tutte</button>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Animale</th>
                  <th>Proprietario</th>
                  <th>Orario</th>
                  <th style={{ textAlign: 'center' }}>STATO</th>
                </tr>
              </thead>
              <tbody>
                {recentiVisite.map(visita => (
                  <tr key={visita.id}>
                    <td><strong>{visita.animale}</strong></td>
                    <td>{visita.proprietario}</td>
                    <td>{visita.ora}</td>
                    <td style={{ textAlign: 'center' }}>
                      <StatusBadge status={visita.stato} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}