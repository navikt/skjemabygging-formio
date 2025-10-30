import { NavFormType, Submission, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Dispatch, SetStateAction } from 'react';
import { useAppConfig } from '../../context/config/configContext';
import { hasRelevantAttachments } from '../../util/attachment/attachmentsUtil';
import { PanelValidation } from '../../util/form/panel-validation/panelValidation';
import DigitalSubmissionButton from '../button/navigation/digital-submission/DigitalSubmissionButton';
import DigitalSubmissionWithPrompt from '../submission/DigitalSubmissionWithPrompt';

type Props = {
  form: NavFormType;
  submission?: Submission;
  panelValidationList?: PanelValidation[];
  setError: Dispatch<SetStateAction<Error | undefined>>;
  setSubmitError: Dispatch<SetStateAction<string | undefined>>;
  isValid?: (e: React.MouseEvent<HTMLElement>) => boolean;
};

export function SummaryPageNextButton({
  form,
  submission,
  panelValidationList,
  setError,
  isValid,
  setSubmitError,
}: Props) {
  const { submissionMethod } = useAppConfig();
  const submissionTypes = form.properties.submissionTypes;
  const hasAttachments = hasRelevantAttachments(form, submission ?? { data: {} });
  const canSubmit =
    !!panelValidationList && panelValidationList.every((panelValidation) => !panelValidation.hasValidationErrors);

  return (
    <>
      {canSubmit &&
      (submissionMethod === 'digital' || submissionTypesUtils.isDigitalSubmissionOnly(submissionTypes)) &&
      !hasAttachments ? (
        <DigitalSubmissionWithPrompt submission={submission} isValid={isValid} onError={setError} />
      ) : (
        <DigitalSubmissionButton
          onError={setError}
          setSubmitError={setSubmitError}
          form={form}
          isValid={isValid}
          canSubmit={canSubmit}
          submission={submission}
        />
      )}
    </>
  );
}
