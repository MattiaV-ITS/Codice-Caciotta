import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ==============================
// MOCK DATI ANIMALE (statico per tutte le visite)
// ==============================
const MOCK_ANIMALE = {
  id: 1,
  stato: 'SANO',
  nome: 'Fido',
  specie: 'cane',
  razza: 'Labrador',
  dataNascita: '2020-05-15',
  eta: '4 anni, 2 mesi',
  sesso: 'M',
  peso: 28.5,
  microchip: '123456789012345',
  taglia: 'GRANDE',
  coloreMantello: 'Nero',
  sterilizzato: true,
  gruppoSanguigno: 'DEA 1.1+',
  allergie: 'Polline, pulci',
  patologie: 'Displasia dell\'anca',
  noteGenerali: 'Animale molto affettuoso, ha paura dei tuoni',
  notePrivate: 'Controllare peso ogni 3 mesi',
  proprietario: 'Mario Rossi',
  telefonoProprietario: '3331234567'
};

// ==============================
// MOCK DATI VISITE (dettaglio completo)
// ==============================
const MOCK_VISITE_DETAILS = {
  1: {
    id: 1,
    dataOraVisita: '2024-07-10T10:30',
    durata: 30,
    tipoVisita: 'Visita di controllo',
    sintomi: 'Tosse secca, difficoltà respiratoria',
    diagnosi: 'Bronchite lieve',
    trattamentoTerapia: 'Antibiotico per 5 giorni, riposo',
    note: 'Rivedere tra una settimana',
    notePrivate: 'Valutare se fare una radiografia se non migliora'
  },
  2: {
    id: 2,
    dataOraVisita: '2024-06-15T09:00',
    durata: 20,
    tipoVisita: 'Vaccinazione',
    sintomi: 'Nessun sintomo, controllo di routine',
    diagnosi: 'Animale in buona salute',
    trattamentoTerapia: 'Vaccinazione antirabbica somministrata',
    note: 'Prossima vaccinazione tra 1 anno',
    notePrivate: 'Ricordare di aggiornare il libretto'
  },
  3: {
    id: 3,
    dataOraVisita: '2024-05-20T14:30',
    durata: 45,
    tipoVisita: 'Visita di controllo',
    sintomi: 'Zoppia all\'arto posteriore sinistro',
    diagnosi: 'Distorsione al garretto',
    trattamentoTerapia: 'Riposo per 10 giorni, antinfiammatorio',
    note: 'Controllare dopo 2 settimane',
    notePrivate: 'Se non migliora, fare radiografia'
  },
  4: {
    id: 4,
    dataOraVisita: '2024-04-10T11:00',
    durata: 60,
    tipoVisita: 'Visita d\'urgenza',
    sintomi: 'Vomito e diarrea, letargia',
    diagnosi: 'Gastroenterite acuta',
    trattamentoTerapia: 'Dieta blanda, antibiotico e probiotici per 5 giorni',
    note: 'Miglioramento dopo 48 ore',
    notePrivate: 'Monitorare idratazione'
  },
  5: {
    id: 5,
    dataOraVisita: '2024-07-08T11:45',
    durata: 15,
    tipoVisita: 'Visita di controllo',
    sintomi: 'Prurito intenso al padiglione auricolare',
    diagnosi: 'Otite esterna',
    trattamentoTerapia: 'Pulizia auricolare e gocce antibiotiche per 7 giorni',
    note: 'Controllare dopo 5 giorni',
    notePrivate: ''
  }
};

// ==============================
// LISTA VISITE PRECEDENTI (solo metadati)
// ==============================
const MOCK_VISITE_PRECEDENTI = [
  { id: 1, dataOraVisita: '2024-07-10T10:30', tipoVisita: 'Visita di controllo' },
  { id: 2, dataOraVisita: '2024-06-15T09:00', tipoVisita: 'Vaccinazione' },
  { id: 3, dataOraVisita: '2024-05-20T14:30', tipoVisita: 'Visita di controllo' },
  { id: 4, dataOraVisita: '2024-04-10T11:00', tipoVisita: 'Visita d\'urgenza' },
  { id: 5, dataOraVisita: '2024-07-08T11:45', tipoVisita: 'Visita di controllo' }
];

