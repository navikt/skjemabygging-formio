import { Button } from '@navikt/ds-react';
import { ConfirmationModal, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';

interface UnpublishButtonProps {
  onUnpublish: () => void;
  form: NavFormType;
}

const UnpublishButton = ({ onUnpublish, form }: UnpublishButtonProps) => {
  const [openConfirmModal, setOpenConfirmModal] = useModal();

  return (
    <>
      {form.properties?.published && (
        <>
          <Button variant="secondary" onClick={() => setOpenConfirmModal(true)} type="button">
            Avpubliser
          </Button>

          <div>
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
