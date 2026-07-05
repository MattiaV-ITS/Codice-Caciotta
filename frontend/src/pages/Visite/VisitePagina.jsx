import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ==============================
// MOCK DATI ANIMALE
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
// MOCK DATI VISITE
// ==============================
const MOCK_VISITE_DETAILS = {
  1: {
    id: 1,
    dataOraPrenotazione: '2024-07-08T09:00',
    dataOraVisita: '2024-07-10T10:30',
    durata: 30,
    tipoVisita: 'Visita di controllo',
    stato: 'Completata',
    sintomi: 'Tosse secca, difficoltà respiratoria',
    diagnosi: 'Bronchite lieve',
    trattamentoTerapia: 'Antibiotico per 5 giorni, riposo',
    note: 'Rivedere tra una settimana',
    notePrivate: 'Valutare se fare una radiografia se non migliora'
  },
  2: {
    id: 2,
    dataOraPrenotazione: '2024-06-13T14:30',
    dataOraVisita: '2024-06-15T09:00',
    durata: 20,
    tipoVisita: 'Vaccinazione',
    stato: 'Completata',
    sintomi: 'Nessun sintomo, controllo di routine',
    diagnosi: 'Animale in buona salute',
    trattamentoTerapia: 'Vaccinazione antirabbica somministrata',
    note: 'Prossima vaccinazione tra 1 anno',
    notePrivate: 'Ricordare di aggiornare il libretto'
  },
  3: {
    id: 3,
    dataOraPrenotazione: '2024-05-18T11:00',
    dataOraVisita: '2024-05-20T14:30',
    durata: 45,
    tipoVisita: 'Visita di controllo',
    stato: 'Pianificata',
    sintomi: 'Zoppia all\'arto posteriore sinistro',
    diagnosi: 'Distorsione al garretto',
    trattamentoTerapia: 'Riposo per 10 giorni, antinfiammatorio',
    note: 'Controllare dopo 2 settimane',
    notePrivate: 'Se non migliora, fare radiografia'
  },
  4: {
    id: 4,
    dataOraPrenotazione: '2024-04-08T16:00',
    dataOraVisita: '2024-04-10T11:00',
    durata: 60,
    tipoVisita: 'Visita d\'urgenza',
    stato: 'Completata',
    sintomi: 'Vomito e diarrea, letargia',
    diagnosi: 'Gastroenterite acuta',
    trattamentoTerapia: 'Dieta blanda, antibiotico e probiotici per 5 giorni',
    note: 'Miglioramento dopo 48 ore',
    notePrivate: 'Monitorare idratazione'
  },
  5: {
    id: 5,
    dataOraPrenotazione: '2024-07-06T08:30',
    dataOraVisita: '2024-07-08T11:45',
    durata: 15,
    tipoVisita: 'Altro',
    stato: 'In corso',
    sintomi: 'Prurito intenso al padiglione auricolare',
    diagnosi: 'Otite esterna',
    trattamentoTerapia: 'Pulizia auricolare e gocce antibiotiche per 7 giorni',
    note: 'Controllare dopo 5 giorni',
    notePrivate: '',
    altroTipoVisita: 'Visita otologica'
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
  { id: 5, dataOraVisita: '2024-07-08T11:45', tipoVisita: 'Altro' }
];

// ==============================
// ICONE SVG
// ==============================
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="2"/>
    <path d="M12 8V16M8 12H16" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="5" r="3" stroke="var(--gray-600)" strokeWidth="2"/>
    <circle cx="6" cy="12" r="3" stroke="var(--gray-600)" strokeWidth="2"/>
    <circle cx="18" cy="19" r="3" stroke="var(--gray-600)" strokeWidth="2"/>
    <path d="M8.59 13.51L15.42 17.49" stroke="var(--gray-600)" strokeWidth="2"/>
    <path d="M15.41 6.51L8.59 10.49" stroke="var(--gray-600)" strokeWidth="2"/>
  </svg>
);

const LightningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const PrintIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="16" height="12" rx="1.5" stroke="var(--gray-700)" strokeWidth="1.8"/>
    <path d="M7 4H17V8H7V4Z" stroke="var(--gray-700)" strokeWidth="1.8" strokeLinejoin="round"/>
    <rect x="7" y="14" width="10" height="6" rx="1" stroke="var(--gray-700)" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M8 11H16" stroke="var(--gray-700)" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="16" cy="16" r="0.8" fill="var(--gray-700)"/>
  </svg>
);