// ==============================
// COMPONENTE
// ==============================
function VisitePagina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const visitaId = parseInt(id);

  // Stato per la visita corrente
  const [visita, setVisita] = useState(null);
  const [animale] = useState(MOCK_ANIMALE);

  // Carica i dati della visita in base all'ID
  useEffect(() => {
    const visitaData = MOCK_VISITE_DETAILS[visitaId];
    if (visitaData) {
      setVisita(visitaData);
    } else {
      // Se l'ID non esiste, crea una nuova visita vuota
      setVisita({
        id: null,
        dataOraVisita: new Date().toISOString().slice(0, 16),
        durata: '',
        tipoVisita: '',
        sintomi: '',
        diagnosi: '',
        trattamentoTerapia: '',
        note: '',
        notePrivate: ''
      });
    }
  }, [visitaId]);

  // Gestione cambio campi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVisita(prev => ({ ...prev, [name]: value }));
  };

  // Salvataggio (mock)
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Visita ${visitaId ? 'aggiornata' : 'creata'} con successo! (mock)`);
    console.log('Dati salvati:', visita);
  };

  // Navigazione a visita precedente
  const goToVisita = (visitaId) => {
    navigate(`/visite/${visitaId}`);
  };

  // Formattazione date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtra le visite precedenti escludendo quella corrente
  const altreVisite = MOCK_VISITE_PRECEDENTI.filter(v => v.id !== visitaId);

  // Se la visita non è ancora caricata
  if (!visita) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento visita...</span>
      </div>
    );
  }

  return (
    <div className="visite-pagina">

      {/* ==================== COLONNA SINISTRA ==================== */}
      <div className="visite-colonna-left">
        <div className="visite-card">
          <div className="visite-card-header">
            <h3>Dati Animale</h3>
            <span className={`badge-status ${animale.stato?.toLowerCase()}`}>
              {animale.stato || 'Sconosciuto'}
            </span>
          </div>
          <div className="visite-card-body">
            <div className="visite-detail-item">
              <span className="visite-detail-label">Nome</span>
              <span className="visite-detail-value">{animale.nome}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Specie</span>
              <span className="visite-detail-value">{animale.specie}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Razza</span>
              <span className="visite-detail-value">{animale.razza || '-'}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Data Nascita</span>
              <span className="visite-detail-value">{formatDate(animale.dataNascita)}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Età</span>
              <span className="visite-detail-value">{animale.eta || '-'}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Sesso</span>
              <span className="visite-detail-value">
                {animale.sesso === 'M' ? 'Maschio' : animale.sesso === 'F' ? 'Femmina' : 'ND'}
              </span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Peso</span>
              <span className="visite-detail-value">{animale.peso ? `${animale.peso} kg` : '-'}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Microchip</span>
              <span className="visite-detail-value">{animale.microchip || '-'}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Taglia</span>
              <span className="visite-detail-value">{animale.taglia || '-'}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Colore Mantello</span>
              <span className="visite-detail-value">{animale.coloreMantello || '-'}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Sterilizzato</span>
              <span className="visite-detail-value">{animale.sterilizzato ? 'Sì' : 'No'}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Gruppo Sanguigno</span>
              <span className="visite-detail-value">{animale.gruppoSanguigno || '-'}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Allergie</span>
              <span className="visite-detail-value">{animale.allergie || '-'}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Patologie</span>
              <span className="visite-detail-value">{animale.patologie || '-'}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Proprietario</span>
              <span className="visite-detail-value">{animale.proprietario || '-'}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Telefono</span>
              <span className="visite-detail-value">{animale.telefonoProprietario || '-'}</span>
            </div>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Note Generali</span>
              <span className="visite-detail-value">{animale.noteGenerali || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== COLONNA CENTRALE ==================== */}
      <div className="visite-colonna-center">
        <div className="visite-card">
          <div className="visite-card-header">
            <div className="visite-header-left">
              <h3>
                {visita.id ? `Visita del ${formatDate(visita.dataOraVisita)}` : 'Nuova Visita'}
              </h3>
              {visita.tipoVisita && (
                <span className="visite-badge-tipo">{visita.tipoVisita}</span>
              )}
            </div>
            <span className="visite-durata">Durata: {visita.durata || '—'} min</span>
          </div>
          <div className="visite-card-body">
            <form onSubmit={handleSubmit} className="visite-form">

              <div className="visite-form-row">
                <div className="visite-form-group">
                  <label className="visite-form-label">Data e Ora</label>
                  <input
                    type="datetime-local"
                    name="dataOraVisita"
                    className="visite-form-control"
                    value={visita.dataOraVisita || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="visite-form-group">
                  <label className="visite-form-label">Durata (minuti)</label>
                  <input
                    type="number"
                    name="durata"
                    className="visite-form-control"
                    value={visita.durata || ''}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="visite-form-group">
                <label className="visite-form-label">Tipo Visita</label>
                <select
                  name="tipoVisita"
                  className="visite-form-control"
                  value={visita.tipoVisita || ''}
                  onChange={handleChange}
                >
                  <option value="">Seleziona tipo</option>
                  <option value="Visita di controllo">Visita di controllo</option>
                  <option value="Vaccinazione">Vaccinazione</option>
                  <option value="Visita d'urgenza">Visita d'urgenza</option>
                  <option value="Chirurgia">Chirurgia</option>
                  <option value="Visita specialistica">Visita specialistica</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>

              <div className="visite-divider">
                <span>Diario Clinico</span>
              </div>

              <div className="visite-form-group">
                <label className="visite-form-label">Sintomi</label>
                <textarea
                  name="sintomi"
                  className="visite-form-control visite-form-textarea"
                  rows="3"
                  value={visita.sintomi || ''}
                  onChange={handleChange}
                  placeholder="Descrivi i sintomi riportati..."
                />
              </div>

              <div className="visite-form-group">
                <label className="visite-form-label">Diagnosi</label>
                <textarea
                  name="diagnosi"
                  className="visite-form-control visite-form-textarea"
                  rows="3"
                  value={visita.diagnosi || ''}
                  onChange={handleChange}
                  placeholder="Inserisci la diagnosi..."
                />
              </div>

              <div className="visite-form-group">
                <label className="visite-form-label">Trattamento / Terapia</label>
                <textarea
                  name="trattamentoTerapia"
                  className="visite-form-control visite-form-textarea"
                  rows="3"
                  value={visita.trattamentoTerapia || ''}
                  onChange={handleChange}
                  placeholder="Indica il trattamento prescritto..."
                />
              </div>

              <div className="visite-form-group">
                <label className="visite-form-label">Note</label>
                <textarea
                  name="note"
                  className="visite-form-control visite-form-textarea"
                  rows="2"
                  value={visita.note || ''}
                  onChange={handleChange}
                  placeholder="Note aggiuntive (visibili al proprietario)..."
                />
              </div>

              <div className="visite-form-group">
                <label className="visite-form-label">Note Private</label>
                <textarea
                  name="notePrivate"
                  className="visite-form-control visite-form-textarea"
                  rows="2"
                  value={visita.notePrivate || ''}
                  onChange={handleChange}
                  placeholder="Note riservate al veterinario..."
                />
              </div>

              <div className="visite-form-actions">
                <button type="submit" className="btn btn-primary">
                  {visita.id ? 'Aggiorna Visita' : 'Crea Visita'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/visite')}
                >
                  Torna alla lista
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* ==================== COLONNA DESTRA ==================== */}
      <div className="visite-colonna-destra">
        <div className="visite-card">
          <div className="visite-card-header">
            <h3>Visite Precedenti</h3>
            <span className="visite-count">{altreVisite.length}</span>
          </div>
          <div className="visite-card-body">
            {altreVisite.length === 0 ? (
              <p className="visite-empty">Nessuna visita precedente</p>
            ) : (
              <ul className="visite-list">
                {altreVisite.map((v) => (
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
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default VisitePagina;