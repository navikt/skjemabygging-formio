import { BodyShort } from '@navikt/ds-react';
import { ConfirmationModal, InnerHtml, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useMemo, useState } from 'react';

const useStyles = makeStyles({
  htmlContent: {
    marginBottom: 'var(--a-spacing-4)',
  },
});

const useLockedFormModal = (form: NavFormType) => {
  const styles = useStyles();
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
            <InnerHtml content={form.properties.lockedFormReason ?? ''} className={styles.htmlContent}></InnerHtml>
            <BodyShort>{'Gå til instillinger for å låse opp skjemaet.'}</BodyShort>
          </>
        }
      />
    );
  }, [form.properties.lockedFormReason, lockedFormModal, styles]);

  return {
    lockedFormModalContent: modalContent,
    openLockedFormModal,
    closeLockedFormModal,
  };
};

export default useLockedFormModal;
