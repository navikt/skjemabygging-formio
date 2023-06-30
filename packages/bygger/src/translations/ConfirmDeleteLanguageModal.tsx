import { BodyShort, Button } from "@navikt/ds-react";
import { Modal, makeStyles } from "@navikt/skjemadigitalisering-shared-components";

type ConfirmDeleteLanguageModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  onConfirm: () => void;
  language: string;
  isGlobal: boolean;
};

const useStyles = makeStyles({
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
      onClose={closeModal}
      open={isOpen}
      ariaLabel="Bekreft sletting av språk"
      title="Er du sikker på at du ønsker å slette språket?"
    >
      <BodyShort className="mb-4">{isGlobal ? modalTextForGlobalTranslations : modalTextForFormTranslations}</BodyShort>
      <div className={styles.buttonRow}>
        <Button variant="secondary" className={styles.modal_button} onClick={closeModal} type="button">
          Avbryt
        </Button>
        <Button className={styles.modal_button} onClick={onConfirm}>
          Slett språk
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteLanguageModal;
