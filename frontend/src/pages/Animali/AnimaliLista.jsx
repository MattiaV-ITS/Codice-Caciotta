import React, { useState, useMemo } from 'react';
import AnimaleCreate from './AnimaleCreate';
import ListPageTemplate from '../../components/ListPageTemplate/ListPageTemplate';
import { useParams, useNavigate } from 'react-router-dom';
import { GearMenu } from '../../components/ContextMenu/ContextMenu';
import { loadFullAnimaleData } from '../../utils/dataLoader';

import { useTableControls } from '../../hooks/useTableControls';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import { useSearchControls } from '../../hooks/useSearchControls';
import { getIconLetter } from "../../utils";
import { PawIcon, PlusIcon } from '../../components/icons';


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
            }
          ]}
        />
      )
    }
  ];

  const emptyIcon = (
    <PawIcon width="48" height="48" style={{ color: 'var(--gray-400)', opacity: 0.5 }} />
  );

  const emptyMessage = search.appliedSearchTerm || specieFilter 
    ? 'Prova a modificare i filtri.' 
    : 'Inizia aggiungendo il primo animale.';

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
      addIcon={<PlusIcon width={16} height={16} />}
      additionalContent={additionalContent}
      onRowClick={handleRowClick}
    />
  );
}

export default AnimaliLista;