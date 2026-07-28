import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { useApi } from '../../services/apiService';

const OrarioBloccatoEditModal = lazy(() => import('../OrarioBloccatoEditModal/OrarioBloccatoEditModal'));

// Icons for menu items
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

const OrarioBloccatoContextMenu = ({ children, blockedTime, onBlockedTimeUpdated, onBlockedTimeDeleted }) => {
  const { user } = useAuth();
  const { get, post, remove } = useApi();
  const [isLoading, setIsLoading] = useState(false);

  const isStaffOrAdmin = user?.roles?.includes('ROLE_STAFF') || user?.roles?.includes('ROLE_ADMIN');

  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditBlockedTime = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleEditSuccess = useCallback((updatedBlockedTime) => {
    onBlockedTimeUpdated?.(updatedBlockedTime);
    setShowEditModal(false);
  }, [onBlockedTimeUpdated]);

  const handleDeleteBlockedTime = useCallback(async () => {
    if (!blockedTime?.id || !isStaffOrAdmin) return;

    if (!window.confirm('Sei sicuro di voler eliminare questo orario bloccato? Questa azione non puÃ² essere annullata.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await remove(`/api/admin/orari/bloccati/${blockedTime.id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to delete blocked time: ${response.status}`;
        throw new Error(errorMessage);
      }

      onBlockedTimeDeleted?.(blockedTime.id);
      if (process.env.NODE_ENV === 'development') console.log('Blocked time deleted successfully');
    } catch (error) {
      logger.error('Error deleting blocked time:', error);
      alert(`Errore durante l'eliminazione dell'orario bloccato: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [blockedTime, isStaffOrAdmin, remove, onBlockedTimeDeleted]);

  const menuItems = [
    {
      label: 'Modifica Orario Bloccato',
      icon: <EditIcon />,
      onClick: handleEditBlockedTime,
      disabled: isLoading
    }
  ];

  // Add delete option only for staff/admin
  if (isStaffOrAdmin) {
    menuItems.push({
      label: 'Elimina Orario Bloccato',
      icon: <DeleteIcon />,
      onClick: handleDeleteBlockedTime,
      disabled: isLoading,
      danger: true
    });
  }

  return (
    <ContextMenu menuItems={menuItems} onClose={() => setIsLoading(false)}>
      {children}
      {showEditModal && blockedTime && (
        <Suspense fallback={<div>Caricamento...</div>}>
          <OrarioBloccatoEditModal
            blockedTime={blockedTime}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleEditSuccess}
          />
        </Suspense>
      )}
    </ContextMenu>
  );
}

export default OrarioBloccatoContextMenu;

