import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../../services/apiService';
import VaccinazioneCreateModal from '../VaccinazioneCreateModal/VaccinazioneCreateModal';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { SyringeIcon } from '../icons';
import './VaccinazioniSidebar.css';

function VaccinazioniSidebar({ animaleId, animaleNome, isStaffOrAdmin }) {
  const api = useApi();
  const { get } = api;

  const [vaccinazioni, setVaccinazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [renewTipo, setRenewTipo] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        if (!animaleId) {
          setVaccinazioni([]);
          setLoading(false);
          return;
        }
        setLoading(true);
        const url = `/api/vaccinazioni?animaleId=${animaleId}&size=200&page=0`;
        const response = await api.get(url);
        if (!cancelled && response.ok) {
          const data = await response.json();
          const list = Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data)
              ? data
              : [];
          setVaccinazioni(list);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Errore caricamento vaccinazioni');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [animaleId, refresh, get]);

  const dedupedVaccinazioni = useMemo(() => {
    const map = new Map();
    for (const v of vaccinazioni) {
      const key = v.tipoVaccino;
      const existing = map.get(key);
      const currentDate = v.dataSomministrazione || '';
      if (!existing || currentDate > existing.dataSomministrazione) {
        map.set(key, v);
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      const da = a.dataSomministrazione || '';
      const db = b.dataSomministrazione || '';
      return db.localeCompare(da);
    });
  }, [vaccinazioni]);

  const handleRenew = (tipo) => {
    setRenewTipo(tipo);
    setShowModal(true);
  };

  const handleCreate = () => {
    setRenewTipo('');
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setRenewTipo('');
    setVaccinazioni([]);
    setRefresh((p) => p + 1);
    window.dispatchEvent(new Event('vaccination-created'));
  };

  return (
    <div className="visite-card">
      <div className="visite-card-header">
        <h3>Vaccinazioni</h3>
      </div>
      <div className="visite-card-body">
        {loading ? (
          <div style={{ color: 'var(--gray-500)', fontSize: '13px' }}>Caricamento vaccinazioni...</div>
        ) : error ? (
          <div style={{ color: 'var(--danger)', fontSize: '13px' }}>{error}</div>
        ) : dedupedVaccinazioni.length === 0 ? (
          <p className="visite-empty" style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
            Nessuna vaccinazione per {animaleNome}
          </p>
        ) : (
          <div style={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
            {dedupedVaccinazioni.map((v) => {
              const stato = String(v.statoVaccinazione || '').toUpperCase();
              const colors =
                stato === 'VALIDO'
                  ? { bg: '#f0fff4', border: '#38a169' }
                  : stato === 'PROSSIMO'
                    ? { bg: '#fffaf0', border: '#dd6b20' }
                    : stato === 'SCADUTO'
                      ? { bg: '#fff5f5', border: '#e53e3e' }
                      : { bg: '#fff', border: '#ccc' };
              const menuItems = [
                {
                  label: 'Rinnova Vaccinazione',
                  onClick: () => handleRenew(v.tipoVaccino),
                },
              ];
              return (
                <ContextMenu key={v.id} menuItems={menuItems}>
                  <div
                    style={{
                      padding: '8px',
                      marginBottom: '6px',
                      borderRadius: '4px',
                      backgroundColor: colors.bg,
                      borderLeft: `3px solid ${colors.border}`,
                      fontSize: '13px',
                      cursor: 'context-menu',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{v.tipoVaccino}</div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: 'var(--gray-600)',
                        fontSize: '12px',
                        marginTop: '2px',
                      }}
                    >
                      <span>Somministrazione: {v.dataSomministrazione}</span>
                      <span>Scadenza: {v.dataScadenza}</span>
                    </div>
                  </div>
                </ContextMenu>
              );
            })}
          </div>
        )}
      </div>
      {isStaffOrAdmin && (
        <div className="visite-card-footer">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleCreate}
            style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <SyringeIcon width={16} height={16} fill="currentColor" />
            Nuova Vaccinazione
          </button>
        </div>
      )}
      {showModal && (
        <VaccinazioneCreateModal
          animaleId={animaleId}
          animaleNome={animaleNome}
          initialTipoVaccino={renewTipo}
          onClose={() => {
            setShowModal(false);
            setRenewTipo('');
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

export default VaccinazioniSidebar;