import { useAuth } from '../context/AuthContext';
import { useCallback } from 'react';

/**
 * Hook personalizzata per effettuare chiamate API autenticate
 * @returns {Object} Oggetto con metodi per effettuare richieste autenticate
 */
export function useApi() {
  const { token } = useAuth();

  /**
   * Ottiene gli header per le richieste autenticate
   * @returns {Object} Oggetto headers con Authorization se il token esiste
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
   * Effettua una richiesta GET autenticata
   * @param {string} url - L'URL da richiedere
   * @param {Object} [options] - Opzioni aggiuntive per fetch
   * @returns {Promise<Response>} Risposta fetch
   */
  const get = useCallback((url, options = {}) => {
    return fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      ...options,
    });
  }, [getAuthHeaders]);

  /**
   * Effettua una richiesta POST autenticata
   * @param {string} url - L'URL da richiedere
   * @param {Object} body - Il corpo della richiesta
   * @param {Object} [options] - Opzioni aggiuntive per fetch
   * @returns {Promise<Response>} Risposta fetch
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
   * Effettua una richiesta PUT autenticata
   * @param {string} url - L'URL da richiedere
   * @param {Object} body - Il corpo della richiesta
   * @param {Object} [options] - Opzioni aggiuntive per fetch
   * @returns {Promise<Response>} Risposta fetch
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
   * Effettua una richiesta PATCH autenticata
   * @param {string} url - L'URL da richiedere
   * @param {Object} body - Il corpo della richiesta
   * @param {Object} [options] - Opzioni aggiuntive per fetch
   * @returns {Promise<Response>} Risposta fetch
   */
  const patch = useCallback((url, body, options = {}) => {
    return fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      ...options,
    });
  }, [getAuthHeaders]);

  /**
   * Effettua una richiesta DELETE autenticata
   * @param {string} url - L'URL da richiedere
   * @param {Object} [options] - Opzioni aggiuntive per fetch
   * @returns {Promise<Response>} Risposta fetch
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
    patch,
    remove,
    getAuthHeaders,
  };
};

/**
 * Servizio API unificato per i componenti lista
 * Fornisce supporto coerente per paginazione, ordinamento e filtraggio
 */
export const useListaApi = (endpoint) => {
  const { get } = useApi();
  
  /**
   * Recupera dati paginati con ordinamento e filtraggio
   * @param {number} page - Pagina corrente
   * @param {number} size - Dimensione della pagina
   * @param {string} sortBy - Campo per l'ordinamento
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
      
      // Aggiungi filtri aggiuntivi ai parametri della query
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
 * Mappatura dello stato condivisa per una visualizzazione coerente dei badge
 * @param {string} status - Valore dello stato
 * @param {Object} statusMap - Mappatura dei valori di stato alle informazioni di visualizzazione
 * @returns {Object} - { label: string, className: string }
 */
export const getStatusInfo = (status, statusMap) => {
  if (!status) return { label: 'Sconosciuto', className: 'badge-sconosciuto' };
  
  const normalizedStatus = String(status).toUpperCase();
  return statusMap[normalizedStatus] || { label: 'Sconosciuto', className: 'badge-sconosciuto' };
};

/**
 * Utility condivisa per l'applicazione dei filtri
 * @param {Array} data - Array di elementi
 * @param {string} searchTerm - Termine da cercare
 * @param {Array} searchFields - Campi in cui cercare
 * @returns {Array} - Array filtrato
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
 * Utility condivisa per l'applicazione dei filtri di stato
 * @param {Array} data - Array di elementi
 * @param {string} statusFilter - Stato da filtrare
 * @param {string} statusField - Campo contenente lo stato
 * @returns {Array} - Array filtrato
 */
export const applyStatusFilter = (data, statusFilter, statusField) => {
  if (!statusFilter || !data || data.length === 0) {
    return data;
  }
  
  return data.filter(item => item[statusField] === statusFilter);
};

/**
 * Utility condivisa per la combinazione dei filtri
 * @param {Array} data - Dati originali
 * @param {string} searchTerm - Termine di ricerca
 * @param {string} statusFilter - Filtro di stato
 * @param {Object} statusMap - Mappatura dei valori di stato
 * @param {Array} searchFields - Campi in cui cercare
 * @param {string} statusField - Campo contenente lo stato
 * @returns {Array} - Array filtrato
 */
export const applyCombinedFilters = (data, searchTerm, statusFilter, statusMap, searchFields, statusField) => {
  let filteredData = [...data];
  
  // Applica prima il filtro di ricerca
  if (searchTerm) {
    filteredData = applySearchFilter(filteredData, searchTerm, searchFields);
  }
  
  // Applica poi il filtro di stato
  if (statusFilter) {
    // Gestisci la mappatura dello stato se necessario
    const backendStatus = statusMap?.[statusFilter] || statusFilter;
    filteredData = applyStatusFilter(filteredData, backendStatus, statusField);
  }
  
  return filteredData;
};