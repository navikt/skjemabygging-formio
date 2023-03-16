import { Button } from "@navikt/ds-react";
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
      <p className="margin-bottom-double">
        Dette er kun en forhåndsvisning av skjemaet og skal IKKE brukes til å sende søknader til NAV.
      </p>
      <Button onClick={onClose}>OK</Button>
    </Modal>
  );
};

export default ConfirmDelingslenkeModal;
