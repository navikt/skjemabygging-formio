import { BodyShort } from '@navikt/ds-react';
import { ConfirmationModal } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  form: NavFormType;
  open: boolean;
  onClose: () => void;
}

const LockedFormModal = ({ form, open, onClose }: Props) => {
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
          <BodyShort className="mb-4">{form.properties.lockedFormReason}</BodyShort>
          <BodyShort>{'Gå til instillinger for å låse opp skjemaet.'}</BodyShort>
        </>
      }
    />
  );
};

export default LockedFormModal;
