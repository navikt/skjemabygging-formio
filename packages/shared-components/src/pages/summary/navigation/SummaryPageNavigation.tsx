import { Alert } from '@navikt/ds-react';
import { NavFormType, Submission, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useAppConfig } from '../../../context/config/configContext';
import { useSendInn } from '../../../context/sendInn/sendInnContext';
import { PanelValidation } from '../../../util/form/panel-validation/panelValidation';
import EditAnswersButton from '../../button/navigation/edit-answers/EditAnswersButton';
import FormError from '../../form/FormError';
import FormSavedStatus from '../../form/FormSavedStatus';
import { CancelButton } from '../../navigation/CancelButton';
import { NavigationButtonRow } from '../../navigation/NavigationButtonRow';
import { SaveButton } from '../../navigation/SaveButton';
import { SummaryPageNextButton } from '../../navigation/SummaryPageNextButton';

export interface Props {
  form: NavFormType;
  submission?: Submission;
  panelValidationList?: PanelValidation[];
  isValid: (e: React.MouseEvent<HTMLElement>) => boolean;
}

const SummaryPageNavigation = ({ form, submission, panelValidationList, isValid }: Props) => {
  const { mellomlagringError } = useSendInn();
  const [error, setError] = useState<Error>();
  const { submissionMethod, app } = useAppConfig();

  const submissionTypes = form.properties.submissionTypes;
  const canSubmit = !error &&
    !!panelValidationList && panelValidationList.every((panelValidation) => !panelValidation.hasValidationErrors);
  const sendIPosten =
    (submissionTypesUtils.isPaperSubmission(submissionTypes) && (submissionMethod === 'paper' || app === 'bygger')) ||
    submissionTypesUtils.isPaperSubmissionOnly(submissionTypes);

  const shouldRenderNextButton =
    (canSubmit && sendIPosten) ||
    (canSubmit && (submissionMethod === 'digital' || submissionTypesUtils.isDigitalSubmissionOnly(submissionTypes))) ||
    (canSubmit && submissionMethod === 'digitalnologin') ||
    submissionTypesUtils.isNoneSubmission(submissionTypes);

  return (
    <>
      <FormError error={mellomlagringError} />

      {error && (
        <Alert variant="error" className="mb" data-testid="error-message">
          {error.message}
        </Alert>
      )}

      <FormSavedStatus submission={submission} />

      <NavigationButtonRow
        cancelButton={<CancelButton />}
        saveButton={<SaveButton submission={submission} />}
        previousButton={<EditAnswersButton form={form} panelValidationList={panelValidationList} />}
        nextButton={
          shouldRenderNextButton && (
            <SummaryPageNextButton
              form={form}
              submission={submission}
              panelValidationList={panelValidationList}
              setError={setError}
              isValid={isValid}
            />
          )
        }
      />
    </>
  );
};

export default SummaryPageNavigation;
