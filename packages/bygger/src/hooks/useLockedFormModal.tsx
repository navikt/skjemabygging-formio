import { BodyShort } from '@navikt/ds-react';
import { ConfirmationModal } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useMemo, useState } from 'react';

const useLockedFormModal = (form: NavFormType) => {
  const [lockedFormModal, setLockedFormModal] = useState<boolean>(false);

  const openLockedFormModal = useCallback(() => {
    setLockedFormModal(true);
  }, []);

  const closeLockedFormModal = useCallback(() => {
    setLockedFormModal(false);
  }, []);

  const modalContent = useMemo(() => {
    return (
      <ConfirmationModal
        open={lockedFormModal}
        onClose={() => setLockedFormModal(false)}
        onConfirm={() => setLockedFormModal(false)}
        texts={{
          title: 'Skjemaet er låst for redigering',
          confirm: 'Ok',
        }}
        children={
          <>
            <BodyShort>{form.properties.lockedFormReason}</BodyShort>
            <BodyShort>{'Gå til instillinger for å låse opp skjemaet'}</BodyShort>
          </>
        }
      />
    );
  }, [form.properties.lockedFormReason, lockedFormModal]);

  return {
    lockedFormModalContent: modalContent,
    openLockedFormModal,
    closeLockedFormModal,
  };
};

export default useLockedFormModal;
