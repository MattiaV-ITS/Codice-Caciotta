import React, { useState, useMemo, useEffect } from 'react';

import ListaTable from '../../components/ListaTable/ListaTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import PaginationFooter from '../../components/common/PaginationFooter';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';
import ListPageTemplate from '../../components/ListPageTemplate/ListPageTemplate';
import VaccinazioneEditModal from '../../components/VaccinazioneEditModal/VaccinazioneEditModal';
import { GearMenu } from '../../components/ContextMenu/ContextMenu';
import { SyringeIcon } from '../../components/icons';

import { useTableControls } from '../../hooks/useTableControls';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import { useSearchControls } from '../../hooks/useSearchControls';
import { useApi } from '../../services/apiService';

function VaccinazioniLista() {
  const table = useTableControls({
    defaultSortBy: 'dataScadenza',
    defaultSortDir: 'asc',
    defaultPageSize: 15
  });

  const search = useSearchControls();
  const [statoFilter, setStatoFilter] = useState('');
  const [editingVaccinazione, setEditingVaccinazione] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [statsRefreshIndex, setStatsRefreshIndex] = useState(0);
  const { get } = useApi();

  // Memoizza i filtri per evitare ricalcoli inutili e garantire stabilità dei riferimenti
  const memoizedFilters = useMemo(() => ({
    search: search.appliedSearchTerm,
    stato: statoFilter
  }), [search.appliedSearchTerm, statoFilter]);

  const { data: vaccinazioni, loading, error, totalPages, totalCount, refetch } =
    usePaginatedFetch('/api/vaccinazioni', {
      page: table.page,
      size: table.size,
      sortBy: table.sortBy,
      sortDir: table.sortDir,
      filters: memoizedFilters
    });

  const statoOptions = [
    { label: 'Tutti', value: '' },
    { label: 'Valide', value: 'VALIDO', className: 'btn-filter-success' },
    { label: 'In Scadenza', value: 'PROSSIMO', className: 'btn-filter-warning' },
    { label: 'Scadute', value: 'SCADUTO', className: 'btn-filter-danger' }
  ];

  const filterOptions = {
    label: 'Stato',
    options: statoOptions,
    searchable: 'tipo, lotto, nome Animale'
  };

  const getStatusInfo = (status) => {
    const normalized = status ? String(status).toUpperCase() : '';

    const map = {
      VALIDO: { label: 'Valido', className: 'badge-valido' },
      PROSSIMO: { label: 'In scadenza', className: 'badge-prossimo' },
      SCADUTO: { label: 'Scaduto', className: 'badge-scaduto' }
    };

    return map[normalized] || { label: 'Sconosciuto', className: 'badge-sconosciuto' };
  };

  const customColumns = [
    {
      header: 'TIPO VACCINO',
      field: 'tipoVaccino',
      sortable: true,
      render: (item) => (
        <div className="cell-content">
          <div className="avatar-circle avatar-vaccine">💉</div>
          <span className="name-colored">{item.tipoVaccino}</span>
        </div>
      )
    },
    { header: 'ANIMALE', field: 'nomeAnimale', sortField: 'animale.nome', sortable: true },
    { header: 'DATA SOMMINISTRAZIONE', field: 'dataSomministrazione', type: 'date', sortable: true },
    { header: 'LOTTO', field: 'lotto', sortable: true },
    { header: 'DATA SCADENZA', field: 'dataScadenza', type: 'date', sortable: true },
    {
      header: 'STATO',
      field: 'statoVaccinazione',
      sortable: false,
      render: (item) => {
        const status = getStatusInfo(item.statoVaccinazione);
        return <span className={`badge-status ${status.className}`}>{status.label}</span>;
      }
    },
    {
      header: 'AZIONI',
      field: 'azioni',
      sortable: false,
      render: (item) => (
        <GearMenu
          menuItems={[
            {
              label: 'Modifica',
              onClick: () => setEditingVaccinazione(item)
            }
          ]}
        />
      )
    }
  ];

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
          <div className="stat-card">
            <div className="stat-number stat-primary">{stats.totalCount}</div>
            <div className="stat-label">Totale Vaccinazioni</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-success">
              {stats.valideCount}
            </div>
            <div className="stat-label">Valide</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-warning">
              {stats.prossimeCount}
            </div>
            <div className="stat-label">In Scadenza</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-danger">
              {stats.scaduteCount}
            </div>
            <div className="stat-label">Scadute</div>
          </div>
        </>
      ) : null}
    </>
  );

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        console.log('Fetching vaccination stats...');
        const response = await get('/api/stats/vaccinazioni');
        const data = await response.json();
        console.log('Vaccination stats received:', data);
        setStats(data);
        setStatsError(null);
      } catch (err) {
        console.error('Failed to fetch vaccination stats:', err);
        setStatsError(err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [get, statsRefreshIndex]);

const emptyIcon = (
  <SyringeIcon
    width={48}
    height={48}
    fill="var(--gray-400)"
    opacity={0.5}
  />
);

  const emptyMessage = search.appliedSearchTerm || statoFilter
    ? 'Prova a modificare i filtri di ricerca.'
    : 'Inizia aggiungendo la prima vaccinazione.';

  if (loading) return <LoadingSpinner label="Caricamento vaccinazioni..." />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <>
      <ListPageTemplate
        title="Elenco Vaccinazioni"
        subtitle="Gestisci le vaccinazioni degli animali"
        data={vaccinazioni}
        columns={customColumns}
        loading={loading}
        error={error}
        tableControls={{ ...table, totalPages, totalCount }}
        searchControls={search}
        filterOptions={filterOptions}
        activeFilter={statoFilter}
        onFilterSelect={setStatoFilter}
        emptyMessage={emptyMessage}
        emptyIcon={emptyIcon}
        showAddButton={false}
        statsContent={statsContent}
      />

      {editingVaccinazione && (
        <VaccinazioneEditModal
          vaccinazione={editingVaccinazione}
          onClose={() => setEditingVaccinazione(null)}
          onSuccess={() => {
            setEditingVaccinazione(null);
            setStatsRefreshIndex(prev => prev + 1);
            refetch();
          }}
        />
      )}
    </>
  );
}

export default VaccinazioniLista;