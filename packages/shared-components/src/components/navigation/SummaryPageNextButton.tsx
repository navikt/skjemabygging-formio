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
            default: translate(TEXTS.grensesnitt.navigation.next),
          }}
          href={{
            default: { pathname: `../send-i-posten`, search },
          }}
        />
      )}

      {canSubmit &&
        (submissionMethod === 'digital' || submissionTypesUtils.isDigitalSubmissionOnly(submissionTypes)) &&
        (hasAttachments ? (
          <DigitalSubmissionButton withIcon submission={submission} isValid={isValid} onError={setError}>
            {translate(
              isMellomlagringActive ? TEXTS.grensesnitt.navigation.saveAndContinue : TEXTS.grensesnitt.navigation.next,
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
            default: translate(TEXTS.grensesnitt.navigation.next),
          }}
          href={{
            default: `/${form.path}/ingen-innsending${search}`,
          }}
        />
      )}
    </>
  );
}
