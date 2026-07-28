import React, { useState, useRef } from 'react';
import { useApi } from '../../services/apiService';

const TIPI_DOCUMENTO = [
  { value: 'REFERTO', label: 'Referto', icon: 'ðŸ“‹' },
  { value: 'RICETTA', label: 'Ricetta', icon: 'ðŸ’Š' },
  { value: 'ANALISI', label: 'Analisi', icon: 'ðŸ”¬' },
  { value: 'LIBRETTO_VACCINALE', label: 'Libretto vaccinale', icon: 'ðŸ’‰' },
  { value: 'CERTIFICATO', label: 'Certificato', icon: 'ðŸ“œ' },
  { value: 'SCAN_FATTURA', label: 'Scan fattura', icon: 'ðŸ§¾' },
  { value: 'DOCUMENTO_GENERICO', label: 'Documento generico', icon: 'ðŸ“„' },
  { value: 'ALTRO', label: 'Altro', icon: 'ðŸ“' },
];

function UploadDocumentoModal({ animaleId, visitaId, fatturaId, filtroTipo, onClose, onSuccess }) {
  const api = useApi();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState(filtroTipo || 'DOCUMENTO_GENERICO');
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Filtra i tipi disponibili in base al contesto
  const tipiDisponibili = fatturaId
    ? TIPI_DOCUMENTO.filter(t => t.value === 'SCAN_FATTURA' || t.value === 'DOCUMENTO_GENERICO')
    : visitaId
      ? TIPI_DOCUMENTO.filter(t => t.value !== 'LIBRETTO_VACCINALE')
      : TIPI_DOCUMENTO;

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validazione: solo PDF e immagini
    const tipoValido = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/bmp',
    ].includes(selectedFile.type);

    if (!tipoValido) {
      setError('Formato non supportato. Carica PDF, JPEG, PNG, TIFF o BMP.');
      return;
    }

    // Validazione dimensione max 20MB
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('Il file Ã¨ troppo grande. Dimensione massima: 20MB.');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Seleziona un file da caricare');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipoDocumento', tipoDocumento);
      if (note) formData.append('note', note);

      let response;
      if (fatturaId) {
        formData.append('animaleId', animaleId);
        response = await fetch(`/api/fatture/${fatturaId}/documento`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
          body: formData,
        });
      } else if (visitaId) {
        formData.append('animaleId', animaleId);
        response = await fetch(`/api/visite/${visitaId}/documenti`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
          body: formData,
        });
      } else {
        response = await fetch(`/api/animali/${animaleId}/documenti`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error(`Errore durante il caricamento: ${response.status}`);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      logger.error('Upload error:', err);
      setError(err.message || 'Errore durante il caricamento del file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Carica Documento</h3>
          <button className="modal-close" onClick={onClose} disabled={isUploading}>
            Ã—
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="form-error" style={{ marginBottom: 'var(--space-3)' }}>
                {error}
              </div>
            )}

            {/* Area drop file */}
            <div
              className={`upload-dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div className="upload-file-selezionato">
                  <span className="upload-file-icona">
                    {file.type === 'application/pdf' ? 'ðŸ“„' : 'ðŸ–¼ï¸'}
                  </span>
                  <div className="upload-file-info">
                    <strong>{file.name}</strong>
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    disabled={isUploading}
                  >
                    Rimuovi
                  </button>
                </div>
              ) : (
                <div className="upload-dropzone-placeholder">
                  <span className="upload-dropzone-icona">ðŸ“„</span>
                  <p>Trascina il file qui o clicca per selezionarlo</p>
                  <small>PDF, JPEG, PNG, TIFF o BMP (max 20MB)</small>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif,.bmp"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
                disabled={isUploading}
              />
            </div>

            {/* Tipo documento */}
            <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
              <label htmlFor="tipoDocumento">Tipo documento</label>
              <select
                id="tipoDocumento"
                className="form-control"
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                disabled={isUploading || !!filtroTipo}
              >
                {tipiDisponibili.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.icon} {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div className="form-group" style={{ marginTop: 'var(--space-2)' }}>
              <label htmlFor="note">Note (opzionale)</label>
              <textarea
                id="note"
                className="form-control"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Aggiungi una descrizione..."
                rows="2"
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isUploading}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading || !file}
            >
              {isUploading ? 'Caricamento...' : 'Carica'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadDocumentoModal;
