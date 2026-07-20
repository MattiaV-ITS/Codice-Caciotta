import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../services/apiService';
import { formatDate } from '../../utils/dateUtils';
import EditIcon from '../../components/icons/EditIcon';

function SchedaAnimale({ animale, onEditClick }) {
  const navigate = useNavigate();
  const { get } = useApi();

  if (!animale) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento dati animale...</span>
      </div>
    );
  }

  return (
    <div className="visite-colonna-left">
      <div className="visite-card">
        <div className="visite-card-header">
          <h3>Dati Animale</h3>
          <span className={`badge-status ${animale.stato?.toLowerCase()}`}>
            {animale.stato || 'Sconosciuto'}
          </span>
        </div>

        <div className="visite-card-body">
          {/* ANAGRAFICA */}
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

          {/* ALLERGIE E PATOLOGIE */}
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

          {/* DATI CLINICI */}
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

          {/* PROPRIETARIO */}
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

          {/* NOTE GENERALI */}
          <div className="visite-detail-section">
            <span className="visite-section-title">Note Generali</span>
            <div className="visite-detail-item">
              <span className="visite-detail-label">Note</span>
              <span className="visite-detail-value">{animale.noteGenerali || '-'}</span>
            </div>
          </div>

          {/* PULSANTE MODIFICA - posizionato in fondo */}
          {onEditClick && (
            <div 
              className="visite-detail-section" 
              style={{ 
                marginTop: 'var(--space-4)', 
                borderTop: '1px solid var(--gray-200)', 
                paddingTop: 'var(--space-4)' 
              }}
            >
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => onEditClick(animale)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--gray-300)',
                  background: 'transparent',
                  color: 'var(--gray-700)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary-light)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--gray-300)';
                  e.currentTarget.style.color = 'var(--gray-700)';
                }}
              >
                <EditIcon size={18} />
                Modifica Animale
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchedaAnimale;