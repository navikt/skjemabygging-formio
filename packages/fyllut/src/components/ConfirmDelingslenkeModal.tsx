import { ConfirmationModal } from '@navikt/skjemadigitalisering-shared-components';
import { useState } from 'react';

const ConfirmDelingslenkeModal = () => {
  const [open, setOpen] = useState(true);

  const onClose = () => setOpen(false);

  return (
    <ConfirmationModal
      open={open}
      width={'small'}
      onClose={onClose}
      onConfirm={onClose}
      texts={{
        title: 'Forhåndsvisning',
        body: 'Dette er kun en forhåndsvisning av skjemaet og skal IKKE brukes til å sende søknader til Nav.',
        confirm: 'Ok',
      }}
    />
  );
};

export default ConfirmDelingslenkeModal;
