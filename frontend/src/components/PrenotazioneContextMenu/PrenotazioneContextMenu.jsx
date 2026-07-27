import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { useApi } from '../../services/apiService';

const PrenotazioneEditModal = lazy(() => import('../PrenotazioneEditModal/PrenotazioneEditModal'));

// Icons for menu items
const VisitIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="m104.175 90.97-4.252 38.384 38.383-4.252L247.923 15.427V2.497L226.78-18.646h-12.93zm98.164-96.96 31.671 31.67" transform="translate(-77.923 40.646)" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m195.656 33.271-52.882 52.882" transform="translate(-77.923 40.646)" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="5" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PrenotazioneContextMenu = ({ children, prenotazione, onPrenotazioneUpdated, onPrenotazioneDeleted }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { get, post, patch, delete: deleteRequest } = useApi();
  const [isLoading, setIsLoading] = useState(false);

  const isStaffOrAdmin = user?.roles?.includes('ROLE_STAFF') || user?.roles?.includes('ROLE_ADMIN');

  const handleOpenVisita = useCallback(async () => {
    if (!prenotazione?.id) return;

    try {
      setIsLoading(true);
      
      // Check if this prenotazione already has a visita
      const visitaResponse = await get(`/api/prenotazioni/${prenotazione.id}/visita`);
      if (!visitaResponse.ok) {
        throw new Error(`Failed to check visita: ${visitaResponse.status}`);
      }

      const visitaData = await visitaResponse.json();

      if (visitaData.visitaId) {
        // Navigate to existing visita
        navigate(`/visite/${visitaData.visitaId}`);
      } else {
        // Create new visita from prenotazione and navigate to it
        const createResponse = await post(`/api/prenotazioni/${prenotazione.id}/visita`);
        if (!createResponse.ok) {
          throw new Error(`Failed to create visita: ${createResponse.status}`);
        }

        const createdVisita = await createResponse.json();
        navigate(`/visite/${createdVisita.visitaId}`);
      }
    } catch (error) {
      console.error('Error handling visita action:', error);
      // Fallback to simple navigation if there's an error
      navigate(`/visite?prenotazioneId=${prenotazione.id}`);
    } finally {
      setIsLoading(false);
    }
  }, [prenotazione, navigate, get, post]);

  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditPrenotazione = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleEditSuccess = useCallback((updatedPrenotazione) => {
    onPrenotazioneUpdated?.(updatedPrenotazione);
    setShowEditModal(false);
  }, [onPrenotazioneUpdated]);

  const handleDeletePrenotazione = useCallback(async () => {
    if (!prenotazione?.id || !isStaffOrAdmin) return;

    if (!window.confirm('Sei sicuro di voler eliminare questa prenotazione? Questa azione non può essere annullata.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await deleteRequest(`/api/prenotazioni/${prenotazione.id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to delete prenotazione: ${response.status}`;
        throw new Error(errorMessage);
      }

      onPrenotazioneDeleted?.(prenotazione.id);
      console.log('Prenotazione deleted successfully');
    } catch (error) {
      console.error('Error deleting prenotazione:', error);
      // Check if the error is about having an associated visita
      if (error.message && error.message.includes('Cannot delete prenotazione that has an associated visita')) {
        alert('Impossibile eliminare la prenotazione: esiste già una visita associata. Per eliminare la prenotazione, è necessario eliminare prima la visita.');
      } else {
        alert(`Errore durante l'eliminazione della prenotazione: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prenotazione, isStaffOrAdmin, deleteRequest, onPrenotazioneDeleted]);

  const handleChangeStato = useCallback(async (nuovoStato) => {
    if (!prenotazione?.id) return;
    try {
      setIsLoading(true);
      const response = await patch(`/api/prenotazioni/${prenotazione.id}/stato`, { stato: nuovoStato });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update stato: ${response.status}`);
      }
      const updatedPrenotazione = await response.json();
      onPrenotazioneUpdated?.(updatedPrenotazione);
    } catch (error) {
      console.error('Error updating stato:', error);
      alert(`Errore aggiornando lo stato: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [prenotazione, onPrenotazioneUpdated, patch]);

  // Icone inline per i tre stati
  const NonArrivatoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
  const InAttesaIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" fill="none" />
    </svg>
  );
  const CompletatoIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="currentColor" />
    </svg>
  );

  const menuItems = [
    {
      label: 'Apri/Crea Visita',
      icon: <VisitIcon />,
      onClick: handleOpenVisita,
      disabled: isLoading
    },
    {
      label: 'Modifica Prenotazione',
      icon: <EditIcon />,
      onClick: handleEditPrenotazione,
      disabled: isLoading
    },
    { divider: true },
    {
      label: 'Non arrivato',
      icon: <NonArrivatoIcon />,
      onClick: () => handleChangeStato('NON_ARRIVATO'),
      disabled: isLoading,
      className: prenotazione?.stato === 'NON_ARRIVATO' ? 'context-menu-item-active' : ''
    },
    {
      label: 'In attesa',
      icon: <InAttesaIcon />,
      onClick: () => handleChangeStato('IN_ATTESA'),
      disabled: isLoading,
      className: prenotazione?.stato === 'IN_ATTESA' ? 'context-menu-item-active' : ''
    },
    {
      label: 'Completato',
      icon: <CompletatoIcon />,
      onClick: () => handleChangeStato('COMPLETATO'),
      disabled: isLoading,
      className: prenotazione?.stato === 'COMPLETATO' ? 'context-menu-item-active' : ''
    }
  ];

  // Add delete option only for staff/admin
  if (isStaffOrAdmin) {
    menuItems.push({ divider: true });
    menuItems.push({
      label: 'Elimina Prenotazione',
      icon: <DeleteIcon />,
      onClick: handleDeletePrenotazione,
      disabled: isLoading,
      danger: true
    });
  }

  return (
    <ContextMenu menuItems={menuItems} onClose={() => setIsLoading(false)}>
      {children}
      {showEditModal && prenotazione && (
        <Suspense fallback={<div>Caricamento...</div>}>
          <PrenotazioneEditModal
            prenotazione={prenotazione}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleEditSuccess}
          />
        </Suspense>
      )}
    </ContextMenu>
  );
}

export default PrenotazioneContextMenu;
