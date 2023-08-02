import { Button } from "@navikt/ds-react";
import { Submission } from "@navikt/skjemadigitalisering-shared-domain";
import { useState } from "react";
import { useAppConfig } from "../../configContext";
import { useAmplitude } from "../../context/amplitude";
import { useSendInn } from "../../context/sendInn/sendInnContext";
import { addBeforeUnload, removeBeforeUnload } from "../../util/unload";

export interface Props {
  submission?: Submission;
  isValid?: (e: React.MouseEvent<HTMLElement>) => boolean;
  onError: Function;
  onSuccess?: Function;
  children: string;
}

const noop = () => {};

const DigitalSubmissionButton = ({ submission, isValid, onError, onSuccess = noop, children }: Props) => {
  const { loggNavigering } = useAmplitude();
  const { app } = useAppConfig();
  const { submitSoknad } = useSendInn();
  const [loading, setLoading] = useState(false);
  const sendInn = async (e) => {
    if (isValid && !isValid(e)) {
      return;
    }

    if (app === "bygger") {
      onError(new Error("Digital innsending er ikke støttet ved forhåndsvisning i byggeren."));
      return;
    }

    //TODO: Sjekk om denne kan løses et annet sted og gi en god tilbakemelding
    if (!submission) {
      onError(new Error("Innsendingen er tom"));
      return;
    }

    try {
      setLoading(true);
      loggNavigering({ lenkeTekst: children, destinasjon: "/sendinn" });
      removeBeforeUnload();
      const response = await submitSoknad(submission);
      onSuccess(response);
    } catch (err: any) {
      addBeforeUnload();
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={sendInn} loading={loading}>
      {children}
    </Button>
  );
};

export default DigitalSubmissionButton;
