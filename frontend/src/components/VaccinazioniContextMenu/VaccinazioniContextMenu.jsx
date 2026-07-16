import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { useApi } from '../../services/apiService';
import VaccinazioneEditModal from '../VaccinazioneEditModal/VaccinazioneEditModal';

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43744 22.1213 4C22.1213 4.56256 21.8978 5.10218 21.5 5.5L12 15H8V19L18.5 8.5L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

const VaccinazioneContextMenu = ({ children, vaccinazione, onVaccinazioneUpdated, onVaccinazioneDeleted }) => {
  const { user } = useAuth();
  const { delete: deleteRequest } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const isStaffOrAdmin = user?.roles?.includes('ROLE_STAFF') || user?.roles?.includes('ROLE_ADMIN');

  const handleEditVaccinazione = useCallback(() => {
    setShowEditModal(true);
  }, []);

  const handleEditSuccess = useCallback((updatedVaccinazione) => {
    onVaccinazioneUpdated?.(updatedVaccinazione);
    setShowEditModal(false);
  }, [onVaccinazioneUpdated]);

  const handleDeleteVaccinazione = useCallback(async () => {
    if (!vaccinazione?.id || !isStaffOrAdmin) return;

    if (!window.confirm('Sei sicuro di voler eliminare questa vaccinazione? Questa azione non può essere annullata.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await deleteRequest(`/api/vaccinazioni/${vaccinazione.id}`);

      if (!response.ok) {
        throw new Error(`Failed to delete vaccinazione: ${response.status}`);
      }

      onVaccinazioneDeleted?.(vaccinazione.id);
    } catch (error) {
      console.error('Error deleting vaccinazione:', error);
      alert(`Errore durante l'eliminazione della vaccinazione: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [vaccinazione, isStaffOrAdmin, deleteRequest, onVaccinazioneDeleted]);

  const menuItems = [
    {
      label: 'Modifica Vaccinazione',
      icon: <EditIcon />,
      onClick: handleEditVaccinazione,
      disabled: isLoading
    }
  ];

  if (isStaffOrAdmin) {
    menuItems.push({
      label: 'Elimina Vaccinazione',
      icon: <DeleteIcon />,
      onClick: handleDeleteVaccinazione,
      disabled: isLoading,
      danger: true
    });
  }

  return (
    <ContextMenu menuItems={menuItems} onClose={() => setIsLoading(false)}>
      {children}
      {showEditModal && vaccinazione && (
        <VaccinazioneEditModal
          vaccinazione={vaccinazione}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </ContextMenu>
  );
}

export default VaccinazioneContextMenu;