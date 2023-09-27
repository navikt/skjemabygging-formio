import { Button } from "@navikt/ds-react";
import { Submission, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useState } from "react";
import { useAmplitude } from "../../../context/amplitude";
import { useLanguages } from "../../../context/languages";
import { useSendInn } from "../../../context/sendInn/sendInnContext";
import ConfirmationModal from "./ConfirmationModal";
import urlUtils from "../../../util/url";

interface Props {
  submission?: Submission;
  onError: Function;
}

const SaveAndDeleteButtons = ({ submission, onError }: Props) => {
  const { translate } = useLanguages();
  const { loggNavigering } = useAmplitude();
  const { updateMellomlagring, deleteMellomlagring } = useSendInn();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const exitUrl = urlUtils.getExitUrl(window.location.href);

  const saveSubmission = async () => {
    if (!submission) {
      setIsSaveModalOpen(false);
      throw new Error("Kunne ikke lagre. Innsendingen er tom.");
    }
    await updateMellomlagring(submission);
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.navigation.saveDraft),
      destinasjon: exitUrl,
    });
  };

  const deleteSubmission = async () => {
    await deleteMellomlagring();
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.navigation.cancelAndDelete),
      destinasjon: exitUrl,
    });
    setIsDeleteModalOpen(false);
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
      <ConfirmationModal
        open={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={saveSubmission}
        onError={onError}
        confirmType={"primary"}
        texts={TEXTS.grensesnitt.confirmSavePrompt}
        exitUrl={exitUrl}
      />
      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteSubmission}
        onError={onError}
        confirmType={"danger"}
        texts={TEXTS.grensesnitt.confirmDeletePrompt}
        exitUrl={exitUrl}
      />
    </>
  );
};

export default SaveAndDeleteButtons;
