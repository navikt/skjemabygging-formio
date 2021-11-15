import { makeStyles } from "@material-ui/styles";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import Modal from "nav-frontend-modal";
import { Normaltekst, Undertittel } from "nav-frontend-typografi";
import React from "react";

type ConfirmDeleteLanguageModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  onConfirm: () => void;
  language: string;
  isGlobal: boolean;
};

const useStyles = makeStyles({
  modal: {
    width: "50rem",
    minHeight: "13rem",
    height: "auto",
    maxWidth: "90%",
    padding: "2rem 2.5rem",
  },
  buttonRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: "1.5rem",
    margin: "0 auto",
  },
  modal_button: {},
});

const ConfirmDeleteLanguageModal = ({
  isOpen,
  closeModal,
  onConfirm,
  language,
  isGlobal = false,
}: ConfirmDeleteLanguageModalProps) => {
  const modalTextForGlobalTranslations = `Ved å klikke på "slett språk" fjerner du alle globale oversettelser til ${language?.toLowerCase()}, for godt.
        Denne handlingen kan ikke angres.`;
  const modalTextForFormTranslations = `Ved å klikke på "slett språk" fjerner du alle oversettelser til ${language?.toLowerCase()} for dette skjemaet, for godt.
        Denne handlingen kan ikke angres.`;

  const styles = useStyles();
  return (
    <Modal
      className={styles.modal}
      onRequestClose={closeModal}
      isOpen={isOpen}
      contentLabel={"Bekreft sletting av språk"}
      closeButton={true}
      shouldCloseOnOverlayClick={false}
      ariaHideApp={false}
    >
      <Undertittel className="margin-bottom-double">Er du sikker på at du ønsker å slette språket?</Undertittel>
      <Normaltekst className="margin-bottom-default">
        {isGlobal ? modalTextForGlobalTranslations : modalTextForFormTranslations}
      </Normaltekst>
      <div className={styles.buttonRow}>
        <Knapp className={styles.modal_button} onClick={closeModal}>
          Avbryt
        </Knapp>
        <Hovedknapp className={styles.modal_button} onClick={onConfirm}>
          Slett språk
        </Hovedknapp>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteLanguageModal;
