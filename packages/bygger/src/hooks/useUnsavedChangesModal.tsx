import { ConfirmationModal } from '@navikt/skjemadigitalisering-shared-components';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from '../context/old_form/FormContext';

interface FormChanged {
  changed: boolean;
}

const useUnsavedChangesModal = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);
  const { resetForm } = useForm();

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
          resetForm();
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
  }, [openModal, resetForm, redirectTo, navigate]);

  return {
    unsavedChangesModalContent: modalContent,
    showUnsavedChangesModal,
  };
};

export default useUnsavedChangesModal;
