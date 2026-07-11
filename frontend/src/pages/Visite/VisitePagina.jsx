import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../services/apiService';
import SchedaAnimale from '../Animali/SchedaAnimale';
import VisitaForm from './VisitaForm';
import { toISODatetimeFormat, toISODateFormat, formatDate, formatDateShort, formatTime, parseDate } from '../../utils/dateUtils';

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

// ==============================
// COMPONENTE
// ==============================
function VisitePagina() {
  const { id } = useParams();
  const navigate = useNavigate();
  const visitaId = parseInt(id);
  const { get, post, patch } = useApi();

  const [visita, setVisita] = useState(null);
  const [animale, setAnimale] = useState(null);
  const [visite, setvisite] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
          const visitaResponse = await get(`/api/visite/${visitaId}`);
          if (!visitaResponse.ok) {
            throw new Error(`Failed to fetch visita: ${visitaResponse.status}`);
          }
          const visitaData = await visitaResponse.json();
          
          // Fetch animal details using the visita data
          let animaleData;
          if (visitaData.animaleId) {
            const animaleResponse = await get(`/api/animali/${visitaData.animaleId}`);
            if (!animaleResponse.ok) {
              throw new Error(`Failed to fetch animale: ${animaleResponse.status}`);
            }
            animaleData = await animaleResponse.json();
          } else {
            throw new Error('Animal ID is missing from visita data');
          }
          
          // Fetch previous visits for this animal
          const visiteResponse = await get(`/api/visite/animale/${animaleData.id}`);
          const visiteData = await visiteResponse.json();
          
          setVisita({
            id: visitaData.id,
            visitStart: visitaData.visitStart || visitaData.dataOraVisita,
            dataOraVisita: visitaData.dataOraVisita,
            durata: visitaData.durata || 0,
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
            const animaleResponse = await get(`/api/animali/${animalId}`);
            if (!animaleResponse.ok) {
              if (animaleResponse.status === 400) {
                throw new Error('Invalid animal ID provided');
              }
              throw new Error(`Failed to fetch animale: ${animalId}`);
            }
            const animaleData = await animaleResponse.json();
            setAnimale(animaleData);
            
            // Fetch previous visits for this animal
            const visiteResponse = await get(`/api/visite/animale/${animalId}`);
            const visiteData = await visiteResponse.json();
            setvisite(visiteData);
          }
          
          // Set default values for new visita
          const now = new Date();
          const nowStr = now.toLocaleString('sv-SE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(' ', 'T');
          
          setVisita({
            id: null,
            visitStart: nowStr,
            dataOraVisita: nowStr,
            durata: 0,
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
  }, [visitaId, get]);

  // ----- SALVATAGGIO (senza popup) -----
  const saveVisita = async (visitaData) => {
    setIsSaving(true);
    try {
      if (visita.id) {
        // Aggiornamento visita esistente
        const response = await patch(`/api/visite/${visita.id}`, visitaData);
        if (!response.ok) {
          throw new Error(`Errore durante l'aggiornamento: ${response.status}`);
        }
        // Nessun popup, solo navigazione per ricaricare i dati
        navigate(`/visite/${visita.id}`);
      } else {
        // Creazione nuova visita
        const animalId = animale?.id;
        if (!animalId) {
          throw new Error('ID animale mancante');
        }
        const response = await post(`/api/visite/animale/${animalId}`, visitaData);
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
        <div className="error-icon">⚠️</div>
        <h3>Errore di caricamento</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Riprova</button>
      </div>
    );
  }

  if (!visita || !animale) {
    return (
      <div className="error-wrapper">
        <div className="error-icon">❌</div>
        <h3>Dati non disponibili</h3>
        <p>Impossibile caricare i dati della visita o dell'animale</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Riprova</button>
      </div>
    );
  }

  const isVisitaCorrente = visitaId === visitaCorrente || !visita.id;
  
  // Funzioni per la struttura cartella
  const handleFolderClick = (folderName) => {
    console.log(`Apertura cartella: ${folderName}`);
    // In una implementazione reale, questo navigherebbe alla pagina appropriata
    // o aprirebbe un modal con i contenuti della cartella
  };

  return (
    <div className="visite-pagina">

      {/* ==================== COLONNA SINISTRA - DATI ANIMALE ==================== */}
      <SchedaAnimale animale={animale} />

      {/* ==================== COLONNA CENTRALE - FORM VISITA ==================== */}
      <VisitaForm
        visita={visita}
        animale={animale}
        onSave={saveVisita}
        onCancel={() => navigate('/visite')}
        isSaving={isSaving}
      />

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

        {/* 2. BLOCCO "VISITE" */}
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
              style={{ width: '100%' }}
            >
              <PlusIcon /> Nuova Visita
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default VisitePagina;