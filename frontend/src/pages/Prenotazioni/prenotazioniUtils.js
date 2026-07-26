/**
 * Common utilities for Prenotazioni components
 * Shared functions and constants to keep Calendario and Programma consistent
 */

// Default legend items (used by both views when prestazioni data isn't loaded)
export const DEFAULT_LEGENDA = [];

// Single grey fallback color (used only when no database color is available)
export const FALLBACK_COLOR = '#6B7280';

/**
 * Get CSS class for evento based on motivo
 * @param {string} motivo - The appointment reason
 * @param {Array} prestazioni - Array of prestazioni from backend
 * @returns {string} CSS class name
 */
export function getPrestazioneClass(motivo, prestazioni) {
  // Try to find matching prestazione in database
  if (Array.isArray(prestazioni) && prestazioni.length > 0 && motivo) {
    const prestazione = prestazioni.find(p =>
      p.nomePrestazione === motivo ||
      (p.nomePrestazione && p.nomePrestazione.toLowerCase().includes(motivo.toLowerCase())) ||
      (motivo && motivo.toLowerCase().includes(p.nomePrestazione?.toLowerCase()))
    );

    // If found, use the nomePrestazione as CSS class
    if (prestazione && prestazione.nomePrestazione) {
      // Slugify nomePrestazione for CSS class
      return `tipo-${prestazione.nomePrestazione.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
    }
  }

  // Default fallback class
  return 'tipo-altro';
}

/**
 * Get color for evento based on motivo
 * @param {string} motivo - The appointment reason
 * @param {Array} prestazioni - Array of prestazioni from backend
 * @returns {string} Hex color code
 */
export function getPrestazioneColor(motivo, prestazioni) {
  // First try to find exact match in prestazioni from database
  if (Array.isArray(prestazioni) && prestazioni.length > 0 && motivo) {
    // Try exact match first
    let prestazione = prestazioni.find(p => p.nomePrestazione === motivo);

    // If no exact match, try case-insensitive partial matches
    if (!prestazione) {
      prestazione = prestazioni.find(p =>
        p.nomePrestazione && p.nomePrestazione.toLowerCase().includes(motivo.toLowerCase()) ||
        motivo && motivo.toLowerCase().includes(p.nomePrestazione?.toLowerCase())
      );
    }

    // If we found a matching prestazione with a color, use it
    if (prestazione && prestazione.colore) {
      return prestazione.colore;
    }
  }

  // Only use single grey fallback if no database color is available
  return FALLBACK_COLOR;
}

/**
 * Get duration in minutes for a prestazione based on motivo
 * @param {string} motivo - The appointment reason (tipoVisita)
 * @param {Array} prestazioni - Array of prestazioni from backend
 * @returns {number} Duration in minutes (default 30)
 */
export function getPrestazioneDuration(motivo, prestazioni) {
  if (Array.isArray(prestazioni) && prestazioni.length > 0 && motivo) {
    const prestazione = prestazioni.find(p =>
      p.nomePrestazione === motivo ||
      (p.nomePrestazione && p.nomePrestazione.toLowerCase().includes(motivo.toLowerCase())) ||
      (motivo && motivo.toLowerCase().includes(p.nomePrestazione?.toLowerCase()))
    );
    if (prestazione && prestazione.durataStimata && prestazione.durataStimata > 0) {
      return prestazione.durataStimata;
    }
  }
  return 30; // Durata predefinita di fallback
}

/**
 * Generate legend from prestazioni data
 * @param {Array} prestazioni - Array of prestazioni from backend
 * @returns {Array} Array of legend items with label and color
 */
export function getPrestazioneLegenda(prestazioni) {
  if (!Array.isArray(prestazioni) || prestazioni.length === 0) {
    return DEFAULT_LEGENDA;
  }

  return prestazioni
    .filter(p => p.colore) // Only show prestazioni with assigned colors
    .map(p => ({
      label: p.nomePrestazione,
      color: p.colore || FALLBACK_COLOR
    }))
    .slice(0, 5); // Show top 5 prestazioni
}
