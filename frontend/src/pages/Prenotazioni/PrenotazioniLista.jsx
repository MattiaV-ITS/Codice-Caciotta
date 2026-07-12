import React from 'react';
import { useNavigate } from 'react-router-dom';

function PrenotazioniLista() {
  const navigate = useNavigate();
  
  // Redirect to programma view by default
  React.useEffect(() => {
    navigate('/prenotazioni/programma');
  }, [navigate]);
  
  return null;
}

export default PrenotazioniLista;