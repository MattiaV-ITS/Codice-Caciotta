/**
 * Simple utility for loading full data without creating circular dependencies
 */

/**
 * Load full animale data
 * @param {number} animaleId - The animale ID
 * @param {function} onSuccess - Callback with full animale data
 * @param {function} onError - Callback for errors
 */
export function loadFullAnimaleData(animaleId, onSuccess, onError) {
  const token = localStorage.getItem('jwtToken');
  
  fetch(`/api/animali/${animaleId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to fetch full animale data');
  })
  .then(data => onSuccess(data))
  .catch(error => {
    logger.error('Error loading full animale data:', error);
    if (onError) onError(error);
  });
}

/**
 * Load full proprietario data
 * @param {number} proprietarioId - The proprietario ID
 * @param {function} onSuccess - Callback with full proprietario data
 * @param {function} onError - Callback for errors
 */
export function loadFullProprietarioData(proprietarioId, onSuccess, onError) {
  const token = localStorage.getItem('jwtToken');
  
  fetch(`/api/proprietari/${proprietarioId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to fetch full proprietario data');
  })
  .then(data => onSuccess(data))
  .catch(error => {
    logger.error('Error loading full proprietario data:', error);
    if (onError) onError(error);
  });
}
