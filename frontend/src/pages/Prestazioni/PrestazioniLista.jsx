import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../services/apiService';
import ListPageTemplate from '../../components/ListPageTemplate/ListPageTemplate';
import { GearMenu } from '../../components/ContextMenu/ContextMenu';
import { useTableControls } from '../../hooks/useTableControls';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import { useSearchControls } from '../../hooks/useSearchControls'; // nuovo
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { PlusIcon, ServicesIcon } from '../../components/icons';

function PrestazioniLista() {
  const { get, remove, put } = useApi();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [statsRefreshIndex, setStatsRefreshIndex] = useState(0);

  const table = useTableControls({
    defaultSortBy: 'nomePrestazione',
    defaultSortDir: 'asc',
    defaultPageSize: 10
  });

  const search = useSearchControls(); // nuovo
  const [statoFiltro, setStatoFiltro] = useState(''); // nuovo

  // Filtri: search + stato
  const filters = useMemo(() => ({
    search: search.appliedSearchTerm,
    stato: statoFiltro
  }), [search.appliedSearchTerm, statoFiltro]);

  const { data, loading, error, totalPages, totalCount, refetch } = usePaginatedFetch(
    '/api/prestazioni',
    {
      page: table.page,
      size: table.size,
      sortBy: table.sortBy,
      sortDir: table.sortDir,
      filters
    }
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const response = await get('/api/stats/prestazioni');
        if (!response.ok) throw new Error('Errore nel caricamento statistiche');
        const data = await response.json();
        setStats({
          totalCount: data?.totalCount ?? 0,
          activeCount: data?.activeCount ?? 0,
          inactiveCount: data?.inactiveCount ?? 0,
          averageCost: data?.averageCost != null ? Number(data.averageCost).toFixed(2) : '0.00',
          averageDuration: data?.averageDuration != null ? Math.round(Number(data.averageDuration)) : 0
        });
      } catch (err) {
        setStatsError(err);
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [get, statsRefreshIndex]);

  const handleCreatePrestazione = () => navigate('/prestazioni/create');
  const handleEditPrestazione = (prestazione) => navigate(`/prestazioni/edit/${prestazione.id}`);

  const handleToggleStato = async (prestazione) => {
    const nuovoStato = prestazione.stato === 'ATTIVO' || prestazione.stato === 'Disponibile' ? 'Non disponibile' : 'Disponibile';
    const azione = nuovoStato === 'Disponibile' ? 'riattivare' : 'disabilitare';
    if (!window.confirm(`Sei sicuro di voler ${azione} la prestazione "${prestazione.nomePrestazione}"?`)) {
      return;
    }
    try {
      const response = await put(`/api/prestazioni/${prestazione.id}`, { ...prestazione, stato: nuovoStato });
      if (!response.ok) throw new Error(`Errore: ${response.status}`);
      setStatsRefreshIndex(prev => prev + 1);
      refetch();
    } catch (err) {
      console.error('Failed to update stato:', err);
      window.alert('Errore durante l\'aggiornamento dello stato.');
    }
  };

  const handleDeletePrestazione = async (prestazione) => {
    if (!window.confirm(`Sei sicuro di voler eliminare la prestazione "${prestazione.nomePrestazione}"? Questa azione non può essere annullata.`)) {
      return;
    }
    try {
      const response = await remove(`/api/prestazioni/${prestazione.id}`);
      if (response.status === 409) {
        const errorData = await response.json().catch(() => ({}));
        window.alert(`Impossibile eliminare la prestazione: è associata a ${errorData.message || 'altri record del sistema'}. Disabilitala invece.`);
        return;
      }
      if (!response.ok) {
        throw new Error(`Errore nell'eliminazione: ${response.status}`);
      }
      setStatsRefreshIndex(prev => prev + 1);
      refetch();
    } catch (err) {
      console.error('Failed to delete prestazione:', err);
      window.alert('Errore durante l\'eliminazione della prestazione.');
    }
  };

  const columns = [
    {
      header: 'NOME PRESTAZIONE',
      field: 'nomePrestazione',
      sortable: true
    },
    { header: 'DESCRIZIONE', field: 'descrizione', sortable: false },
    {
      header: 'DURATA',
      field: 'durataStimata',
      sortable: true,
      render: (item) => `${item.durataStimata} min`
    },
    {
      header: 'COSTO',
      field: 'costoBase',
      sortable: true,
      render: (item) => {
        const val = typeof item.costoBase === 'string' ? parseFloat(item.costoBase) : item.costoBase || 0;
        return `€${val.toFixed(2)}`;
      }
    },
    {
      header: 'STATO',
      field: 'stato',
      sortable: true,
      render: (item) => {
        const isActive = item.stato === 'ATTIVO' || item.stato === 'Disponibile';
        const status = isActive
          ? { label: 'Attivo', className: 'badge-attivo' }
          : { label: 'Disabilitato', className: 'badge-inattivo' };
        return <span className={`badge-status ${status.className}`}>{status.label}</span>;
      }
    },
    {
      header: 'COLORE',
      field: 'colore',
      sortable: false,
      render: (item) => (
        <div style={{
          width: '20px', height: '20px',
          backgroundColor: item.colore || '#ccc',
          borderRadius: '50%', border: '1px solid #ddd'
        }} />
      )
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
              onClick: () => handleEditPrestazione(item)
            },
            { divider: true },
            {
              label: (item.stato === 'ATTIVO' || item.stato === 'Disponibile') ? 'Disabilita' : 'Riattiva',
              onClick: () => handleToggleStato(item)
            },
            { divider: true },
            {
              label: 'Elimina',
              className: 'danger',
              onClick: () => handleDeletePrestazione(item)
            }
          ]}
        />
      )
    }
  ];

  // Filtro di stato (come in ProprietariLista)
  const statoOptions = [
    { label: 'Tutti', value: '' },
    { label: 'Disponibili', value: 'Disponibile', className: 'btn-filter-success' },
    { label: 'Non disponibili', value: 'Non disponibile', className: 'btn-filter-gray' }
  ];

  const filterOptions = {
    label: 'Stato',
    options: statoOptions,
    searchable: 'nome, descrizione o costo'
  };

  // Contenuto statistiche (identico a ProprietariLista)
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
            <div className="stat-label">Totale Prestazioni</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-success">{stats.activeCount}</div>
            <div className="stat-label">Attive</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-gray">{stats.inactiveCount}</div>
            <div className="stat-label">Disabilitate</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-info">€{stats.averageCost}</div>
            <div className="stat-label">Costo Medio</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-info">{stats.averageDuration} min</div>
            <div className="stat-label">Durata Media</div>
          </div>
        </>
      ) : null}
    </>
  );

  const emptyIcon = (
    <ServicesIcon width={48} height={48} style={{ color: 'var(--gray-400)', opacity: 0.5 }} />
  );

  return (
    <ListPageTemplate
      title="Gestione Prestazioni"
      subtitle="Gestisci le prestazioni e i relativi costi"
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      tableControls={{ ...table, totalPages, totalCount }}
      searchControls={search}                         // ← ripristina la searchbox
      filterOptions={filterOptions}                   // ← filtro stato
      activeFilter={statoFiltro}
      onFilterSelect={setStatoFiltro}
      emptyMessage={search.appliedSearchTerm || statoFiltro ? 'Prova a modificare i filtri.' : 'Inizia aggiungendo la prima prestazione.'}
      emptyIcon={emptyIcon}
      showAddButton={true}
      onAddClick={handleCreatePrestazione}
      addIcon={<PlusIcon width={16} height={16} stroke="currentColor" />}
      statsContent={statsContent}
    />
  );
}

export default PrestazioniLista;