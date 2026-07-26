import React from 'react';
import ListaTable from '../ListaTable/ListaTable';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import PaginationFooter from '../common/PaginationFooter';
import SearchBox from '../common/SearchBox';
import FilterBar from '../common/FilterBar';
import { PlusIcon } from '../icons';

function getSingularForm(word) {
  // Handle specific Italian plural to singular conversions
  const singularMap = {
    'Animali': 'animale',
    'Proprietari': 'proprietario',
    'Animali': 'animale',
    'Visite': 'visita',
    'Prenotazioni': 'prenotazione',
    'Vaccinazioni': 'vaccinazione'
  };
  
  return singularMap[word] || word.toLowerCase();
}

function ListPageTemplate({
  title,
  subtitle,
  data,
  columns,
  loading,
  error,
  tableControls,
  searchControls,
  filterOptions,
  activeFilter,
  onFilterSelect,
  emptyMessage,
  emptyIcon,
  showAddButton = true,
  onAddClick,
  onRowClick,
  additionalToolbarContent = null,
  additionalContent = null,
  statsContent = null
}) {
  if (loading) return <LoadingSpinner label={`Caricamento ${title.toLowerCase()}...`} />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>{title}</h2>
          <p className="page-subtitle">{subtitle}</p>
        </div>
          {showAddButton && (
            <button className="btn-add" onClick={onAddClick}>
              <PlusIcon width={16} height={16} stroke="currentColor" />
              Nuovo {getSingularForm(title.split(' ')[1] || 'Elemento')}
            </button>
          )}
      </div>

      {statsContent && (
        <div className="stats-grid">
          {statsContent}
        </div>
      )}

      {filterOptions && (
        <FilterBar
          label={filterOptions.label}
          options={filterOptions.options}
          active={activeFilter}
          onSelect={(v) => {
            onFilterSelect(v);
            searchControls.clearSearch();
            tableControls.setPage(0);
          }}
        />
      )}

      <div className="toolbar-actions">
        <SearchBox
          searchTerm={searchControls.searchTerm}
          setSearchTerm={searchControls.setSearchTerm}
          searchable={filterOptions?.searchable || "nome, cognome, o altri campi"}
          onEnter={() => {
            searchControls.applySearch();
            tableControls.setPage(0);
          }}
        />

        <button className="btn-clear-filters" onClick={() => {
          searchControls.clearSearch();
          if (onFilterSelect) onFilterSelect('');
          tableControls.setPage(0);
        }}>
          Cancella Filtri
        </button>

        <div className="page-size-selector">
          <span className="page-size-label">Righe:</span>
          <select
            className="page-size-select"
            value={tableControls.size}
            onChange={(e) => tableControls.handleSizeChange(Number(e.target.value))}
          >
            {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {additionalToolbarContent}
      </div>

      <ListaTable
        data={data}
        columns={columns}
        sortBy={tableControls.sortBy}
        sortDir={tableControls.sortDir}
        onSort={tableControls.handleSort}
        getSortIndicator={tableControls.getSortIndicator}
        emptyMessage={emptyMessage}
        emptyIcon={emptyIcon}
        onRowClick={onRowClick}
      />

      {data.length > 0 && (
        <PaginationFooter
          page={tableControls.page}
          totalPages={tableControls.totalPages}
          totalCount={tableControls.totalCount}
          length={data.length}
          goToPreviousPage={tableControls.goToPreviousPage}
          goToNextPage={tableControls.goToNextPage}
        />
      )}

      {additionalContent}
    </div>
  );
}

export default ListPageTemplate;