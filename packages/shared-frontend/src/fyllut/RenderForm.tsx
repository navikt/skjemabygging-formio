import { Form, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router';
import { LanguageConfig } from '../context/language/LanguageContext';
import { RuntimeServices } from '../context/runtime-services/RuntimeServicesContext';
import { FyllutContextValue } from './context/fyllut/FyllutContext';
import FyllutFormFlow from './form-flow/FyllutFormFlow';
import FyllutFormProviders from './providers/FyllutFormProviders';

interface Props {
  form: Form;
  initialSubmission?: Submission;
  initialInnsendingsId?: string;
  submissionMethod?: SubmissionMethod;
  fyllut: FyllutContextValue;
  language: LanguageConfig;
  services: RuntimeServices;
}

const RenderForm = ({
  form,
  initialSubmission,
  initialInnsendingsId,
  submissionMethod,
  fyllut,
  language,
  services,
}: Props) => {
  const { state } = useLocation();
  const initialPagesWithErrors =
    typeof state === 'object' && state && 'validationErrorPages' in state && Array.isArray(state.validationErrorPages)
      ? state.validationErrorPages
      : undefined;

  return (
    <FyllutFormProviders fyllut={fyllut} language={language} services={services}>
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
