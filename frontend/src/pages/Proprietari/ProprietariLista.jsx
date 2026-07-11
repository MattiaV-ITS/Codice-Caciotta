import React, { useState, useMemo } from 'react';
import ProprietarioCreate from './ProprietarioCreate';
import ListPageTemplate from '../../components/ListPageTemplate/ListPageTemplate';

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
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Memoizza i filtri per evitare ricalcoli inutili e garantire stabilità dei riferimenti
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

  const filterOptions = {
    label: 'Stato',
    options: statoOptions,
    searchable: 'nome, cognome, telefono, email, codice fiscale o città'
  };

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
    { header: 'CODICE FISCALE', field: 'codiceFiscale', sortable: true },
    { header: 'DATA REGISTRAZIONE', field: 'dataRegistrazione', type: 'date', sortable: true },
    { header: 'NUMERO ANIMALI', field: 'numeroAnimali', sortable: true },
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

  const emptyIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const emptyMessage = search.appliedSearchTerm || statoFiltro 
    ? 'Prova a modificare i filtri.' 
    : 'Inizia aggiungendo primo proprietario.';

  const additionalContent = showCreateModal && (
    <ProprietarioCreate
      onClose={() => setShowCreateModal(false)}
      onSuccess={(newProprietario) => {
        // Ricarica i dati dopo la creazione
        // Questo triggererà un nuovo fetch dei dati
        table.setPage(0);
        search.clearSearch();
        setStatoFiltro('');
      }}
    />
  );

  return (
    <ListPageTemplate
      title="Elenco Proprietari"
      subtitle="Gestisci i tuoi clienti"
      data={proprietari}
      columns={customColumns}
      loading={loading}
      error={error}
      tableControls={{ ...table, totalPages, totalCount }}
      searchControls={search}
      filterOptions={filterOptions}
      activeFilter={statoFiltro}
      onFilterSelect={setStatoFiltro}
      emptyMessage={emptyMessage}
      emptyIcon={emptyIcon}
      onAddClick={() => setShowCreateModal(true)}
      additionalContent={additionalContent}
    />
  );
}

export default ProprietariLista;
