import { useState } from 'react';

export function useSearchControls() {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');

  const applySearch = () => setAppliedSearchTerm(searchTerm);

  const clearSearch = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
  };

  return {
    searchTerm,
    appliedSearchTerm,
    setSearchTerm,
    applySearch,
    clearSearch
  };
}
