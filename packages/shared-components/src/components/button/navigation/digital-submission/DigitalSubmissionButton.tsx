import { NavFormType, Submission, submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Dispatch, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppConfig } from '../../../../context/config/configContext';
import { useLanguages } from '../../../../context/languages';
import { useSendInn } from '../../../../context/sendInn/sendInnContext';
import { NextButton } from '../../../navigation/NextButton';

export interface Props {
  form?: NavFormType;
  submission?: Submission;
  isValid?: (e: React.MouseEvent<HTMLElement>) => boolean;
  onError: (err: Error) => void;
  onDone?: () => void;
  canSubmit?: boolean;
  setSubmitError: Dispatch<SetStateAction<string | undefined>>;
}

const DigitalSubmissionButton = ({
  submission,
  isValid,
  onError,
  onDone = () => {},
  canSubmit,
  setSubmitError,
  form,
}: Props) => {
  const { app, submissionMethod } = useAppConfig();
  const navigate = useNavigate();
  const { translate } = useLanguages();
  const { submitSoknad } = useSendInn();
  const [loading, setLoading] = useState(false);
  const submissionTypes = form?.properties.submissionTypes;
  const sendIPosten =
    (submissionTypesUtils.isPaperSubmission(submissionTypes) && (submissionMethod === 'paper' || app === 'bygger')) ||
    submissionTypesUtils.isPaperSubmissionOnly(submissionTypes);

  const sendInn = async (e) => {
    if (!canSubmit || !submission || !submission.data) {
      setSubmitError(translate(TEXTS.grensesnitt.navigation.summaryPageError));
      return;
    }

    if (isValid && !isValid(e)) {
      return;
    }

    if (canSubmit && sendIPosten) {
      navigate({ pathname: `../send-i-posten` }); // TODO innsen-innsending trenger håndtering. Typ det samme her
    }

    if (app === 'bygger') {
      onError(new Error('Digital innsending er ikke støttet ved forhåndsvisning i byggeren.'));
      return;
    }

    try {
      setLoading(true);
      await submitSoknad(submission);
    } catch (err: any) {
      onError(err);
    } finally {
      setLoading(false);
      onDone();
    }
  };

  return (
    <NextButton
      label={{
        digital: translate(TEXTS.grensesnitt.navigation.saveAndContinue),
        digitalnologin: translate(TEXTS.grensesnitt.navigation.sendToNav),
        default: translate(TEXTS.grensesnitt.navigation.instructions),
      }}
      onClick={{
        default: async (e) => sendInn(e),
      }}
      variant={canSubmit ? 'primary' : 'secondary'}
      hideIcon={submissionMethod === 'digitalnologin'}
      loading={loading}
    />
  );
};

export default DigitalSubmissionButton;
