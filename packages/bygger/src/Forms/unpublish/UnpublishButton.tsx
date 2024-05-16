import { Button } from '@navikt/ds-react';
import { ConfirmationModal, makeStyles, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';

interface UnpublishButtonProps {
  onUnpublish: () => void;
  form: NavFormType;
}

const useStyles = makeStyles({
  noMargin: {
    margin: 0,
  },
});

const UnpublishButton = ({ onUnpublish, form }: UnpublishButtonProps) => {
  const [openConfirmModal, setOpenConfirmModal] = useModal();
  const styles = useStyles();

  return (
    <>
      {form.properties?.published && (
        <>
          <Button variant="tertiary" onClick={() => setOpenConfirmModal(true)} type="button" size="small">
            Avpubliser
          </Button>

          <div className={styles.noMargin}>
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
