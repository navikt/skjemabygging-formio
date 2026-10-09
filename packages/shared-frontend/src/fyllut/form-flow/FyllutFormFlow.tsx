import { Form, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { UrlLanguageSelector } from '../../app/language/UrlLanguageSelector';
import { FormDefinitionProvider } from '../../context/form-definition/FormDefinitionContext';
import { SubmissionStateProvider } from '../../context/state/SubmissionStateContext';
import FyllutFormActionsProvider from '../context/form-actions/FyllutFormActionsProvider';
import { NologinTokenProvider } from '../context/nologin-token/NologinTokenContext';
import FormLayout from '../layout/FormLayout';
import { resolveDefaultSubmissionMethod } from '../submission-method/submissionMethodResolution';
import SubmissionMethodSelection from '../submission-method/SubmissionMethodSelection';
import FyllutValidationProvider from '../validation/FyllutValidationProvider';
import FormRouter from './FormRouter';
import FyllutAttachmentProvider from './FyllutAttachmentProvider';
import { prepareInitialSubmission } from './prepareInitialSubmission';

interface Props {
  form: Form;
  initialSubmission?: Submission;
  initialInnsendingsId?: string;
  initialPagesWithErrors?: string[];
  requestedSubmissionMethod?: SubmissionMethod;
  currentLanguage: string;
}

const FyllutFormFlow = ({
  form,
  initialSubmission,
  initialInnsendingsId,
  initialPagesWithErrors,
  requestedSubmissionMethod,
  currentLanguage,
}: Props) => {
  const { search } = useLocation();
  const [receiptPdf, setReceiptPdf] = useState<Blob>();
  const hydratedInitialSubmission = useMemo(
    () =>
      prepareInitialSubmission(
        form,
        initialSubmission,
        currentLanguage,
        requestedSubmissionMethod ?? resolveDefaultSubmissionMethod(form.properties.submissionTypes),
      ),
    [currentLanguage, form, initialSubmission, requestedSubmissionMethod],
  );
  const defaultSubmissionMethod = resolveDefaultSubmissionMethod(form.properties.submissionTypes);
  const submissionMethodFromUrl = new URLSearchParams(search).has('sub') ? requestedSubmissionMethod : undefined;
  const submissionMethod = submissionMethodFromUrl ?? defaultSubmissionMethod;
  const shouldRenderFormFlow = submissionMethod !== undefined || (form.properties.submissionTypes?.length ?? 0) === 0;

  return (
    <SubmissionStateProvider initialSubmission={hydratedInitialSubmission}>
      <FormDefinitionProvider form={form} submissionMethod={submissionMethod}>
        <NologinTokenProvider form={form}>
          <FyllutValidationProvider initialPagesWithErrors={initialPagesWithErrors}>
            <FyllutAttachmentProvider>
              <FyllutFormActionsProvider
                form={form}
                initialInnsendingsId={initialInnsendingsId}
                setReceiptPdf={setReceiptPdf}
              >
                <FormLayout>
                  <UrlLanguageSelector />
                  {shouldRenderFormFlow ? (
                    <FormRouter form={form} receiptPdf={receiptPdf} />
                  ) : (
                    <SubmissionMethodSelection form={form} />
                  )}
                </FormLayout>
              </FyllutFormActionsProvider>
            </FyllutAttachmentProvider>
          </FyllutValidationProvider>
        </NologinTokenProvider>
      </FormDefinitionProvider>
    </SubmissionStateProvider>
  );
};

export default FyllutFormFlow;
