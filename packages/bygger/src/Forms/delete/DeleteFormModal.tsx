import { ConfirmationModal } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';
import { useForm } from '../../context/old_form/FormContext';

interface Props {
  form: Form;
  openDeleteFormModal: boolean;
  setOpenDeleteFormModal: (open: boolean) => void;
}

const DeleteFormModal = ({ form, openDeleteFormModal, setOpenDeleteFormModal }: Props) => {
  const { deleteForm } = useForm();

  const handleDelete = useCallback(async () => await deleteForm(form), [deleteForm, form]);

  const closeModal = useCallback(() => setOpenDeleteFormModal(false), [setOpenDeleteFormModal]);

  if (form.publishedAt) {
    return (
      <ConfirmationModal
        open={openDeleteFormModal}
        onClose={closeModal}
        onConfirm={closeModal}
        texts={{
          title: 'Brukermelding',
          body: 'Skjemaet kan ikke slettes siden det har vært publisert',
          confirm: 'Ok',
        }}
      />
    );
  }

  return (
    <ConfirmationModal
      open={openDeleteFormModal}
      onConfirm={handleDelete}
      onClose={closeModal}
      texts={{
        title: 'Varsel om sletting',
        body: 'Er du sikker på at dette skjemaet skal slettes?',
        confirm: 'Ja, slett skjemaet',
        cancel: 'Nei, ikke slett skjemaet',
      }}
    />
  );
};

export default DeleteFormModal;
