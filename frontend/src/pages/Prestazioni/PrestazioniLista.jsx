import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../services/apiService';
import ListaTable from '../../components/ListaTable/ListaTable';
import { useTableControls } from '../../hooks/useTableControls';
import { useSearchControls } from '../../hooks/useSearchControls';
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch';

function PrestazioniLista() {
  const { get } = useApi();
  const navigate = useNavigate();

  // Table controls
  const {
    page, size, sortBy, sortDir,
    setPage, handleSizeChange, handleSort
  } = useTableControls({
    defaultSortBy: 'nomePrestazione',
    defaultSortDir: 'asc',
    defaultPageSize: 10
  });

  // Search controls
  const {
    searchTerm, searchFields,
    handleSearchChange, handleSearchSubmit, handleSearchClear
  } = useSearchControls(['nomePrestazione', 'categoria', 'descrizione']);

  const memoizedFilters = useMemo(() => ({
    search: searchTerm
  }), [searchTerm]);

  // Fetch prestazioni data
  const { data, loading, error, totalElements, totalPages } = usePaginatedFetch(
    '/api/prestazioni',
    { page, size, sortBy, sortDir, filters: memoizedFilters }
  );

  const handleCreatePrestazione = () => {
    navigate('/prestazioni/create');
  };

  const handleEditPrestazione = (prestazioneId) => {
    navigate(`/prestazioni/edit/${prestazioneId}`);
  };

  const columns = [
    {
      Header: 'Nome Prestazione',
      accessor: 'nomePrestazione',
      sortable: true,
      width: '25%'
    },
    {
      Header: 'Categoria',
      accessor: 'categoria',
      sortable: true,
      width: '15%'
    },
    {
      Header: 'Descrizione',
      accessor: 'descrizione',
      sortable: false,
      width: '30%'
    },
    {
      Header: 'Durata (min)',
      accessor: 'durataStimata',
      sortable: true,
      width: '10%',
      Cell: ({ value }) => value + ' min'
    },
    {
      Header: 'Costo Base',
      accessor: 'costoBase',
      sortable: true,
      width: '10%',
      Cell: ({ value }) => {
        const numericValue = typeof value === 'string' ? parseFloat(value) : typeof value === 'object' ? parseFloat(value.amount || value.value) : value;
        return '€' + (isNaN(numericValue) ? '0.00' : numericValue.toFixed(2));
      }
    },
    {
      Header: 'Stato',
      accessor: 'stato',
      sortable: true,
      width: '10%'
    },
    {
      Header: 'Colore',
      accessor: 'colore',
      sortable: false,
      width: '10%',
      Cell: ({ value }) => (
        <div style={{
          width: '20px',
          height: '20px',
          backgroundColor: value || '#ccc',
          borderRadius: '50%',
          border: '1px solid #ddd'
        }} />
      )
    }
  ];

  return (
    <div className="lista-page">
      <div className="lista-header">
        <h2>Gestione Prestazioni</h2>
        <div className="lista-actions">
          <button
            onClick={handleCreatePrestazione}
            className="btn btn-primary"
          >
            + Nuova Prestazione
          </button>
        </div>
      </div>

      <div className="lista-controls">
        <div className="search-control">
          <input
            type="text"
            placeholder="Cerca prestazioni..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="form-control search-input"
          />
          <button onClick={handleSearchSubmit} className="btn btn-secondary">
            <i className="fas fa-search" />
          </button>
          {searchTerm && (
            <button onClick={handleSearchClear} className="btn btn-text">
              <i className="fas fa-times" />
            </button>
          )}
        </div>
      </div>

      <div className="lista-content">
        <ListaTable
          columns={columns}
          data={data}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
          onSizeChange={handleSizeChange}
          onSortChange={handleSort}
          onRowClick={handleEditPrestazione}
          emptyMessage="Nessuna prestazione trovata"
        />
      </div>
    </div>
  );
}

export default PrestazioniLista;