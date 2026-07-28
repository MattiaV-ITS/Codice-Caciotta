import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import SchedaAnimale from './SchedaAnimale';
import AnimaleCreate from './AnimaleCreate';
import DocumentiAllegati from '../../components/Documenti/DocumentiAllegati';
import { formatDateShort, formatTime } from '../../utils/dateUtils';
import { PlusIcon } from '../../components/icons';
import VaccinazioniSidebar from '../../components/VaccinazioniSidebar/VaccinazioniSidebar';

function AnimaleDettaglio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const animaleId = parseInt(id);
  const api = useApi();
  const { get, post, put, patch, remove } = api;
  const { user } = useAuth();

  const [animale, setAnimale] = useState(null);
  const [visite, setVisite] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnimale, setEditingAnimale] = useState(null);
  const [hasExpiredVaccinations, setHasExpiredVaccinations] = useState(false);

  const isStaffOrAdmin = user?.roles?.some(r => r === 'ROLE_STAFF' || r === 'ROLE_ADMIN');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const animaleResponse = await api.get(`/api/animali/${animaleId}`);
        if (!animaleResponse.ok) {
          throw new Error(`Failed to fetch animale: ${animaleResponse.status}`);
        }
        const animaleData = await animaleResponse.json();
        
        if (!animaleData || !animaleData.id) {
          throw new Error('Invalid animal data structure');
        }
        
        setAnimale(animaleData);
        
        try {
          const visiteResponse = await api.get(`/api/visite/animale/${animaleId}`);
          if (visiteResponse.ok) {
            const visiteData = await visiteResponse.json();
            setVisite(Array.isArray(visiteData) ? visiteData : []);
          } else {
            logger.warn(`Failed to fetch visits for animal ${animaleId}: ${visiteResponse.status}`);
            setVisite([]);
          }
        } catch (visiteError) {
          logger.error('Error fetching visits:', visiteError);
          setVisite([]);
        }

        // Check if animal has expired vaccinations
        try {
          const vaccRes = await api.get(`/api/stats/animali-vaccinazioni-scadute`);
          if (vaccRes.ok) {
            const vaccData = await vaccRes.json();
            const expiredIds = Array.isArray(vaccData) ? vaccData : [];
            setHasExpiredVaccinations(expiredIds.includes(animaleId));
          }
        } catch (vaccError) {
          logger.error('Error fetching vaccination status:', vaccError);
        }
        
      } catch (error) {
        logger.error('Error fetching data:', error);
        setError(error.message || 'Failed to load animal data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [animaleId, get]);

  const handleEditAnimale = (animaleData) => {
    setEditingAnimale(animaleData);
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedAnimale) => {
    setAnimale(updatedAnimale);
    setShowEditModal(false);
    setEditingAnimale(null);
  };

  const goToVisita = (visitaId) => {
    navigate(`/visite/${visitaId}`);
  };

  const goToNuovaVisita = () => {
    navigate(`/visite/new?animaleId=${animaleId}`);
  };

  if (isLoading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento dati animale...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-wrapper">
        <div className="error-icon">âš ï¸</div>
        <h3>Errore di caricamento</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Riprova</button>
      </div>
    );
  }

  if (!animale) {
    return (
      <div className="error-wrapper">
        <div className="error-icon">âŒ</div>
        <h3>Dati non disponibili</h3>
        <p>Impossibile caricare i dati dell'animale</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Riprova</button>
      </div>
    );
  }

  return (
    <div className="visite-pagina">

      <SchedaAnimale 
        animale={animale} 
        hasExpiredVaccinations={hasExpiredVaccinations}
        onEditClick={isStaffOrAdmin ? handleEditAnimale : undefined}
      />

      <div className="visite-colonna-center">
        <div className="visite-card">
          <div className="visite-card-header">
            <h3>Dettagli Animale</h3>
          </div>
          <div className="visite-card-body" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--gray-600)', fontSize: '16px', marginBottom: '20px' }}>
              Seleziona una visita dalla lista a destra o crea una nuova visita
            </p>
            <button 
              className="btn btn-primary"
              onClick={goToNuovaVisita}
              style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <PlusIcon width={16} height={16} stroke="currentColor" />
              Crea Nuova Visita
            </button>
          </div>
        </div>
      </div>

      <div className="visite-colonna-destra">
        {/* DOCUMENTI DELL'ANIMALE */}
        <div className="visite-card">
          <div className="visite-card-header">
            <h3>Documenti</h3>
          </div>
          <div className="visite-card-body" style={{ padding: 'var(--space-2)' }}>
            <DocumentiAllegati
              animaleId={animaleId}
              titolo="Documenti"
              nascondiSeVuoto={false}
            />
          </div>
        </div>

        {/* VACCINAZIONI */}
        <VaccinazioniSidebar animaleId={animale.id} animaleNome={animale.nome} isStaffOrAdmin={isStaffOrAdmin} />

        <div className="visite-card visite-card-precedenti">
          <div className="visite-card-header">
            <h3>Visite dell'Animale</h3>
            <span className="visite-count">{visite.length}</span>
          </div>
          <div className="visite-card-body">
            {visite.length === 0 ? (
              <p className="visite-empty">Nessuna visita trovata per questo animale</p>
            ) : (
              <ul className="visite-list">
                {visite.map((v) => (
                  <li
                    key={v.id}
                    className="visite-list-item"
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

      {showEditModal && editingAnimale && (
        <AnimaleCreate
          animale={editingAnimale}
          isEditMode={true}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

export default AnimaleDettaglio;
