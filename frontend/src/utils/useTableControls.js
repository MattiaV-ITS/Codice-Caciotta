/**
 * @file UseTableControls.js
 * @description Custom hook for managing table controls (sorting, pagination, etc.)
 */

import { useState } from 'react';

/**
 * Custom hook for managing table controls (sorting, pagination, etc.)
 * @param {Object} options - Configuration options
 * @param {string} options.defaultSortBy - Default column to sort by
 * @param {string} options.defaultSortDir - Default sort direction ('asc' or 'desc')
 * @param {number} options.defaultPageSize - Default page size
 * @returns {Object} Table control functions and state
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
   * Handle sorting for a column
   * @param {string} columnName - Column to sort by
   */
  const handleSort = (columnName) => {
    if (sortBy === columnName) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnName);
      setSortDir('asc');
    }
    setPage(0); // Reset to first page when sorting changes
  };

  /**
   * Handle page size change
   * @param {number} newSize - New page size
   */
  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0); // Reset to first page when size changes
  };

  /**
   * Get sort indicator for a column
   * @param {string} columnName - Column to check
   * @returns {string|null} Sort indicator (↑/↓) or null
   */
  const getSortIndicator = (columnName) => {
    if (sortBy !== columnName) return null;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  /**
   * Go to previous page
   */
  const goToPreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  /**
   * Go to next page
   * @param {number} totalPages - Total number of pages
   */
  const goToNextPage = (totalPages) => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return {
    sortBy,
    sortDir,
    page,
    size,
    setPage, // Export setPage for external use if needed
    handleSort,
    handleSizeChange,
    getSortIndicator,
    goToPreviousPage,
    goToNextPage
  };
};