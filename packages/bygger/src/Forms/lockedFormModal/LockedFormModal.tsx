import { BodyShort } from '@navikt/ds-react';
import { ConfirmationModal, InnerHtml, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  form: NavFormType;
  open: boolean;
  onClose: () => void;
}

const useStyles = makeStyles({
  htmlContent: {
    marginBottom: 'var(--a-spacing-4)',
  },
});

const LockedFormModal = ({ form, open, onClose }: Props) => {
  const styles = useStyles();

  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirm={onClose}
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
};

export default LockedFormModal;
