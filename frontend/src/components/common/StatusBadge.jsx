// components/common/StatusBadge.jsx
// NOTA: Gli stili sono in App.css (classi .badge, .badge-sano, .badge-in-cura, ecc.)

const STATUS_CONFIG = {
  // Stato animale
  'Sano': { className: 'badge-sano', label: 'Sano' },
  'In cura': { className: 'badge-in-cura', label: 'In cura' },
  'Deceduto': { className: 'badge-deceduto', label: 'Deceduto' },
  
  // Prenotazioni
  'Attesa': { className: 'badge-attesa', label: 'In attesa' },
  'Confermata': { className: 'badge-confermata', label: 'Confermata' },
  'Completata': { className: 'badge-completata', label: 'Completata' },
  'Annullata': { className: 'badge-annullata', label: 'Annullata' },
  
  // Stato prenotazione (sala d'attesa)
  'NON_ARRIVATO': { className: 'badge-non-arrivato', label: 'Non arrivato' },
  'IN_ATTESA': { className: 'badge-in-attesa', label: 'In attesa' },
  'COMPLETATO': { className: 'badge-completato', label: 'Completato' },
  
  // Visite
  'Pianificata': { className: 'badge-pianificata', label: 'Pianificata' },
  'In corso': { className: 'badge-in-corso', label: 'In corso' },
  
  // Pagamenti
  'Da pagare': { className: 'badge-da-pagare', label: 'Da pagare' },
  'Pagato': { className: 'badge-pagato', label: 'Pagato' },
  'Annullato': { className: 'badge-annullato', label: 'Annullato' },
};

export function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status];
  if (!config) {
    return <span className={`badge ${className}`}>{status || '—'}</span>;
  }
  return (
    <span className={`badge ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}
