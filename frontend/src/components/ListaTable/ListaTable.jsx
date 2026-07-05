import React from 'react';
import { formatDate } from '../../utils';
import './ListaTable.css';

/**
 * Componente tabella unificato per le viste lista
 * Gestisce paginazione, ordinamento e stile consistente
 */
const ListaTable = ({ 
  data, 
  columns, 
  sortBy, 
  sortDir, 
  onSort, 
  getSortIndicator, 
  loading, 
  error, 
  emptyMessage, 
  emptyIcon = '🔍',
  onRowClick // ← AGGIUNTA: callback per clic sulla riga
}) => {
  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner-custom"></div>
        <span>Caricamento...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="form-error">Errore: {error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">{emptyIcon}</div>
        <div className="empty-title">Nessun elemento trovato</div>
        <p className="empty-description">
          {emptyMessage || 'Prova a modificare i filtri di ricerca.'}
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table-custom">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.field || column.header}
                onClick={() => column.sortable && onSort(column.field || column.header)}
                style={{ cursor: column.sortable ? 'pointer' : 'default', ...column.style }}
              >
                {column.header} {column.sortable && <span className="sort-indicator">{getSortIndicator(column.field || column.header)}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={item.id || index}
              onClick={() => onRowClick && onRowClick(item)} // ← AGGIUNTA
              style={{ cursor: onRowClick ? 'pointer' : 'default' }} // ← AGGIUNTA
              className={onRowClick ? 'clickable-row' : ''} // ← AGGIUNTA (se hai la classe CSS)
            >
              {columns.map((column) => (
                <td key={`${column.field}-${index}`} style={column.style}>
                  {column.render ? column.render(item) : (
                    column.type === 'date' ? formatDate(item[column.field]) : item[column.field]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Definizioni standard delle colonne per diversi tipi di entità
 */
export const listaColumnDefinitions = {
  animali: [
    { header: 'NOME', field: 'nome', sortable: true },
    { header: 'SPECIE', field: 'specie', sortable: true },
    { header: 'RAZZA', field: 'razza', sortable: true },
    { header: 'DATA NASCITA', field: 'dataNascita', type: 'date', sortable: true },
    { header: 'MICROCHIP', field: 'microchip', sortable: true },
    { header: 'PROPRIETARIO', field: 'proprietario', sortable: false },
    { header: 'STATO', field: 'stato', sortable: false, style: { textAlign: 'center' } }
  ],
  proprietari: [
    { header: 'NOME', field: 'nome', sortable: true },
    { header: 'COGNOME', field: 'cognome', sortable: true },
    { header: 'TELEFONO', field: 'telefono', sortable: true },
    { header: 'EMAIL', field: 'email', sortable: true },
    { header: 'CITTÀ', field: 'citta', sortable: true },
    { header: 'DATA REGISTRAZIONE', field: 'dataRegistrazione', type: 'date', sortable: true },
    { header: 'STATO', field: 'stato', sortable: false, style: { textAlign: 'center' } }
  ],
  vaccinazioni: [
    { header: 'TIPO VACCINO', field: 'tipoVaccino', sortable: true },
    { header: 'ANIMALE', field: 'nomeAnimale', sortable: false },
    { header: 'DATA SOMMINISTRAZIONE', field: 'dataSomministrazione', type: 'date', sortable: true },
    { header: 'LOTTO', field: 'lotto', sortable: true },
    { header: 'DATA SCADENZA', field: 'dataScadenza', type: 'date', sortable: true },
    { header: 'STATO', field: 'statoVaccinazione', sortable: false, style: { textAlign: 'center' } }
  ]
};

export default ListaTable;