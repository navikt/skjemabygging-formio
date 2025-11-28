import { Alert } from '@navikt/ds-react';
import {
  NavFormType,
  navFormUtils,
  PanelValidation,
  Submission,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLocation } from 'react-router';
import EditAnswersButton from '../../../components/button/navigation/edit-answers/EditAnswersButton';
import FormError from '../../../components/form/FormError';
import FormSavedStatus from '../../../components/form/FormSavedStatus';
import { CancelAndDeleteButton } from '../../../components/navigation/CancelAndDeleteButton';
import NavigationButtonRow from '../../../components/navigation/NavigationButtonRow';
import { PreviousButton } from '../../../components/navigation/PreviousButton';
import { SaveButton } from '../../../components/navigation/SaveButton';
import { SummaryPageNextButton } from '../../../components/navigation/SummaryPageNextButton';
import { useAppConfig } from '../../../context/config/configContext';
import { useForm } from '../../../context/form/FormContext';
import { useLanguages } from '../../../context/languages';
import { useSendInn } from '../../../context/sendInn/sendInnContext';

export interface Props {
  form: NavFormType;
  submission?: Submission;
  panelValidationList?: PanelValidation[];
  isValid: (e: React.MouseEvent<HTMLElement>) => boolean;
}

const SummaryPageNavigation = ({ form, submission, panelValidationList, isValid }: Props) => {
  const { mellomlagringError } = useSendInn();
  const { submissionMethod } = useAppConfig();
  const [error, setError] = useState<Error>();
  const [validationError, setValidationError] = useState<string | undefined>();
  const { search } = useLocation();
  const { translate } = useLanguages();
  const { activeComponents } = useForm();

  const hasValidationErrors = panelValidationList?.some((panelValidation) => panelValidation.hasValidationErrors);

  const getPreviousPathname = () => {
    if (submissionMethod === 'digitalnologin' && navFormUtils.hasAttachment(form)) {
      return '../vedlegg';
    }

    const lastComponent = activeComponents.length > 0 ? activeComponents[activeComponents.length - 1] : undefined;
    if (lastComponent) {
      return `../${lastComponent.key}`;
    }

    return '..';
  };

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
            setSubmitError={setValidationError}
          />
        }
        previousButton={
          hasValidationErrors ? (
            <EditAnswersButton form={form} panelValidationList={panelValidationList} />
          ) : (
            <PreviousButton
              label={{
                default: translate(TEXTS.grensesnitt.navigation.previous),
              }}
              href={{
                default: { pathname: getPreviousPathname(), search },
              }}
            />
          )
        }
        saveButton={<SaveButton submission={submission} />}
        cancelButton={<CancelAndDeleteButton />}
        errorMessage={validationError}
      />
    </>
  );
};

export default SummaryPageNavigation;
