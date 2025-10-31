import { Alert } from '@navikt/ds-react';
import { NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import EditAnswersButton from '../../../components/button/navigation/edit-answers/EditAnswersButton';
import FormError from '../../../components/form/FormError';
import FormSavedStatus from '../../../components/form/FormSavedStatus';
import { CancelButton } from '../../../components/navigation/CancelButton';
import { NavigationButtonRow } from '../../../components/navigation/NavigationButtonRow';
import { SaveButton } from '../../../components/navigation/SaveButton';
import { SummaryPageNextButton } from '../../../components/navigation/SummaryPageNextButton';
import { useSendInn } from '../../../context/sendInn/sendInnContext';
import { PanelValidation } from '../../../util/form/panel-validation/panelValidation';

export interface Props {
  form: NavFormType;
  submission?: Submission;
  panelValidationList?: PanelValidation[];
  isValid: (e: React.MouseEvent<HTMLElement>) => boolean;
}

const SummaryPageNavigation = ({ form, submission, panelValidationList, isValid }: Props) => {
  const { mellomlagringError } = useSendInn();
  const [error, setError] = useState<Error>();

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
        nextButton={
          <SummaryPageNextButton
            form={form}
            submission={submission}
            panelValidationList={panelValidationList}
            setError={setError}
            isValid={isValid}
          />
        }
        previousButton={<EditAnswersButton form={form} panelValidationList={panelValidationList} />}
        saveButton={<SaveButton submission={submission} />}
        cancelButton={<CancelButton />}
      />
    </>
  );
};

export default SummaryPageNavigation;
