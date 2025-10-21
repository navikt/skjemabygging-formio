import { NavFormType, Submission, submissionTypesUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Dispatch, SetStateAction } from 'react';
import { useLocation } from 'react-router';
import { useAppConfig } from '../../context/config/configContext';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { useLanguages } from '../../index';
import { hasRelevantAttachments } from '../../util/attachment/attachmentsUtil';
import { PanelValidation } from '../../util/form/panel-validation/panelValidation';
import DigitalSubmissionButton from '../button/navigation/digital-submission/DigitalSubmissionButton';
import DigitalSubmissionWithPrompt from '../submission/DigitalSubmissionWithPrompt';
import { NextButton } from './NextButton';

type Props = {
  form: NavFormType;
  submission?: Submission;
  panelValidationList?: PanelValidation[];
  setError: Dispatch<SetStateAction<Error | undefined>>;
  isValid?: (e: React.MouseEvent<HTMLElement>) => boolean;
};

export function SummaryPageNextButton({ form, submission, panelValidationList, setError, isValid }: Props) {
  const { submissionMethod, app } = useAppConfig();
  const { search } = useLocation();
  const { translate } = useLanguages();
  const { isMellomlagringActive } = useSendInn();
  const submissionTypes = form.properties.submissionTypes;
  const hasAttachments = hasRelevantAttachments(form, submission ?? { data: {} });
  const canSubmit =
    !!panelValidationList && panelValidationList.every((panelValidation) => !panelValidation.hasValidationErrors);
  const sendIPosten =
    (submissionTypesUtils.isPaperSubmission(submissionTypes) && (submissionMethod === 'paper' || app === 'bygger')) ||
    submissionTypesUtils.isPaperSubmissionOnly(submissionTypes);

  return (
    <>
      {canSubmit && sendIPosten && (
        <NextButton
          label={{
            paper: translate(TEXTS.grensesnitt.moveForward),
          }}
          href={{
            paper: `/${form.path}/send-i-posten${search}`,
          }}
        />
      )}

      {canSubmit &&
        (submissionMethod === 'digital' || submissionTypesUtils.isDigitalSubmissionOnly(submissionTypes)) &&
        (hasAttachments ? (
          <DigitalSubmissionButton withIcon submission={submission} isValid={isValid} onError={setError}>
            {translate(
              isMellomlagringActive ? TEXTS.grensesnitt.navigation.saveAndContinue : TEXTS.grensesnitt.moveForward,
            )}
          </DigitalSubmissionButton>
        ) : (
          <DigitalSubmissionWithPrompt submission={submission} isValid={isValid} onError={setError} />
        ))}

      {canSubmit && submissionMethod === 'digitalnologin' && (
        <DigitalSubmissionButton withIcon submission={submission} isValid={isValid} onError={setError}>
          {translate(TEXTS.grensesnitt.submitToNavPrompt.open)}
        </DigitalSubmissionButton>
      )}
      {submissionTypesUtils.isNoneSubmission(submissionTypes) && (
        <NextButton
          label={{
            digital: translate(TEXTS.grensesnitt.moveForward),
            paper: translate(TEXTS.grensesnitt.moveForward),
            digitalnologin: translate(TEXTS.grensesnitt.moveForward),
          }}
          href={{
            digital: `/${form.path}/ingen-innsending${search}`,
            paper: `/${form.path}/ingen-innsending${search}`,
            digitalnologin: `/${form.path}/ingen-innsending${search}`,
          }}
        />
      )}
    </>
  );
}
