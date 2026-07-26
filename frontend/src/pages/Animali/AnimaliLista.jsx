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


function AnimaliLista() {
  const table = useTableControls({
    defaultSortBy: 'id',
    defaultSortDir: 'desc',
    defaultPageSize: 15
  });

  const search = useSearchControls();
  const [specieFilter, setSpecieFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnimale, setEditingAnimale] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const { get, patch } = useApi();

  // Memoizza i filtri per evitare ricalcoli inutili e garantire stabilità dei riferimenti
  const memoizedFilters = useMemo(() => ({
    search: search.appliedSearchTerm,
    specie: specieFilter
  }), [search.appliedSearchTerm, specieFilter]);

  const { data: animali, loading, error, totalPages, totalCount } =
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

  const customColumns = [
    {
      header: 'NOME ANIMALE',
      field: 'nome',
      sortable: true,
      render: (item) => {
        const isFemale = item.sesso?.toLowerCase() === 'f';
        const isMale = item.sesso?.toLowerCase() === 'm';

        const avatarClass = isFemale
          ? 'avatar-female'
          : isMale
          ? 'avatar-male'
          : 'avatar-default';

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
    { header: 'PROPRIETARIO', field: 'proprietario', sortable: false }, // TODO: Implementare sorting per proprietario non basta il true ma handling specifico
    { header: 'DATA DI NASCITA', field: 'dataNascita', type: 'date', sortable: true },
    { header: 'MICROCHIP', field: 'microchip', sortable: true },
    {
      header: 'STATO',
      field: 'stato',
      sortable: false,
      render: (item) => {
        const map = {
          SANO: { label: 'Sano', className: 'badge-sano' },
          MALATO: { label: 'Malato', className: 'badge-malato' },
          IN_CURA: { label: 'In cura', className: 'badge-in-cura' },
          DECEDUTO: { label: 'Deceduto', className: 'badge-deceduto' }
        };
        const status = map[item.stato] || { label: 'Sconosciuto', className: 'badge-sconosciuto' };
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="48" height="48">
      <g fill="var(--gray-400)" opacity="0.5">
        <ellipse cx="110" cy="235" rx="43" ry="58" transform="rotate(-30 110 235)" />
        <ellipse cx="195" cy="144" rx="43" ry="68" transform="rotate(-8 195 144)" />
        <ellipse cx="317" cy="144" rx="43" ry="68" transform="rotate(8 317 144)" />
        <ellipse cx="402" cy="235" rx="43" ry="58" transform="rotate(30 402 235)" />
        <path d="M 256, 240 
                C 214, 240 148, 275 128, 332 
                C 105, 396 150, 436 210, 436 
                C 230, 436 244, 424 256, 419
                C 268, 424 282, 436 302, 436 
                C 362, 436 407, 396 384, 332 
                C 364, 275 298, 240 256, 240 Z" />
        </g>
      </svg>
  );

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        console.log('Fetching animal stats...');
        const response = await get('/api/stats/animali');
        const data = await response.json();
        console.log('Animal stats received:', data);
        setStats(data || {});
        setStatsError(null);
      } catch (err) {
        console.error('Failed to fetch animal stats:', err);
        setStatsError(err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [get]);

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
            <div className="stat-number stat-primary">{stats?.totalCount ?? 0}</div>
            <div className="stat-label">Totale Animali</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-info">
              {stats.caneCount}
            </div>
            <div className="stat-label">Cani</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-info">
              {stats.gattoCount}
            </div>
            <div className="stat-label">Gatti</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-info">
              {stats.altroCount}
            </div>
            <div className="stat-label">Altri</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-success">
              {stats.sanoCount}
            </div>
            <div className="stat-label">Sani</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-warning">
              {stats.malatoCount}
            </div>
            <div className="stat-label">Malati</div>
          </div>
          <div className="stat-card">
            <div className="stat-number stat-danger">
              {stats.decedutoCount}
            </div>
            <div className="stat-label">Deceduti</div>
          </div>
        </>
      ) : null}
    </>
  );

  const emptyMessage = search.appliedSearchTerm || specieFilter
    ? 'Prova a modificare i filtri.'
    : 'Inizia aggiungendo primo animale.';

  const navigate = useNavigate();

  const handleRowClick = (animale) => {
    navigate(`/animali/${animale.id}`);
  };

  const handleEditAnimale = (animale) => {
    // Load full animale data before opening the edit modal
    loadFullAnimaleData(animale.id, 
      (fullAnimaleData) => {
        setEditingAnimale(fullAnimaleData);
        setShowEditModal(true);
      },
      (error) => {
        console.error('Failed to load full animale data, using partial data:', error);
        // Fallback to partial data if full data load fails
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
      // Refresh the list
      table.setPage(0);
    } catch (err) {
      console.error('Failed to update animale status:', err);
    }
  };

  const additionalContent = (
    <>
      {showCreateModal && (
        <AnimaleCreate
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newAnimale) => {
            // Refresh the list after successful creation
            search.clearSearch();
            setSpecieFilter('');
            table.setPage(0);
            setShowCreateModal(false);
          }}
        />
      )}
      {showEditModal && editingAnimale && (
        <AnimaleCreate
          onClose={() => setShowEditModal(false)}
          onSuccess={(updatedAnimale) => {
            // Refresh the list after successful update
            search.clearSearch();
            setSpecieFilter('');
            table.setPage(0);
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
      additionalContent={additionalContent}
      onRowClick={handleRowClick}
      statsContent={statsContent}
    />
  );
}

export default AnimaliLista;
