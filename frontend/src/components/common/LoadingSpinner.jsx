import React from 'react';

function LoadingSpinner({ label = 'Caricamento...' }) {
  return (
    <div className="loading-wrapper">
      <div className="loading-spinner-custom"></div>
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
