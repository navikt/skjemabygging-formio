import { BodyShort, Button } from "@navikt/ds-react";
import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { useState } from "react";

const ConfirmDelingslenkeModal = () => {
  const [open, setOpen] = useState(true);

  const onClose = () => setOpen(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      shouldCloseOnOverlayClick={false}
      ariaLabel="Forhåndsvisningsadvarsel"
      title="Forhåndsvisning"
    >
      <BodyShort className="margin-bottom-double">
        Dette er kun en forhåndsvisning av skjemaet og skal IKKE brukes til å sende søknader til NAV.
      </BodyShort>
      <Button onClick={onClose}>OK</Button>
    </Modal>
  );
};

export default ConfirmDelingslenkeModal;
