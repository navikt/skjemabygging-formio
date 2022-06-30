import { makeStyles } from "@material-ui/styles";
import NavModal from "nav-frontend-modal";
import React from "react";

const useModalStyles = makeStyles({
  modal: {
    width: "50rem",
    minHeight: "13rem",
    height: "auto",
    maxWidth: "90%",
    padding: "2rem 2.5rem",
  },
});

interface Props {
  contentLabel: string;
  onRequestClose: () => void;
  isOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen = false, contentLabel, onRequestClose, className, children }: Props) => {
  const styles = useModalStyles();

  return (
    <>
      <NavModal
        isOpen={isOpen}
        contentLabel={contentLabel}
        onRequestClose={onRequestClose}
        className={className ?? styles.modal}
        closeButton={true}
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
      >
        {children}
      </NavModal>
    </>
  );
};

export default Modal;
