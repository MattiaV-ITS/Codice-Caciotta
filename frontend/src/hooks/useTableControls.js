/**
 * @file UseTableControls.js
 * @description Hook personalizzato per gestire i controlli della tabella (ordinamento, paginazione, ecc.)
 */

import { useState } from 'react';

/**
 * Hook personalizzato per gestire i controlli della tabella (ordinamento, paginazione, ecc.)
 * @param {Object} options - Opzioni di configurazione
 * @param {string} options.defaultSortBy - Colonna di default per l'ordinamento
 * @param {string} options.defaultSortDir - Direzione di ordinamento di default ('asc' o 'desc')
 * @param {number} options.defaultPageSize - Dimensione della pagina di default
 * @returns {Object} Funzioni e stato dei controlli della tabella
 */
export const useTableControls = ({ 
  defaultSortBy = 'id', 
  defaultSortDir = 'asc', 
  defaultPageSize = 10 
}) => {
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(defaultPageSize);

  /**
   * Gestisce l'ordinamento per una colonna
   * @param {string} columnName - Colonna da ordinare
   */
  const handleSort = (columnName) => {
    if (sortBy === columnName) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnName);
      setSortDir('asc');
    }
    setPage(0); // Reset alla prima pagina quando cambia l'ordinamento
  };

  /**
   * Gestisce il cambiamento della dimensione della pagina
   * @param {number} newSize - Nuova dimensione della pagina
   */
  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0); // Reset alla prima pagina quando cambia la dimensione della pagina
  };

  /**
   * Ottiene l'indicatore di ordinamento per una colonna
   * @param {string} columnName - Colonna da controllare
   * @returns {string|null} Indicatore di ordinamento (↑/↓) o null
   */
  const getSortIndicator = (columnName) => {
    if (sortBy !== columnName) return null;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  /**
   * Vai alla pagina precedente
   */
  const goToPreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  /**
   * Vai alla pagina successiva
   * @param {number} totalPages - Numero totale di pagine
   */
  const goToNextPage = (totalPages) => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return {
    sortBy,
    sortDir,
    page,
    size,
    setPage, // Esporta setPage per uso esterno se necessario
    handleSort,
    handleSizeChange,
    getSortIndicator,
    goToPreviousPage,
    goToNextPage
  };
};