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
        emptyIcon={
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
        }
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
