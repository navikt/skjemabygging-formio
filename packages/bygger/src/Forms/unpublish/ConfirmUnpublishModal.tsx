import { BodyShort, Button } from "@navikt/ds-react";
import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { useState } from "react";

interface Props {
  openModal: boolean;
  closeModal: () => void;
  onUnpublish: (form) => void;
  form: NavFormType;
}

const ConfirmUnpublishModal = ({ openModal, closeModal, onUnpublish, form }: Props) => {
  const [loading, setLoading] = useState(false);

  const unpublish = async () => {
    setLoading(true);
    await onUnpublish(form);
    closeModal();
  };

  return (
    <Modal open={openModal} onClose={closeModal} ariaLabel="Avpubliseringsadvarsel">
      <BodyShort>Er du sikker på at dette skjemaet skal avpubliseres?</BodyShort>
      <ul className="list-inline">
        <li className="list-inline-item">
          <Button variant="secondary" onClick={unpublish} loading={loading} type="button">
            Ja, avpubliser skjemaet
          </Button>
        </li>
        <li className="list-inline-item">
          <Button variant="secondary" onClick={closeModal} type="button">
            Nei
          </Button>
        </li>
      </ul>
    </Modal>
  );
};

export default ConfirmUnpublishModal;
