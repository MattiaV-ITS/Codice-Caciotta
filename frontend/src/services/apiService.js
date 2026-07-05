import { useAuth } from '../context/AuthContext';
import { useCallback } from 'react';

/**
 * Custom hook for making authenticated API calls
 * @returns {Object} Object with methods for making authenticated requests
 */
export function useApi() {
  const { token } = useAuth();

  /**
   * Get headers for authenticated requests
   * @returns {Object} Headers object with Authorization if token exists
   */
  const getAuthHeaders = useCallback(() => {
    if (!token) {
      return {
        'Content-Type': 'application/json',
      };
    }

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, [token]);

  /**
   * Make an authenticated GET request
   * @param {string} url - The URL to fetch
   * @param {Object} [options] - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  const get = useCallback((url, options = {}) => {
    return fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      ...options,
    });
  }, [getAuthHeaders]);

  /**
   * Make an authenticated POST request
   * @param {string} url - The URL to fetch
   * @param {Object} body - The request body
   * @param {Object} [options] - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  const post = useCallback((url, body, options = {}) => {
    return fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      ...options,
    });
  }, [getAuthHeaders]);

  /**
   * Make an authenticated PUT request
   * @param {string} url - The URL to fetch
   * @param {Object} body - The request body
   * @param {Object} [options] - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  const put = useCallback((url, body, options = {}) => {
    return fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      ...options,
    });
  }, [getAuthHeaders]);

  /**
   * Make an authenticated DELETE request
   * @param {string} url - The URL to fetch
   * @param {Object} [options] - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  const remove = useCallback((url, options = {}) => {
    return fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      ...options,
    });
  }, [getAuthHeaders]);

  return {
    get,
    post,
    put,
    remove,
    getAuthHeaders,
  };
};

/**
 * Unified API service for lista components
 * Provides consistent pagination, sorting, and filtering support
 */
export const useListaApi = (endpoint) => {
  const { get } = useApi();
  
  /**
   * Fetch paginated data with sorting and filtering
   * @param {number} page - Current page
   * @param {number} size - Page size
   * @param {string} sortBy - Field to sort by
   * @param {string} sortDir - Sort direction ('asc' or 'desc')
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters (e.g., { specie: 'cane' })
   * @returns {Promise<{ content: Array, totalElements: number, totalPages: number, number: number }>}
   */
  const fetchPaginatedData = async (page, size, sortBy, sortDir, searchTerm, filters = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', size);
      params.append('sortBy', sortBy);
      params.append('sortDir', sortDir);
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      // Add additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await get(`${endpoint}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        content: data.content || [],
        totalElements: data.totalElements || data.content.length,
        totalPages: data.totalPages || 1,
        number: data.number || 0
      };
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  };
  
  return { fetchPaginatedData };
};

/**
 * Shared status mapping for consistent badge display
 * @param {string} status - Status value
 * @param {Object} statusMap - Mapping of status values to display info
 * @returns {Object} - { label: string, className: string }
 */
export const getStatusInfo = (status, statusMap) => {
  if (!status) return { label: 'Sconosciuto', className: 'badge-sconosciuto' };
  
  const normalizedStatus = String(status).toUpperCase();
  return statusMap[normalizedStatus] || { label: 'Sconosciuto', className: 'badge-sconosciuto' };
};

/**
 * Shared utility for applying filters
 * @param {Array} data - Array of items
 * @param {string} searchTerm - Term to search for
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} - Filtered array
 */
export const applySearchFilter = (data, searchTerm, searchFields) => {
  if (!searchTerm || !data || data.length === 0) {
    return data;
  }
  
  const searchLower = searchTerm.toLowerCase();
  return data.filter(item => 
    searchFields.some(field => 
      item[field] && String(item[field]).toLowerCase().includes(searchLower)
    )
  );
};

/**
 * Shared utility for applying status filters
 * @param {Array} data - Array of items
 * @param {string} statusFilter - Status to filter by
 * @param {string} statusField - Field containing status
 * @returns {Array} - Filtered array
 */
export const applyStatusFilter = (data, statusFilter, statusField) => {
  if (!statusFilter || !data || data.length === 0) {
    return data;
  }
  
  return data.filter(item => item[statusField] === statusFilter);
};

/**
 * Shared utility for combining filters
 * @param {Array} data - Original data
 * @param {string} searchTerm - Search term
 * @param {string} statusFilter - Status filter
 * @param {Object} statusMap - Status mapping
 * @param {Array} searchFields - Fields to search in
 * @param {string} statusField - Field containing status
 * @returns {Array} - Filtered data
 */
export const applyCombinedFilters = (data, searchTerm, statusFilter, statusMap, searchFields, statusField) => {
  let filteredData = [...data];
  
  // Apply search filter first
  if (searchTerm) {
    filteredData = applySearchFilter(filteredData, searchTerm, searchFields);
  }
  
  // Then apply status filter
  if (statusFilter) {
    // Handle status mapping if needed
    const backendStatus = statusMap?.[statusFilter] || statusFilter;
    filteredData = applyStatusFilter(filteredData, backendStatus, statusField);
  }
  
  return filteredData;
};