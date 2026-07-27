import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../services/apiService';
import UploadDocumentoModal from './UploadDocumentoModal';
import './DocumentiAllegati.css';

const FORMATTA_DIMENSIONE = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const ICONE_PER_TIPO = {
  REFERTO: '📋',
  RICETTA: '💊',
  ANALISI: '🔬',
  LIBRETTO_VACCINALE: '💉',
  CERTIFICATO: '📜',
  SCAN_FATTURA: '🧾',
  DOCUMENTO_GENERICO: '📄',
  ALTRO: '📁',
};

const ETICHETTE_TIPO = {
  REFERTO: 'Referto',
  RICETTA: 'Ricetta',
  ANALISI: 'Analisi',
  LIBRETTO_VACCINALE: 'Libretto vaccinale',
  CERTIFICATO: 'Certificato',
  SCAN_FATTURA: 'Scan fattura',
  DOCUMENTO_GENERICO: 'Documento',
  ALTRO: 'Altro',
};

function DocumentiAllegati({
  animaleId,
  visitaId = null,
  fatturaId = null,
  titolo = 'Documenti',
  mostraUpload = true,
  filtroTipo = null, // Se specificato, mostra solo documenti di quel tipo
  nascondiSeVuoto = false,
}) {
  const { get, remove } = useApi();
  const [documenti, setDocumenti] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const caricaDocumenti = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (visitaId) {
        response = await get(`/api/visite/${visitaId}/documenti`);
      } else if (fatturaId) {
        response = await get(`/api/fatture/${fatturaId}/documento`);
      } else if (filtroTipo) {
        response = await get(`/api/animali/${animaleId}/documenti/tipo/${filtroTipo}`);
      } else {
        response = await get(`/api/animali/${animaleId}/documenti`);
      }

      if (response.ok) {
        const data = await response.json();
        setDocumenti(data);
      } else {
        setDocumenti([]);
        if (response.status !== 404) {
          throw new Error(`Errore nel caricamento documenti: ${response.status}`);
        }
      }
    } catch (err) {
      console.error('Error fetching documenti:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [animaleId, visitaId, fatturaId, filtroTipo, get]);

  useEffect(() => {
    if (animaleId) {
      caricaDocumenti();
    }
  }, [caricaDocumenti]);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    caricaDocumenti();
  };

  const handleDelete = async (documentoId, nomeFile) => {
    if (!window.confirm(`Eliminare il documento "${nomeFile}"?`)) {
      return;
    }

    try {
      const response = await remove(`/api/documenti/${documentoId}`);
      if (response.ok) {
        caricaDocumenti();
      } else {
        throw new Error(`Errore nell'eliminazione: ${response.status}`);
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Errore durante l\'eliminazione del documento');
    }
  };

  const openDocument = async (documentoId) => {
    // Fetch the document as a blob and open via object URL to handle authentication
    try {
      const response = await get(`/api/documenti/${documentoId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        // Revoke after a delay to allow the new tab to load
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        // Fallback: try direct URL as last resort
        window.open(`/api/documenti/${documentoId}/download`, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Error opening document:', err);
      // Fallback
      window.open(`/api/documenti/${documentoId}/download`, '_blank', 'noopener,noreferrer');
    }
  };

  if (nascondiSeVuoto && !isLoading && documenti.length === 0) {
    return null;
  }

  return (
    <div className="documenti-allegati">
      <div className="documenti-header">
        <h4 className="documenti-titolo">
          {ICONE_PER_TIPO[filtroTipo] || '📄'} {titolo}
          {documenti.length > 0 && (
            <span className="documenti-conteggio">{documenti.length}</span>
          )}
        </h4>
        {mostraUpload && (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowUploadModal(true)}
            title="Carica documento"
          >
            + Carica
          </button>
        )}
      </div>

      {isLoading && (
        <div className="documenti-loading">
          <div className="loading-spinner-custom"></div>
          <span>Caricamento documenti...</span>
        </div>
      )}

      {error && (
        <div className="documenti-errore">
          <span>⚠️</span> {error}
        </div>
      )}

      {!isLoading && !error && documenti.length === 0 && (
        <p className="documenti-vuoto">Nessun documento caricato</p>
      )}

      {!isLoading && documenti.length > 0 && (
        <ul className="documenti-lista">
          {documenti.map((doc) => (
            <li key={doc.id} className="documenti-item">
              <div className="documenti-item-icona">
                {ICONE_PER_TIPO[doc.tipoDocumento] || '📄'}
              </div>
              <div className="documenti-item-info">
                <span
                  className="documenti-item-nome"
                  onClick={() => openDocument(doc.id)}
                  title="Apri in nuova scheda"
                >
                  {doc.nomeOriginale}
                </span>
                <span className="documenti-item-meta">
                  {ETICHETTE_TIPO[doc.tipoDocumento] || doc.tipoDocumento} · {FORMATTA_DIMENSIONE(doc.dimensioneBytes)}
                  {doc.dataCaricamento && ` · ${new Date(doc.dataCaricamento).toLocaleDateString('it-IT')}`}
                </span>
                {doc.note && (
                  <span className="documenti-item-note">{doc.note}</span>
                )}
              </div>
              <div className="documenti-item-azioni">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => openDocument(doc.id)}
                  title="Apri in nuova scheda"
                >
                  🔍
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(doc.id, doc.nomeOriginale)}
                  title="Elimina"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showUploadModal && (
        <UploadDocumentoModal
          animaleId={animaleId}
          visitaId={visitaId}
          fatturaId={fatturaId}
          filtroTipo={filtroTipo}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}

export default DocumentiAllegati;