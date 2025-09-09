import { useState } from 'react';

export const useAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openAssistant = () => setIsOpen(true);
  const closeAssistant = () => setIsOpen(false);
  const toggleAssistant = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    openAssistant,
    closeAssistant,
    toggleAssistant
  };
};