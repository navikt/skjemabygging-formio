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
});

const ConfirmPublishModal = ({ openModal, handleModal, form, onPublish }) => {
  const [publiserer, setPubliserer] = useState(false);
  const styles = useModalStyles();

  const onPublishClick = async (form) => {
    setPubliserer(true);
    try {
      await onPublish(form);
    } finally {
      setPubliserer(false);
      handleModal();
    }
  };
  return (
    <Modal
      className={styles.modal}
      isOpen={openModal}
      onRequestClose={handleModal}
      closeButton={true}
      contentLabel="Min modalrute"
      shouldCloseOnOverlayClick={false}
      ariaHideApp={false}
    >
      <div style={{ padding: "2rem 2.5rem" }}>Er du sikker på at dette skjemaet skal publiseres?</div>
      <ul className="list-inline">
        <li className="list-inline-item">
          <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
            Ja, publiser skjemaet
          </Knapp>
        </li>
        <li className="list-inline-item">
          <Knapp onClick={handleModal}>Nei, ikke publiser skjemaet</Knapp>
        </li>
      </ul>
    </Modal>
  );
};

export default ConfirmPublishModal;
