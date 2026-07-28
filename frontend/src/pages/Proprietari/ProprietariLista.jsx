import React, { useState, useMemo, useEffect } from 'react';
import ProprietarioCreate from './ProprietarioCreate';
import ListPageTemplate from '../../components/ListPageTemplate/ListPageTemplate';
import { GearMenu } from '../../components/ContextMenu/ContextMenu';
import { loadFullProprietarioData } from '../../utils/dataLoader';

import { useTableControls } from '../../hooks/useTableControls';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import { useSearchControls } from '../../hooks/useSearchControls';
import { useApi } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

function ProprietariLista() {
  const table = useTableControls({
    defaultSortBy: 'cognome',
    defaultSortDir: 'asc',
    defaultPageSize: 10
  });

  const search = useSearchControls();
  const [statoFiltro, setStatoFiltro] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProprietario, setEditingProprietario] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [statsRefreshIndex, setStatsRefreshIndex] = useState(0);
  const { get, patch } = useApi();

  const memoizedFilters = useMemo(() => ({
    search: search.appliedSearchTerm,
    stato: statoFiltro
  }), [search.appliedSearchTerm, statoFiltro]);

  const { data: proprietari, loading, error, totalPages, totalCount, refetch } =
    usePaginatedFetch('/api/proprietari', {
      page: table.page,
      size: table.size,
      sortBy: table.sortBy,
      sortDir: table.sortDir,
      filters: memoizedFilters
    });

  const statoOptions = [
    { label: 'Tutti', value: '' },
    { label: 'Attivi', value: 'true', className: 'btn-filter-success' },
    { label: 'Inattivi', value: 'false', className: 'btn-filter-gray' }
  ];

  const filterOptions = {
    label: 'Stato',
    options: statoOptions,
    searchable: 'nome, cognome, telefono, email, codice fiscale o città'
  };

  const customColumns = [
    {
      header: 'NOME',
      field: 'nome',
      sortable: true,
      render: (item) => (
        <div className="cell-content" style={{ gap: '6px' }}>
          <div className={`avatar-circle ${item.stato ? 'avatar-success' : 'avatar-gray'}`}>
            {(item.nome?.[0] || '') + (item.cognome?.[0] || '')}
          </div>
          <span style={{ color: 'var(--gray-900)', fontWeight: '600' }}>
            {item.nome}
          </span>
        </div>
      )
    },
    { header: 'COGNOME', field: 'cognome', sortable: true },
    { header: 'TELEFONO', field: 'telefono', sortable: true },
    { header: 'EMAIL', field: 'email', sortable: true },
    { header: 'CODICE FISCALE', field: 'codiceFiscale', sortable: true },
    { header: 'DATA REGISTRAZIONE', field: 'dataRegistrazione', type: 'date', sortable: true },
    { header: 'NUMERO ANIMALI', field: 'numeroAnimali', sortable: true },
    {
      header: 'STATO',
      field: 'stato',
      sortable: false,
      render: (item) => {
        const stato = item.stato
          ? { label: 'Attivo', className: 'badge-attivo' }
          : { label: 'Inattivo', className: 'badge-inattivo' };
        return <span className={`badge-status ${stato.className}`}>{stato.label}</span>;
      }
    },
    {
      header: '',
      field: 'azioni',
      sortable: false,
      render: (item) => (
        <GearMenu
          menuItems={[
            {
              label: 'Modifica',
              onClick: () => handleEditProprietario(item)
            },
            { divider: true },
            {
              label: 'Imposta come Attivo',
              onClick: () => handleStatusChange(item.id, true)
            },
            {
              label: 'Imposta come Inattivo',
              onClick: () => handleStatusChange(item.id, false)
            }
          ]}
        />
      )
    }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await get('/api/stats/proprietari');
        const data = await response.json();
        setStats(data || {});
        setStatsError(null);
      } catch (err) {
        setStatsError(err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [get, statsRefreshIndex]);

  const handleStatoCardFilter = (stato) => {
    if (statoFiltro === stato) {
      setStatoFiltro('');
    } else {
      setStatoFiltro(stato);
    }
    table.setPage(0);
  };

  const handleClearAllFilters = () => {
    search.clearSearch();
    setStatoFiltro('');
  };

  const statsContent = (
    <>
      {statsLoading ? (
        <div className="stats-loading">
          <LoadingSpinner size="small" />
        </div>
      ) : statsError ? (
        <div className="stats-error">
          <ErrorMessage error={statsError} />
        </div>
      ) : stats ? (
        <>
          <div
            className={`stat-card ${!statoFiltro ? 'stat-active' : ''}`}
            onClick={() => {
              setStatoFiltro('');
              table.setPage(0);
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-number stat-primary">{stats.totalCount}</div>
            <div className="stat-label">Totale Proprietari</div>
          </div>

          <div
            className={`stat-card ${statoFiltro === 'true' ? 'stat-active' : ''}`}
            onClick={() => handleStatoCardFilter('true')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-number stat-success">{stats.attiviCount}</div>
            <div className="stat-label">Attivi</div>
          </div>

          <div
            className={`stat-card ${statoFiltro === 'false' ? 'stat-active' : ''}`}
            onClick={() => handleStatoCardFilter('false')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-number stat-gray">{stats.inattiviCount}</div>
            <div className="stat-label">Inattivi</div>
          </div>

          <div className="stat-card">
            <div className="stat-number stat-info">
              {stats.averageAnimaliPerProprietario?.toFixed(1) ?? '0.0'}
            </div>
            <div className="stat-label">Media Animali</div>
          </div>
        </>
      ) : null}
    </>
  );

  const emptyIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const emptyMessage = search.appliedSearchTerm || statoFiltro
    ? 'Prova a modificare i filtri.'
    : 'Inizia aggiungendo il primo proprietario.';

  const handleEditProprietario = (proprietario) => {
    loadFullProprietarioData(proprietario.id,
      (fullProprietarioData) => {
        setEditingProprietario(fullProprietarioData);
        setShowEditModal(true);
      },
      (error) => {
        logger.error('Failed to load full proprietario data:', error);
        setEditingProprietario(proprietario);
        setShowEditModal(true);
      }
    );
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await patch(`/api/proprietari/${id}`, { stato: newStatus });
      if (!response.ok) {
        throw new Error(`Errore nell'aggiornamento dello stato: ${response.status}`);
      }
      setStatsRefreshIndex(prev => prev + 1);
      refetch();
    } catch (err) {
      logger.error('Failed to update proprietario status:', err);
    }
  };

  const additionalContent = (
    <>
      {showCreateModal && (
        <ProprietarioCreate
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setStatsRefreshIndex(prev => prev + 1);
            table.setPage(0);
            search.clearSearch();
            setStatoFiltro('');
          }}
        />
      )}
      {showEditModal && editingProprietario && (
        <ProprietarioCreate
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setStatsRefreshIndex(prev => prev + 1);
            table.setPage(0);
            search.clearSearch();
            setStatoFiltro('');
            setShowEditModal(false);
            setEditingProprietario(null);
          }}
          proprietario={editingProprietario}
          isEditMode={true}
        />
      )}
    </>
  );

  return (
    <ListPageTemplate
      title="Elenco Proprietari"
      subtitle="Gestisci i tuoi clienti"
      data={proprietari}
      columns={customColumns}
      loading={loading}
      error={error}
      tableControls={{ ...table, totalPages, totalCount }}
      searchControls={search}
      filterOptions={filterOptions}
      activeFilter={statoFiltro}
      onFilterSelect={setStatoFiltro}
      emptyMessage={emptyMessage}
      emptyIcon={emptyIcon}
      onAddClick={() => setShowCreateModal(true)}
      additionalContent={additionalContent}
      statsContent={statsContent}
      onClearAllFilters={handleClearAllFilters}
    />
  );
}

export default ProprietariLista;
