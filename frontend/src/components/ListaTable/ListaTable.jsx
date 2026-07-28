import React from 'react';
import './ListaTable.css';
import { formatDate } from '../../utils/dateUtils';

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
  emptyIcon = 'ðŸ”',
  onRowClick // â† AGGIUNTA: callback per clic sulla riga
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
            {columns.map((column) => {
              return (
                <th
                  key={column.accessor || column.field || column.header}
                  onClick={() => column.sortable && onSort && onSort(column.sortField || column.sortBy || column.accessor || column.field || column.header || '')}
                  style={{ cursor: column.sortable ? 'pointer' : 'default', ...column.style }}
                >
                {column.Header || column.header} {column.sortable && getSortIndicator && <span className="sort-indicator">{getSortIndicator(column.sortField || column.sortBy || column.accessor || column.field || column.header || '')}</span>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={item.id || index}
              onClick={() => onRowClick && onRowClick(item)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              className={onRowClick ? 'clickable-row' : ''}
            >
              {columns.map((column) => {
                const dataKey = column.accessor || column.field;
                const cellValue = item[dataKey];

                if (column.Cell) {
                  try {
                    return <td key={`${dataKey}-${index}`} style={column.style}>{column.Cell({ value: cellValue })}</td>;
                  } catch (error) {
                    logger.error(`Error in Cell renderer for column ${column.Header || column.header}:`, error);
                    return <td key={`${dataKey}-${index}`} style={column.style}>Error</td>;
                  }
                } else if (column.render) {
                  try {
                    return <td key={`${dataKey}-${index}`} style={column.style}>{column.render(item)}</td>;
                  } catch (error) {
                    logger.error(`Error in render function for column ${column.Header || column.header}:`, error);
                    return <td key={`${dataKey}-${index}`} style={column.style}>Error</td>;
                  }
                } else if (column.type === 'date') {
                  return <td key={`${dataKey}-${index}`} style={column.style}>{formatDate(cellValue)}</td>;
                } else {
                  return <td key={`${dataKey}-${index}`} style={column.style}>{cellValue}</td>;
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaTable;
