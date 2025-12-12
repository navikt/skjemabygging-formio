import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { ConfirmationModal, makeStyles, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { Form, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../context/old_form/FormContext';
import LockedFormModal from '../lockedFormModal/LockedFormModal';
interface UnpublishButtonProps {
  form: Form;
}

const useStyles = makeStyles({
  noMargin: {
    margin: 0,
  },
});

const UnpublishButton = ({ form }: UnpublishButtonProps) => {
  const [openConfirmModal, setOpenConfirmModal] = useModal();
  const [lockedFormModal, setLockedFormModal] = useModal();
  const { unpublishForm } = useForm();
  const isLockedForm = !!form.lock;
  const styles = useStyles();

  return (
    <>
      {['published', 'pending'].includes(form?.status ?? '') && (
        <>
          <Button
            variant="tertiary"
            onClick={() => {
              if (isLockedForm) {
                setLockedFormModal(true);
              } else {
                setOpenConfirmModal(true);
              }
            }}
            type="button"
            size="small"
            icon={isLockedForm && <PadlockLockedIcon title={TEXTS.grensesnitt.lockedForm} />}
          >
            Avpubliser
          </Button>

          <div className={styles.noMargin}>
            <LockedFormModal open={lockedFormModal} onClose={() => setLockedFormModal(false)} form={form} />
            <ConfirmationModal
              open={openConfirmModal}
              onClose={() => setOpenConfirmModal(false)}
              onConfirm={unpublishForm}
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
