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

function ProprietariLista() {
  const table = useTableControls({
    defaultSortBy: 'cognome',
    defaultSortDir: 'asc',
    defaultPageSize: 10
  });

  const search = useSearchControls();
  const [statoFiltro, setStatoFiltro] = useState('');

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => ({
    search: search.appliedSearchTerm,
    stato: statoFiltro
  }), [search.appliedSearchTerm, statoFiltro]);

  const { data: proprietari, loading, error, totalPages, totalCount } =
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
    { header: 'CITTÀ', field: 'citta', sortable: true },
    { header: 'DATA REGISTRAZIONE', field: 'dataRegistrazione', type: 'date', sortable: true },
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
    }
  ];

  if (loading) return <LoadingSpinner label="Caricamento proprietari..." />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Elenco Proprietari</h2>
          <p className="page-subtitle">Gestisci i tuoi clienti</p>
        </div>
        <button className="btn-add">+ Nuovo Proprietario</button>
      </div>

      <FilterBar
        label="Stato"
        options={statoOptions}
        active={statoFiltro}
        onSelect={(v) => {
          setStatoFiltro(v);
          search.clearSearch();
          table.setPage(0);
        }}
      />

      <div className="toolbar-actions">
        <SearchBox
          searchTerm={search.searchTerm}
          setSearchTerm={search.setSearchTerm}
          onEnter={() => {
            search.applySearch();
            table.setPage(0);
          }}
        />

        <button className="btn-clear-filters" onClick={() => {
          search.clearSearch();
          setStatoFiltro('');
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
        data={proprietari}
        columns={customColumns}
        sortBy={table.sortBy}
        sortDir={table.sortDir}
        onSort={table.handleSort}
        getSortIndicator={table.getSortIndicator}
        emptyMessage={search.appliedSearchTerm || statoFiltro ? 'Prova a modificare i filtri.' : 'Inizia aggiungendo il tuo primo proprietario.'}
        emptyIcon="👤"
      />

      {proprietari.length > 0 && (
        <PaginationFooter
          page={table.page}
          totalPages={totalPages}
          totalCount={totalCount}
          length={proprietari.length}
          goToPreviousPage={table.goToPreviousPage}
          goToNextPage={table.goToNextPage}
        />
      )}
    </div>
  );
}

export default ProprietariLista;
