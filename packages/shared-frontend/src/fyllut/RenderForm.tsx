import { Form, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router';
import { LanguageContextValue } from '../context/language/LanguageContext';
import { FyllutContextValue } from './context/fyllut/FyllutContext';
import FyllutFormFlow from './form-flow/FyllutFormFlow';
import FyllutFormProviders from './providers/FyllutFormProviders';

interface Props {
  form: Form;
  initialSubmission?: Submission;
  initialInnsendingsId?: string;
  submissionMethod?: SubmissionMethod;
  fyllut: FyllutContextValue;
  language: LanguageContextValue;
}

const RenderForm = ({ form, initialSubmission, initialInnsendingsId, submissionMethod, fyllut, language }: Props) => {
  const { state } = useLocation();
  const initialPagesWithErrors =
    typeof state === 'object' && state && 'validationErrorPages' in state && Array.isArray(state.validationErrorPages)
      ? state.validationErrorPages
      : undefined;
  const initialNologinToken =
    typeof state === 'object' && state && 'nologinToken' in state && typeof state.nologinToken === 'string'
      ? state.nologinToken
      : undefined;

  return (
    <FyllutFormProviders fyllut={fyllut} language={language}>
      <FyllutFormFlow
        form={form}
        initialSubmission={initialSubmission}
        initialInnsendingsId={initialInnsendingsId}
        initialNologinToken={initialNologinToken}
        initialPagesWithErrors={initialPagesWithErrors}
        requestedSubmissionMethod={submissionMethod}
        currentLanguage={language.currentLanguage}
      />
    </FyllutFormProviders>
  );
};

export default RenderForm;
export type { Props as RenderFormProps };
