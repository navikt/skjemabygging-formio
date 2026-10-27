import { Form, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router';
import { DevtoolsConnection } from '../context/devtools/devtoolsSession';
import { LanguageConfig } from '../context/language/LanguageContext';
import { RuntimeServices } from '../context/runtime-services/RuntimeServicesContext';
import { IntegrationContextValue } from './context/integration/IntegrationContext';
import FyllutFormFlow from './form-flow/FyllutFormFlow';
import FyllutFormProviders from './providers/FyllutFormProviders';

interface Props {
  form: Form;
  initialSubmission?: Submission;
  initialInnsendingsId?: string;
  submissionMethod?: SubmissionMethod;
  integration: IntegrationContextValue;
  language: LanguageConfig;
  services: RuntimeServices;
  /** Connection to a state inspector. The host decides when to provide it; omit it in production. */
  devtools?: DevtoolsConnection;
}

const RenderForm = ({
  form,
  initialSubmission,
  initialInnsendingsId,
  submissionMethod,
  integration,
  language,
  services,
  devtools,
}: Props) => {
  const { state } = useLocation();
  const initialPagesWithErrors =
    typeof state === 'object' && state && 'validationErrorPages' in state && Array.isArray(state.validationErrorPages)
      ? state.validationErrorPages
      : undefined;

  return (
    <FyllutFormProviders devtools={devtools} integration={integration} language={language} services={services}>
      <FyllutFormFlow
        form={form}
        initialSubmission={initialSubmission}
        initialInnsendingsId={initialInnsendingsId}
        initialPagesWithErrors={initialPagesWithErrors}
        requestedSubmissionMethod={submissionMethod}
        currentLanguage={language.currentLanguage}
      />
    </FyllutFormProviders>
  );
};

export default RenderForm;
export type { Props as RenderFormProps };
