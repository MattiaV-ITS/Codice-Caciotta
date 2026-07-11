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
      <table className="table-custom lista-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.field || column.header}
                onClick={() => column.sortable && onSort(column.sortField || column.field || column.header)}
                style={{ cursor: column.sortable ? 'pointer' : 'default', ...column.style }}
              >
                {column.header} {column.sortable && <span className="sort-indicator">{getSortIndicator(column.sortField || column.field || column.header)}</span>}
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

export default ListaTable;