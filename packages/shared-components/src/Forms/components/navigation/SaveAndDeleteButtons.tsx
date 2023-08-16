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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const styles = useStyles();

  return (
    <>
      <div className="button-row button-row__center">
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
        <Button
          loading={isSaving}
          className={"navds-button navds-button--tertiary"}
          onClick={async () => {
            setIsSaving(true);
            await updateMellomlagring(submission);
            loggNavigering({
              lenkeTekst: translate(TEXTS.grensesnitt.navigation.saveDraft),
              destinasjon: "https://www.nav.no",
            });
            setIsSaving(false);
            window.location.href = "https://www.nav.no";
          }}
        >
          <span aria-live="polite" className="navds-body-short font-bold">
            {translate(TEXTS.grensesnitt.navigation.saveDraft)}
          </span>
        </Button>
      </div>
      <Modal
        open={isDeleteModalOpen}
        ariaLabel={translate(TEXTS.grensesnitt.confirmDeletePrompt.ariaLabel)}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <BodyShort className={styles.modalBody}>{translate(TEXTS.grensesnitt.confirmDeletePrompt.body)}</BodyShort>
        <div className="button-row button-row__start">
          <Button
            variant="primary"
            onClick={() => {
              loggNavigering({
                lenkeTekst: translate(TEXTS.grensesnitt.navigation.cancelAndDelete),
                destinasjon: "https://www.nav.no",
              });
              deleteMellomlagring();
              setIsDeleteModalOpen(false);
              window.location.href = "https://www.nav.no";
            }}
          >
            {translate(TEXTS.grensesnitt.confirmDeletePrompt.confirm)}
          </Button>
          <Button
            variant="tertiary"
            onClick={() => {
              setIsDeleteModalOpen(false);
            }}
          >
            {translate(TEXTS.grensesnitt.confirmDeletePrompt.cancel)}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default SaveAndDeleteButtons;
