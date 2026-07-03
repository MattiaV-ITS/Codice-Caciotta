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
}