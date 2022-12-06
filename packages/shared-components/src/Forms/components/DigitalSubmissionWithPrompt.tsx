import { makeStyles } from "@material-ui/styles";
import { BodyShort, Button } from "@navikt/ds-react";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import React, { useState } from "react";
import Modal from "../../components/modal/Modal";
import { useLanguages } from "../../context/languages";
import DigitalSubmissionButton from "./DigitalSubmissionButton";

const useStyles = makeStyles({
  body: {
    paddingTop: "1.1rem",
    paddingBottom: "4rem",
    fontSize: "1.25rem",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
});

export interface Props {
  form: object;
  submission: object;
  translations: object;
  onError: (err: Error) => void;
}

const DigitalSubmissionWithPrompt = ({ form, submission, translations, onError }: Props) => {
  const { translate } = useLanguages();
  const [isOpen, setIsOpen] = useState(false);

  const styles = useStyles();

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{translate(TEXTS.grensesnitt.submitToNav)}</Button>
      <Modal open={isOpen} ariaLabel="Modal demo" onClose={() => setIsOpen(false)}>
        <BodyShort className={styles.body}>Er du sikker på at du vil sende søknaden nå?</BodyShort>
        <div className={styles.buttonRow}>
          <DigitalSubmissionButton
            form={form}
            submission={submission}
            translations={translations}
            onError={(err) => {
              onError(err.message);
              setIsOpen(false);
            }}
          />
          <Button
            variant="tertiary"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Avbryt
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default DigitalSubmissionWithPrompt;
