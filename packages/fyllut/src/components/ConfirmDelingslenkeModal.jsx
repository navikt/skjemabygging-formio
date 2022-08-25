import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { Knapp } from "nav-frontend-knapper";
import { Normaltekst } from "nav-frontend-typografi";
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
      <Normaltekst className="margin-bottom-double">
        Dette er kun en forhåndsvisning av skjemaet og skal IKKE brukes til å sende søknader til NAV.
      </Normaltekst>
      <Knapp onClick={onClose}>OK</Knapp>
    </Modal>
  );
};

export default ConfirmDelingslenkeModal;
