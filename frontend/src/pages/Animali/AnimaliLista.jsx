import React, { useState, useMemo, useEffect } from 'react';
import AnimaleCreate from './AnimaleCreate';
import ListPageTemplate from '../../components/ListPageTemplate/ListPageTemplate';
import { useNavigate } from 'react-router-dom';
import { GearMenu } from '../../components/ContextMenu/ContextMenu';
import { loadFullAnimaleData } from '../../utils/dataLoader';

import { useTableControls } from '../../hooks/useTableControls';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import { useSearchControls } from '../../hooks/useSearchControls';
import { getIconLetter } from "../../utils";
import { useApi } from '../../services/apiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { PawIcon, PlusIcon } from '../../components/icons';

function AnimaliLista() {
  const table = useTableControls({
    defaultSortBy: 'nome',
    defaultSortDir: 'asc',
    defaultPageSize: 15
  });

  const search = useSearchControls();
  const [specieFilter, setSpecieFilter] = useState('');
  const [statoFilter, setStatoFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnimale, setEditingAnimale] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [statsRefreshIndex, setStatsRefreshIndex] = useState(0);
  const { get, patch } = useApi();

  const memoizedFilters = useMemo(() => ({
  search: search.appliedSearchTerm,
  specie: specieFilter,
  stato: statoFilter
}), [search.appliedSearchTerm, specieFilter, statoFilter]);

  const { data: animali, loading, error, totalPages, totalCount, refetch } =
    usePaginatedFetch('/api/animali', {
      page: table.page,
      size: table.size,
      sortBy: table.sortBy,
      sortDir: table.sortDir,
      filters: memoizedFilters
    });

  const specieOptions = [
    { label: 'Tutti', value: '' },
    { label: 'Cane', value: 'cane' },
    { label: 'Gatto', value: 'gatto' },
    { label: 'Altri', value: 'altro' }
  ];

  const filterOptions = {
    label: 'Specie',
    options: specieOptions,
    searchable: 'nome, microchip, specie, o proprietario'
  };

  const getStatusInfo = (status) => {
    const map = {
      SANO: { label: 'Sano', className: 'badge-sano' },
      MALATO: { label: 'Malato', className: 'badge-malato' },
      IN_CURA: { label: 'In cura', className: 'badge-in-cura' },
      DECEDUTO: { label: 'Deceduto', className: 'badge-deceduto' }
    };
    return map[status] || { label: 'Sconosciuto', className: 'badge-sconosciuto' };
  };

  const customColumns = [
    // ... le tue colonne (invariate)
    {
      header: 'NOME ANIMALE',
      field: 'nome',
      sortable: true,
      render: (item) => {
        const isFemale = item.sesso?.toLowerCase() === 'f';
        const isMale = item.sesso?.toLowerCase() === 'm';
        const avatarClass = isFemale ? 'avatar-female' : isMale ? 'avatar-male' : 'avatar-default';
        return (
          <div className="cell-content">
            <div className={`avatar-circle ${avatarClass}`}>
              {getIconLetter(item.specie)}
            </div>
            <span className={`name-colored ${isFemale ? 'name-female' : isMale ? 'name-male' : ''}`}>
              {item.nome}
            </span>
          </div>
        );
      }
    },
    { header: 'SPECIE', field: 'specie', sortable: true },
    { header: 'RAZZA', field: 'razza', sortable: true },
    { header: 'PROPRIETARIO', field: 'proprietario', sortable: true },
    { header: 'DATA DI NASCITA', field: 'dataNascita', type: 'date', sortable: true },
    { header: 'MICROCHIP', field: 'microchip', sortable: true },
    {
      header: 'STATO',
      field: 'stato',
      sortable: false,
      render: (item) => {
        const status = getStatusInfo(item.stato);
        return <span className={`badge-status ${status.className}`}>{status.label}</span>;
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
              onClick: () => handleEditAnimale(item)
            },
            { divider: true },
            {
              label: 'Imposta come Sano',
              onClick: () => handleStatusChange(item.id, 'SANO')
            },
            {
              label: 'Imposta come Malato',
              onClick: () => handleStatusChange(item.id, 'MALATO')
            },
            {
              label: 'Imposta come In Cura',
              onClick: () => handleStatusChange(item.id, 'IN_CURA')
            },
            {
              label: 'Imposta come Deceduto',
              className: 'danger',
              onClick: () => handleStatusChange(item.id, 'DECEDUTO')
            }
          ]}
        />
      )
    }
  ];

  const emptyIcon = (
    <PawIcon width="48" height="48" style={{ color: 'var(--gray-400)', opacity: 0.5 }} />
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await get('/api/stats/animali');
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
    if (statoFilter === stato) {
      setStatoFilter('');
    } else {
      setStatoFilter(stato);
    }
    // Non cambiamo pagina perché il filtro è client
  };

  const handleClearAllFilters = () => {
    search.clearSearch();
    setStatoFilter('');
    setSpecieFilter('');
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
            className={`stat-card ${!statoFilter ? 'stat-active' : ''}`}
            onClick={() => setStatoFilter('')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-number stat-primary">{stats.totalCount ?? 0}</div>
            <div className="stat-label">Totale Animali</div>
          </div>
          <div
            className={`stat-card ${statoFilter === 'SANO' ? 'stat-active' : ''}`}
            onClick={() => handleStatoCardFilter('SANO')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-number stat-success">{stats.sanoCount ?? 0}</div>
            <div className="stat-label">Sani</div>
          </div>
          <div
            className={`stat-card ${statoFilter === 'MALATO' ? 'stat-active' : ''}`}
            onClick={() => handleStatoCardFilter('MALATO')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-number stat-warning">{stats.malatoCount ?? 0}</div>
            <div className="stat-label">Malati</div>
          </div>
          <div
            className={`stat-card ${statoFilter === 'DECEDUTO' ? 'stat-active' : ''}`}
            onClick={() => handleStatoCardFilter('DECEDUTO')}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-number stat-danger">{stats.decedutoCount ?? 0}</div>
            <div className="stat-label">Deceduti</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-info">{stats.caneCount ?? 0}</div>
            <div className="stat-label">Cani</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-info">{stats.gattoCount ?? 0}</div>
            <div className="stat-label">Gatti</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-info">{stats.altroCount ?? 0}</div>
            <div className="stat-label">Altri</div>
          </div>
        </>
      ) : null}
    </>
  );

  const emptyMessage = search.appliedSearchTerm || specieFilter || statoFilter
    ? 'Prova a modificare i filtri.'
    : 'Inizia aggiungendo il primo animale.';

  const navigate = useNavigate();

  const handleRowClick = (animale) => {
    navigate(`/animali/${animale.id}`);
  };

  const handleEditAnimale = (animale) => {
    loadFullAnimaleData(animale.id,
      (fullAnimaleData) => {
        setEditingAnimale(fullAnimaleData);
        setShowEditModal(true);
      },
      (error) => {
        console.error('Failed to load full animale data:', error);
        setEditingAnimale(animale);
        setShowEditModal(true);
      }
    );
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await patch(`/api/animali/${id}`, { stato: newStatus });
      if (!response.ok) {
        throw new Error(`Errore nell'aggiornamento dello stato: ${response.status}`);
      }
      setStatsRefreshIndex(prev => prev + 1);
      refetch();
    } catch (err) {
      console.error('Failed to update animale status:', err);
    }
  };

  const additionalContent = (
    <>
      {showCreateModal && (
        <AnimaleCreate
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setStatsRefreshIndex(prev => prev + 1);
            search.clearSearch();
            setSpecieFilter('');
            setStatoFilter('');
            table.setPage(0);
            refetch();
            setShowCreateModal(false);
          }}
        />
      )}
      {showEditModal && editingAnimale && (
        <AnimaleCreate
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setStatsRefreshIndex(prev => prev + 1);
            search.clearSearch();
            setSpecieFilter('');
            setStatoFilter('');
            table.setPage(0);
            refetch();
            setShowEditModal(false);
            setEditingAnimale(null);
          }}
          animale={editingAnimale}
          isEditMode={true}
        />
      )}
    </>
  );

  return (
    <ListPageTemplate
      title="Elenco Animali"
      subtitle="Gestisci i tuoi animali"
      data={animali}
      columns={customColumns}
      loading={loading}
      error={error}
      tableControls={{ ...table, totalPages, totalCount }}
      searchControls={search}
      filterOptions={filterOptions}
      activeFilter={specieFilter}
      onFilterSelect={setSpecieFilter}
      emptyMessage={emptyMessage}
      emptyIcon={emptyIcon}
      onAddClick={() => setShowCreateModal(true)}
      addIcon={<PlusIcon width={16} height={16} />}
      additionalContent={additionalContent}
      onRowClick={handleRowClick}
      statsContent={statsContent}
      onClearAllFilters={handleClearAllFilters}
    />
  );
}

export default AnimaliLista;