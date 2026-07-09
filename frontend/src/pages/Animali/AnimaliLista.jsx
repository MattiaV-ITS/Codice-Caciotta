import React, { useState, useMemo } from 'react';
import ListaTable from '../../components/ListaTable/ListaTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import PaginationFooter from '../../components/common/PaginationFooter';
import SearchBox from '../../components/common/SearchBox';
import FilterBar from '../../components/common/FilterBar';

import { useTableControls } from '../../hooks/useTableControls';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';
import { useSearchControls } from '../../hooks/useSearchControls';
import { getIconLetter } from "../../utils";


function AnimaliLista() {
  const table = useTableControls({
    defaultSortBy: 'id',
    defaultSortDir: 'desc',
    defaultPageSize: 15
  });

  const search = useSearchControls();
  const [specieFilter, setSpecieFilter] = useState('');

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
    }
  ];

  if (loading) return <LoadingSpinner label="Caricamento animali..." />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Elenco Pazienti</h2>
          <p className="page-subtitle">Gestisci i tuoi animali</p>
        </div>
        <button className="btn-add">+ Nuovo Animale</button>
      </div>

      <FilterBar
        label="Specie"
        options={specieOptions}
        active={specieFilter}
        onSelect={(v) => {
          setSpecieFilter(v);
          search.clearSearch();
          table.setPage(0);
        }}
      />

      <div className="toolbar-actions">
        <SearchBox
          searchTerm={search.searchTerm}
          setSearchTerm={search.setSearchTerm}
          searchable="nome, microchip, specie, o proprietario"
          onEnter={() => {
            search.applySearch();
            table.setPage(0);
          }}
        />

        <button className="btn-clear-filters" onClick={() => {
          search.clearSearch();
          setSpecieFilter('');
          table.setPage(0);
        }}>
          Cancella Filtri
        </button>

        <div className="page-size-selector">
          <span className="page-size-label">Righe:</span>
          <select
            className="page-size-select"
            value={table.size}
            onChange={(e) => table.handleSizeChange(Number(e.target.value))}
          >
            {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <ListaTable
        data={animali}
        columns={customColumns}
        sortBy={table.sortBy}
        sortDir={table.sortDir}
        onSort={table.handleSort}
        getSortIndicator={table.getSortIndicator}
        emptyMessage={search.appliedSearchTerm || specieFilter ? 'Prova a modificare i filtri.' : 'Inizia aggiungendo primo animale.'}
        emptyIcon={
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
        }
      />

      {animali.length > 0 && (
        <PaginationFooter
          page={table.page}
          totalPages={totalPages}
          totalCount={totalCount}
          length={animali.length}
          goToPreviousPage={table.goToPreviousPage}
          goToNextPage={table.goToNextPage}
        />
      )}
    </div>
  );
}

export default AnimaliLista;
