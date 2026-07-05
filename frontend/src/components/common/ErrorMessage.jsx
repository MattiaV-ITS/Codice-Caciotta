import React from 'react';

function ErrorMessage({ error }) {
  return (
    <div className="page-container">
      <div className="form-error">Errore: {error}</div>
    </div>
  );
}

export default ErrorMessage;
