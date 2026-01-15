import { Button } from '@navikt/ds-react';
import { ConfirmationModal, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { useCallback } from 'react';
import { useForm } from '../../context/old_form/FormContext';
import { FormStatusProperties } from './types';

interface Props {
  formStatusProperties: FormStatusProperties;
  className?: string;
}

const ResetFormButton = ({ formStatusProperties, className }: Props) => {
  const [openConfirmModal, setOpenConfirmModal] = useModal();
  const { resetForm } = useForm();
  const onConfirm = useCallback(async () => {
    await resetForm(formStatusProperties.revision);
  }, [resetForm, formStatusProperties.revision]);

  if (formStatusProperties.status === 'pending') {
    return (
      <>
        <Button className={className} variant="tertiary" size="xsmall" onClick={() => setOpenConfirmModal(true)}>
          Forkast endringer
        </Button>
        <ConfirmationModal
          open={openConfirmModal}
          onClose={() => setOpenConfirmModal(false)}
          onConfirm={onConfirm}
          texts={{
            title: 'Advarsel om forkasting av endringer',
            body: 'Er du sikker på at endringer siden forrige publisering skal forkastes?',
            confirm: 'Ja, forkast',
            cancel: 'Nei',
          }}
        />
      </>
    );
  }
  return null;
};

export default ResetFormButton;
