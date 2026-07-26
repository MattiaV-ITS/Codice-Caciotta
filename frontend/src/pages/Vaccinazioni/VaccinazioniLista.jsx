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
  }, [get]);

  const emptyIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 183.153 183.153"
      width="48"
      height="48"
      fill="var(--gray-400)"
      opacity="0.5"
    >
      <path d="M182.274,0.879c-1.171-1.172-3.071-1.172-4.242,0L145.331,33.58c-1.5-0.209-3.074,0.245-4.227,1.398l-9.146,9.146
        l-11.538-11.537c-1.953-1.952-5.118-1.952-7.071,0l-76.01,76.01l-1.521-1.521c-1.953-1.952-5.118-1.952-7.071,0
        c-1.953,1.953-1.953,5.119,0,7.071l5.057,5.057l11.538,11.538l-27.828,27.827l-8.978-8.978c-1.953-1.952-5.118-1.952-7.071,0
        c-1.953,1.953-1.953,5.119,0,7.071l25.027,25.027c0.977,0.976,2.256,1.464,3.536,1.464c1.279,0,2.559-0.488,3.536-1.464
        c1.953-1.953,1.953-5.119,0-7.071l-8.978-8.978l27.828-27.827L63.95,149.35l5.057,5.057c0.977,0.976,2.256,1.464,3.536,1.464
        s2.559-0.488,3.536-1.464c1.953-1.953,1.953-5.119,0-7.071l-1.521-1.521l76.01-76.01c0.938-0.938,1.464-2.209,1.464-3.536
        s-0.527-2.598-1.464-3.536L139.03,51.195l9.146-9.146c1.153-1.153,1.607-2.728,1.398-4.227l32.7-32.7
        C183.446,3.95,183.446,2.05,182.274,0.879z M67.486,138.743L44.41,115.667l14.417-14.417l11.538,11.538
        c0.585,0.586,1.354,0.879,2.121,0.879s1.536-0.293,2.121-0.879c1.172-1.171,1.172-3.071,0-4.242L63.07,97.008l7.128-7.128
        l11.538,11.538c0.585,0.585,1.354,0.878,2.121,0.878s1.536-0.293,2.122-0.879c1.171-1.171,1.171-3.071,0-4.243L74.441,85.637
        l7.128-7.128l11.538,11.538c0.585,0.586,1.354,0.879,2.121,0.879s1.536-0.293,2.121-0.879c1.172-1.171,1.172-3.071,0-4.242
        L85.812,74.266l7.128-7.128l11.537,11.538c0.586,0.586,1.354,0.879,2.122,0.879c0.768,0,1.536-0.293,2.121-0.878
        c1.172-1.172,1.172-3.071,0-4.243L97.183,62.895l19.702-19.702l23.075,23.075L67.486,138.743z"/>
    </svg>
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
            refetch();
          }}
        />
      )}
    </>
  );
}

export default VaccinazioniLista;