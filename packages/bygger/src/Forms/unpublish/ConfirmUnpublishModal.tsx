import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { Knapp } from "nav-frontend-knapper";
import { Normaltekst } from "nav-frontend-typografi";
import React, { useState } from "react";
import Modal from "../../components/nav/Modal";

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
    <Modal isOpen={openModal} onRequestClose={closeModal} contentLabel="Avpubliseringsadvarsel">
      <Normaltekst className="margin-bottom-double">Er du sikker på at dette skjemaet skal avpubliseres?</Normaltekst>
      <ul className="list-inline">
        <li className="list-inline-item">
          <Knapp onClick={unpublish} spinner={loading}>
            Ja, avpubliser skjemaet
          </Knapp>
        </li>
        <li className="list-inline-item">
          <Knapp onClick={closeModal}>Nei</Knapp>
        </li>
      </ul>
    </Modal>
  );
};

export default ConfirmUnpublishModal;
