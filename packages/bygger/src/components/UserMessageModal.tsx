import { BodyShort, Button } from "@navikt/ds-react";
import { Modal, makeStyles } from "@navikt/skjemadigitalisering-shared-components";
import { useState } from "react";

interface UserMessageModalProps {
  userMessage: string;
  closeModal: () => void;
  buttonText?: string;
  ariaLabel?: string;
}

const useModalStyles = makeStyles({
  modal_button: {
    float: "right",
  },
});

const UserMessageModal = ({
  userMessage,
  closeModal,
  buttonText = "Ok",
  ariaLabel = "Brukermelding",
}: UserMessageModalProps) => {
  const styles = useModalStyles();
  return (
    <Modal open={!!userMessage} onClose={closeModal} ariaLabel={ariaLabel}>
      <BodyShort className="mb">{userMessage}</BodyShort>
      <Button variant="secondary" type="button" className={styles.modal_button} onClick={closeModal}>
        {buttonText}
      </Button>
    </Modal>
  );
};

export const useUserMessage = (): [string, (string) => void, () => void] => {
  const [userMessage, setUserMessage] = useState<string>("");
  const showUserMessage = (message: string) => setUserMessage(message);
  const closeModal = () => setUserMessage("");
  return [userMessage, showUserMessage, closeModal];
};

export default UserMessageModal;
