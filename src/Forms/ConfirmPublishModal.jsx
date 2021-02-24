import Modal from "nav-frontend-modal";
import { Knapp } from "nav-frontend-knapper";
import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";

const useModalStyles = makeStyles({
  modal: {
    width: "50rem",
    minHeight: "13rem",
    height: "auto",
    maxWidth: "90%",
  },
  modal_text: {
    padding: "2rem 2.5rem",
  },
});

const ConfirmPublishModal = ({ openModal, closeModal, form, onPublish }) => {
  const [publiserer, setPubliserer] = useState(false);
  const styles = useModalStyles();

  const onPublishClick = async (form) => {
    setPubliserer(true);
    try {
      await onPublish(form);
    } finally {
      setPubliserer(false);
      closeModal();
    }
  };
  return (
    <Modal
      className={styles.modal}
      isOpen={openModal}
      onRequestClose={closeModal}
      closeButton={true}
      contentLabel="Publiseringsadvarsel"
      shouldCloseOnOverlayClick={false}
      ariaHideApp={false}
    >
      <div className={styles.modal_text}>Er du sikker på at dette skjemaet skal publiseres?</div>
      <ul className="list-inline">
        <li className="list-inline-item">
          <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
            Ja, publiser skjemaet
          </Knapp>
        </li>
        <li className="list-inline-item">
          <Knapp onClick={closeModal}>Nei, ikke publiser skjemaet</Knapp>
        </li>
      </ul>
    </Modal>
  );
};

export default ConfirmPublishModal;
