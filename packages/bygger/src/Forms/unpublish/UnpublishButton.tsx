import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { ConfirmationModal, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import useLockedFormModal from '../../hooks/useLockedFormModal';
interface UnpublishButtonProps {
  onUnpublish: () => void;
  form: NavFormType;
}

const UnpublishButton = ({ onUnpublish, form }: UnpublishButtonProps) => {
  const [openConfirmModal, setOpenConfirmModal] = useModal();
  const { lockedFormModalContent, openLockedFormModal } = useLockedFormModal(form);
  const isLockedForm = form.properties.isLockedForm;

  return (
    <>
      {form.properties?.published && (
        <>
          <Button
            variant="secondary"
            onClick={() => {
              if (isLockedForm) {
                openLockedFormModal();
              } else {
                setOpenConfirmModal(true);
              }
            }}
            type="button"
            icon={isLockedForm && <PadlockLockedIcon />}
          >
            Avpubliser
          </Button>

          <div>
            {lockedFormModalContent}
            <ConfirmationModal
              open={openConfirmModal}
              onClose={() => setOpenConfirmModal(false)}
              onConfirm={onUnpublish}
              texts={{
                title: 'Avpubliseringsadvarsel',
                body: 'Er du sikker på at dette skjemaet skal avpubliseres?',
                confirm: 'Ja, avpubliser skjemaet',
                cancel: 'Nei',
              }}
            />
          </div>
        </>
      )}
    </>
  );
};

export default UnpublishButton;
