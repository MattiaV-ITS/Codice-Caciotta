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

function VaccinazioniLista() {
  const table = useTableControls({
    defaultSortBy: 'dataScadenza',
    defaultSortDir: 'asc',
    defaultPageSize: 15
  });

  const search = useSearchControls();
  const [statoFilter, setStatoFilter] = useState('');

  // Memoizza i filtri per evitare ricalcoli inutili e garantire stabilità dei riferimenti
  const memoizedFilters = useMemo(() => ({
    search: search.appliedSearchTerm,
    stato: statoFilter
  }), [search.appliedSearchTerm, statoFilter]);

  const { data: vaccinazioni, loading, error, totalPages, totalCount } =
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
    }
  ];

  if (loading) return <LoadingSpinner label="Caricamento vaccinazioni..." />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Elenco Vaccinazioni</h2>
          <p className="page-subtitle">Gestisci le vaccinazioni dei pazienti</p>
        </div>
        <button className="btn-add">+ Nuova Vaccinazione</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number stat-primary">{vaccinazioni.length}</div>
          <div className="stat-label">Totale Vaccinazioni</div>
        </div>
        <div className="stat-card">
          <div className="stat-number stat-success">
            {vaccinazioni.filter(v => v.statoVaccinazione === 'VALIDO').length}
          </div>
          <div className="stat-label">Valide</div>
        </div>
        <div className="stat-card">
          <div className="stat-number stat-warning">
            {vaccinazioni.filter(v => v.statoVaccinazione === 'PROSSIMO').length}
          </div>
          <div className="stat-label">In Scadenza</div>
        </div>
        <div className="stat-card">
          <div className="stat-number stat-danger">
            {vaccinazioni.filter(v => v.statoVaccinazione === 'SCADUTO').length}
          </div>
          <div className="stat-label">Scadute</div>
        </div>
      </div>

      <FilterBar
        label="Stato"
        options={statoOptions}
        active={statoFilter}
        onSelect={(v) => {
          setStatoFilter(v);
          search.clearSearch();
          table.setPage(0);
        }}
      />

      <div className="toolbar-actions">
        <SearchBox
          searchTerm={search.searchTerm}
          setSearchTerm={search.setSearchTerm}
          searchable="tipo, lotto, nome Animale"
          onEnter={() => {
            search.applySearch();
            table.setPage(0);
          }}
        />

        <button
          className="btn-clear-filters"
          onClick={() => {
            search.clearSearch();
            setStatoFilter('');
            table.setPage(0);
          }}
        >
          Cancella Filtri
        </button>

        <div className="page-size-selector">
          <span className="page-size-label">Righe:</span>
          <select
            className="page-size-select"
            value={table.size}
            onChange={(e) => table.handleSizeChange(Number(e.target.value))}
          >
            {[5, 10, 15, 20].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <ListaTable
        data={vaccinazioni}
        columns={customColumns}
        sortBy={table.sortBy}
        sortDir={table.sortDir}
        onSort={table.handleSort}
        getSortIndicator={table.getSortIndicator}
        emptyMessage={
          search.appliedSearchTerm || statoFilter
            ? 'Prova a modificare i filtri di ricerca.'
            : 'Inizia aggiungendo la prima vaccinazione.'
        }
        emptyIcon="💉"
      />

      {vaccinazioni.length > 0 && (
        <PaginationFooter
          page={table.page}
          totalPages={totalPages}
          totalCount={totalCount}
          length={vaccinazioni.length}
          goToPreviousPage={table.goToPreviousPage}
          goToNextPage={table.goToNextPage}
        />
      )}
    </div>
  );
}

export default VaccinazioniLista;
