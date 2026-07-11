import React from 'react';

function FormModal({
  title,
  children,
  onClose,
  isSubmitting = false,
  submitLabel = 'Aggiungi',
  showCancelButton = true,
  cancelLabel = 'Cancella',
  onSubmit,
  submitError = null
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className="proprietario-modal-overlay">
      <div className="proprietario-modal" onClick={(e) => e.stopPropagation()}>
        <div className="proprietario-modal-header">
          <h3>{title}</h3>
          <button className="proprietario-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="proprietario-modal-body">
          {submitError && (
            <div className="form-error" style={{ marginBottom: '16px', textAlign: 'center' }}>
              {submitError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="proprietario-form">
            {children}
            <div className="proprietario-modal-footer">
              {showCancelButton && (
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                  {cancelLabel}
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? `${submitLabel} in corso...` : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormModal;