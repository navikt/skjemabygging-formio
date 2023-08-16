import { BodyShort, Button } from "@navikt/ds-react";
import { Submission, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useState } from "react";
import { useAmplitude } from "../../../context/amplitude";
import { useLanguages } from "../../../context/languages";
import { useSendInn } from "../../../context/sendInn/sendInnContext";
import { Modal } from "../../../index";
import makeStyles from "../../../util/jss";

const useStyles = makeStyles({
  modalBody: {
    paddingTop: "1.1rem",
    paddingBottom: "4rem",
    fontSize: "1.25rem",
  },
});

interface Props {
  submission?: Submission;
}

const SaveAndDeleteButtons = ({ submission }: Props) => {
  const { translate } = useLanguages();
  const { loggNavigering } = useAmplitude();
  const { updateMellomlagring, deleteMellomlagring } = useSendInn();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const styles = useStyles();

  const onClickSave = async () => {
    try {
      if (!submission) {
        return;
      }
      setIsSaving(true);
      await updateMellomlagring(submission);
      loggNavigering({
        lenkeTekst: translate(TEXTS.grensesnitt.navigation.saveDraft),
        destinasjon: "https://www.nav.no",
      });
      setIsSaving(false);
      setIsSaveModalOpen(false);
      window.location.href = "https://www.nav.no";
    } catch (error: any) {
      //TODO: Vis feilmelding
    }
  };

  const onClickDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteMellomlagring();
      loggNavigering({
        lenkeTekst: translate(TEXTS.grensesnitt.navigation.cancelAndDelete),
        destinasjon: "https://www.nav.no",
      });
      setIsDeleteModalOpen(false);
      setIsDeleting(false);
      window.location.href = "https://www.nav.no";
    } catch (error: any) {}
  };

  return (
    <>
      <div className="button-row">
        <Button
          className={"navds-button navds-button--tertiary"}
          onClick={() => {
            setIsDeleteModalOpen(true);
          }}
        >
          <span aria-live="polite" className="navds-body-short font-bold">
            {translate(TEXTS.grensesnitt.navigation.cancelAndDelete)}
          </span>
        </Button>
        <Button className={"navds-button navds-button--tertiary"} onClick={() => setIsSaveModalOpen(true)}>
          <span aria-live="polite" className="navds-body-short font-bold">
            {translate(TEXTS.grensesnitt.navigation.saveDraft)}
          </span>
        </Button>
      </div>
      <Modal
        title={translate(TEXTS.grensesnitt.confirmSavePrompt.title)}
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      >
        <BodyShort className={styles.modalBody}>{translate(TEXTS.grensesnitt.confirmSavePrompt.body)}</BodyShort>
        <div className="button-row">
          <Button variant="primary" onClick={onClickSave} loading={isSaving}>
            {translate(TEXTS.grensesnitt.confirmSavePrompt.confirm)}
          </Button>
          <Button variant="tertiary" onClick={() => setIsSaveModalOpen(false)}>
            {translate(TEXTS.grensesnitt.confirmSavePrompt.cancel)}
          </Button>
        </div>
      </Modal>
      <Modal
        title={translate(TEXTS.grensesnitt.confirmDeletePrompt.title)}
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <BodyShort className={styles.modalBody}>{translate(TEXTS.grensesnitt.confirmDeletePrompt.body)}</BodyShort>
        <div className="button-row">
          <Button variant="danger" onClick={onClickDelete} loading={isDeleting}>
            {translate(TEXTS.grensesnitt.confirmDeletePrompt.confirm)}
          </Button>
          <Button variant="tertiary" onClick={() => setIsDeleteModalOpen(false)}>
            {translate(TEXTS.grensesnitt.confirmDeletePrompt.cancel)}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default SaveAndDeleteButtons;