// ==============================
// COMPONENTE
// ==============================
function VisitePagina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const visitaId = parseInt(id);

  const [visita, setVisita] = useState(null);
  const [animale] = useState(MOCK_ANIMALE);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ID della visita più recente (per il pulsante "Torna alla visita corrente")
  const visitaCorrenteId = 1;

  // Valore di default per la data di prenotazione (per il reset)
  const [defaultDataPrenotazione, setDefaultDataPrenotazione] = useState('');

  useEffect(() => {
    const visitaData = MOCK_VISITE_DETAILS[visitaId];
    if (visitaData) {
      setVisita(visitaData);
      setDefaultDataPrenotazione(visitaData.dataOraPrenotazione || '');
    } else {
      const now = new Date();
      const nowStr = now.toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(' ', 'T');
      
      const prenotazioneStr = now.toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(' ', 'T');
      
      setVisita({
        id: null,
        dataOraPrenotazione: prenotazioneStr,
        dataOraVisita: nowStr,
        durata: 0,
        tipoVisita: '',
        stato: 'Pianificata',
        altroTipoVisita: '',
        sintomi: '',
        diagnosi: '',
        trattamentoTerapia: '',
        note: '',
        notePrivate: ''
      });
      setDefaultDataPrenotazione(prenotazioneStr);
    }
  }, [visitaId]);

  // Imposta data/ora fine corrente (pulsante "Adesso")
  const setOraCorrente = () => {
    const now = new Date();
    const nowStr = now.toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(' ', 'T');
    setVisita(prev => ({ ...prev, dataOraVisita: nowStr }));
  };

  // Resetta la data di prenotazione al valore di default
  const resetDataPrenotazione = () => {
    if (defaultDataPrenotazione) {
      setVisita(prev => ({ ...prev, dataOraPrenotazione: defaultDataPrenotazione }));
    }
  };

  // Calcola automaticamente la durata quando cambiano dataOraPrenotazione o dataOraVisita
  const calcolaDurata = (dataPrenotazione, dataFine) => {
    if (!dataPrenotazione || !dataFine) return 0;
    const start = new Date(dataPrenotazione);
    const end = new Date(dataFine);
    const diffMs = end - start;
    if (diffMs <= 0) return 0;
    return Math.round(diffMs / (1000 * 60)); // minuti
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVisita(prev => {
      const updated = { ...prev, [name]: value };
      
      // Se cambia dataOraPrenotazione o dataOraVisita, ricalcola la durata
      if (name === 'dataOraPrenotazione' || name === 'dataOraVisita') {
        const durata = calcolaDurata(
          name === 'dataOraPrenotazione' ? value : prev.dataOraPrenotazione,
          name === 'dataOraVisita' ? value : prev.dataOraVisita
        );
        updated.durata = durata;
      }
      
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (visita.stato === 'Completata') {
      setShowModal(true);
    } else {
      saveVisita();
    }
  };

  const saveVisita = () => {
    setIsSaving(true);
    setTimeout(() => {
      alert(`Visita ${visita.id ? 'aggiornata' : 'creata'} con successo! (mock)`);
      console.log('Dati salvati:', visita);
      setIsSaving(false);
      setShowModal(false);
    }, 500);
  };

  const goToVisita = (visitaId) => {
    navigate(`/visite/${visitaId}`);
  };

  const goToVisitaCorrente = () => {
    navigate(`/visite/${visitaCorrenteId}`);
  };

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

  if (!visita) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento visita...</span>
      </div>
    );
  }

  const isVisitaCorrente = visitaId === visitaCorrenteId || !visita.id;
  const showAltroTipo = visita.tipoVisita === 'Altro';
  const isCompleted = visita.stato === 'Completata';
  const isPianificataOrInCorso = visita.stato === 'Pianificata' || visita.stato === 'In corso';

  // Determina il testo del pulsante di salvataggio
  const getButtonText = () => {
    if (isSaving) return 'Salvataggio...';
    if (visita.id && isCompleted) return 'Aggiorna Visita';
    if (visita.id && isPianificataOrInCorso) return 'Salva Visita';
    if (!visita.id) return 'Crea Visita';
    return 'Salva Visita';
  };

  // Funzioni per la struttura cartella
  const handleFolderClick = (folderName) => {
    alert(`Apertura cartella: ${folderName}`);
  };

  return (
    <div className="visite-pagina">

      {/* ==================== COLONNA SINISTRA - DATI ANIMALE ==================== */}
      <div className="visite-colonna-left">
        <div className="visite-card">
          <div className="visite-card-header">
            <h3>Dati Animale</h3>
            <span className={`badge-status ${animale.stato?.toLowerCase()}`}>
              {animale.stato || 'Sconosciuto'}
            </span>
          </div>
          <div className="visite-card-body">
            <div className="visite-detail-section">
              <span className="visite-section-title">Anagrafica</span>
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
            </div>

            <div className="visite-detail-section">
              <span className="visite-section-title" style={{ color: '#C62828', fontWeight: 700 }}>
                ⚠️ Allergie e Patologie
              </span>
              <div className="visite-detail-item">
                <span className="visite-detail-label" style={{ color: '#C62828' }}>Allergie</span>
                <span className="visite-detail-value" style={{ color: '#C62828', fontWeight: 500 }}>
                  {animale.allergie || 'Nessuna allergia nota'}
                </span>
              </div>
              <div className="visite-detail-item">
                <span className="visite-detail-label" style={{ color: '#C62828' }}>Patologie</span>
                <span className="visite-detail-value" style={{ color: '#C62828', fontWeight: 500 }}>
                  {animale.patologie || 'Nessuna patologia nota'}
                </span>
              </div>
            </div>

            <div className="visite-detail-section">
              <span className="visite-section-title">Dati Clinici</span>
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
            </div>

            <div className="visite-detail-section">
              <span className="visite-section-title">Proprietario</span>
              <div className="visite-detail-item">
                <span className="visite-detail-label">Nome</span>
                <span className="visite-detail-value">{animale.proprietario || '-'}</span>
              </div>
              <div className="visite-detail-item">
                <span className="visite-detail-label">Telefono</span>
                <span className="visite-detail-value">{animale.telefonoProprietario || '-'}</span>
              </div>
            </div>

            <div className="visite-detail-section">
              <span className="visite-section-title">Note Generali</span>
              <div className="visite-detail-item">
                <span className="visite-detail-label">Note</span>
                <span className="visite-detail-value">{animale.noteGenerali || '-'}</span>
              </div>
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
              {visita.tipoVisita && visita.tipoVisita !== 'Altro' && (
                <span className="visite-badge-tipo">{visita.tipoVisita}</span>
              )}
              {visita.tipoVisita === 'Altro' && visita.altroTipoVisita && (
                <span className="visite-badge-tipo">{visita.altroTipoVisita}</span>
              )}
            </div>
            <span className="visite-durata">Durata: {visita.durata || '0'} min</span>
          </div>
          <div className="visite-card-body">
            <form onSubmit={handleSubmit} className="visite-form">

              {/* Blocco Data e Ora - uno sotto l'altro con larghezza limitata */}
              <div className="visite-datetime-group">

                {/* Data e Ora Prenotazione */}
                <div className="visite-form-group">
                  <label className="visite-form-label">Data e Ora Prenotazione</label>
                  <div className="visite-datetime-wrapper">
                    <input
                      type="datetime-local"
                      name="dataOraPrenotazione"
                      className="visite-form-control"
                      value={visita.dataOraPrenotazione || ''}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={resetDataPrenotazione}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      ↺ Reset Data
                    </button>
                  </div>
                </div>

                {/* Data e Ora Fine */}
                <div className="visite-form-group" style={{ marginTop: 'var(--space-2)' }}>
                  <label className="visite-form-label">Data e Ora Fine</label>
                  <div className="visite-datetime-wrapper">
                    <input
                      type="datetime-local"
                      name="dataOraVisita"
                      className="visite-form-control"
                      value={visita.dataOraVisita || ''}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={setOraCorrente}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      ⏱ Adesso
                    </button>
                  </div>
                </div>

              </div>

              <div className="visite-form-group" style={{ marginTop: 'var(--space-3)' }}>
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

              {showAltroTipo && (
                <div className="visite-form-group">
                  <label className="visite-form-label">Specifica tipo visita</label>
                  <input
                    type="text"
                    name="altroTipoVisita"
                    className="visite-form-control"
                    value={visita.altroTipoVisita || ''}
                    onChange={handleChange}
                    placeholder="Inserisci il tipo di visita..."
                  />
                </div>
              )}

              <div className="visite-form-group">
                <label className="visite-form-label">Stato Visita</label>
                <select
                  name="stato"
                  className="visite-form-control"
                  value={visita.stato || ''}
                  onChange={handleChange}
                >
                  <option value="Pianificata">Pianificata</option>
                  <option value="In corso">In corso</option>
                  <option value="Completata">Completata</option>
                  <option value="Annullata">Annullata</option>
                </select>
              </div>

              <div className="visite-divider">
                <span>Referto Clinico</span>
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
                <div className="visite-form-actions-left">
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {getButtonText()}
                  </button>
                </div>
                <div className="visite-form-actions-right">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/visite')}
                  >
                    Torna alla lista
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--gray-300)' }}
                    onClick={() => alert('Funzione di stampa verbale (mock)')}
                  >
                    <PrintIcon />
                    Stampa Verbale
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* ==================== COLONNA DESTRA ==================== */}
      <div className="visite-colonna-destra">

        {/* 1. BLOCCO "STRUTTURA CARTELLA" */}
        <div className="visite-card">
          <div className="visite-card-header">
            <h3>Struttura Cartella</h3>
          </div>
          <div className="visite-card-body" style={{ paddingBottom: 'var(--space-3)' }}>
            <div className="folder-tree">
              <div 
                className="folder-tree-item folder-main"
                onClick={() => handleFolderClick('Cartella clinica')}
                style={{ cursor: 'pointer' }}
              >
                <span className="folder-icon">📁</span>
                <span className="folder-name">Cartella clinica</span>
              </div>
              <div className="folder-tree-children">
                <div 
                  className="folder-tree-item"
                  onClick={() => handleFolderClick('Cronologia visite')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="folder-icon">📁</span>
                  <span className="folder-name">Cronologia visite</span>
                </div>
                <div 
                  className="folder-tree-item"
                  onClick={() => handleFolderClick('Ricette')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="folder-icon">📁</span>
                  <span className="folder-name">Ricette</span>
                </div>
                <div 
                  className="folder-tree-item"
                  onClick={() => handleFolderClick('Libretto vaccini')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="folder-icon">📁</span>
                  <span className="folder-name">Libretto vaccini</span>
                </div>
                <div 
                  className="folder-tree-item"
                  onClick={() => handleFolderClick('Documenti e allegati')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="folder-icon">📁</span>
                  <span className="folder-name">Documenti e allegati</span>
                </div>
                <div 
                  className="folder-tree-item"
                  onClick={() => handleFolderClick('Referti')}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="folder-icon">📁</span>
                  <span className="folder-name">Referti</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BLOCCO "VISITE PRECEDENTI" */}
        <div className="visite-card visite-card-precedenti">
          <div className="visite-card-header">
            <h3>Visite Precedenti</h3>
            <span className="visite-count">{altreVisite.length}</span>
          </div>
          <div className="visite-card-body">
            {altreVisite.length === 0 ? (
              <p className="visite-empty">Nessuna visita precedente</p>
            ) : (
              <>
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
        </div>

        {/* 3. BLOCCO "AZIONI RAPIDE" */}
        <div className="visite-card" style={{ marginTop: 'var(--space-3)' }}>
          <div className="visite-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LightningIcon />
              Azioni rapide
            </h3>
          </div>
          <div className="visite-card-body">
            <div className="visite-quick-actions">
              <button 
                className="btn btn-sm btn-outline quick-action-btn" 
                style={{ 
                  width: '100%', 
                  marginBottom: 'var(--space-2)', 
                  justifyContent: 'flex-start',
                  gap: '10px'
                }}
                onClick={() => alert('Carica Nuovo File (mock)')}
              >
                <PlusIcon />
                Carica Nuovo File
              </button>
              <button 
                className="btn btn-sm btn-outline quick-action-btn" 
                style={{ 
                  width: '100%', 
                  marginBottom: 'var(--space-2)', 
                  justifyContent: 'flex-start',
                  gap: '10px'
                }}
                onClick={() => alert('Condividi File (mock)')}
              >
                <ShareIcon />
                Condividi File
              </button>
              <button 
                className="btn btn-sm btn-outline quick-action-btn" 
                style={{ 
                  width: '100%', 
                  justifyContent: 'flex-start',
                  gap: '10px'
                }}
                onClick={() => alert('Condividi Cartella (mock)')}
              >
                <ShareIcon />
                Condividi Cartella
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== MODALE DI CONFERMA ==================== */}
      {showModal && (
        <div className="visite-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="visite-modal" onClick={(e) => e.stopPropagation()}>
            <div className="visite-modal-header">
              <h3>Conferma Modifica</h3>
            </div>
            <div className="visite-modal-body">
              <p>Stai per modificare una visita già <strong>completata</strong>.</p>
              <p>Confermi di voler procedere con le modifiche?</p>
            </div>
            <div className="visite-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Annulla
              </button>
              <button className="btn btn-primary" onClick={saveVisita}>
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default VisitePagina;