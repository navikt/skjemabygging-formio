import { ConfirmationModal } from '@navikt/skjemadigitalisering-shared-components';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface FormChanged {
  changed: boolean;
}

const useUnsavedChangesModal = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  const { formPath } = useParams();

  const showUnsavedChangesModal = (event: React.MouseEvent, { redirectTo }: { redirectTo: string }) => {
    setRedirectTo(redirectTo);

    if (formPath) {
      const formChangedData = JSON.parse(sessionStorage.getItem(formPath) as string) as FormChanged;
      if (formChangedData) {
        const formChanged = formChangedData.changed === true;
        if (formChanged) {
          event.preventDefault();
          setOpenModal(true);
        }
      }
    }
  };

  const modalContent = useMemo(() => {
    return (
      <ConfirmationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={() => {
          if (formPath) {
            sessionStorage.removeItem(formPath);
          }
          setOpenModal(false);
          if (redirectTo) navigate(redirectTo);
        }}
        confirmType="danger"
        texts={{
          title: 'Du har ulagrede endringer i skjemaet',
          body: 'Vil du forlate siden uten å lagre?',
          confirm: 'Forkast endringer',
          cancel: 'Avbryt',
        }}
      />
    );
  }, [formPath, redirectTo, navigate, openModal]);

  return {
    unsavedChangesModalContent: modalContent,
    showUnsavedChangesModal,
  };
};

export default useUnsavedChangesModal;
