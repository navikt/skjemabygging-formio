import { useCallback, useState } from 'react';

const useLockedFormModal = () => {
  const [isLockedFormModalOpen, setIsLockedFormModalOpen] = useState<boolean>(false);

  const openLockedFormModal = useCallback(() => {
    setIsLockedFormModalOpen(true);
  }, []);

  const closeLockedFormModal = useCallback(() => {
    setIsLockedFormModalOpen(false);
  }, []);

  return {
    isLockedFormModalOpen,
    openLockedFormModal,
    closeLockedFormModal,
  };
};

export default useLockedFormModal;
