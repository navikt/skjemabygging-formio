import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { ConfirmationModal, makeStyles, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../context/form/FormContext';
import LockedFormModal from '../lockedFormModal/LockedFormModal';
interface UnpublishButtonProps {
  form: NavFormType;
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
  const isLockedForm = form.properties.isLockedForm;
  const styles = useStyles();

  return (
    <>
      {form.properties?.published && (
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
            icon={isLockedForm && <PadlockLockedIcon title="Skjemaet er låst" />}
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
