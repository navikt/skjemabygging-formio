import { Form, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLocation } from 'react-router';
import { hydrateLegacyAttachments } from '../../context/attachment/attachmentData';
import { applyDefaultValuesToSubmission } from '../../context/form-definition/defaultValues';
import { FormDefinitionProvider } from '../../context/form-definition/FormDefinitionContext';
import { applyPrefilledValuesToSubmission } from '../../context/form-definition/prefillSubmission';
import { SubmissionStateProvider } from '../../context/state/SubmissionStateContext';
import { SubmissionMethodProvider } from '../../context/submission-method/SubmissionMethodContext';
import { ValidationProvider } from '../../context/validation/ValidationContext';
import { AttachmentUploadProvider } from '../attachments/context/AttachmentUploadContext';
import FyllutFormActionsProvider from '../context/form-actions/FyllutFormActionsProvider';
import { NologinTokenProvider } from '../context/nologin-token/NologinTokenContext';
import FormLanguageSelector from '../language/FormLanguageSelector';
import FormHeader from '../layout/FormHeader';
import FormLayout from '../layout/FormLayout';
import { resolveDefaultSubmissionMethod } from '../submission-method/submissionMethodResolution';
import SubmissionMethodSelection from '../submission-method/SubmissionMethodSelection';
import FormRouter from './FormRouter';

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
  const hydratedInitialSubmission = applyDefaultValuesToSubmission(
    form,
    applyPrefilledValuesToSubmission(form, hydrateLegacyAttachments(form, initialSubmission), currentLanguage),
  );
  const defaultSubmissionMethod = resolveDefaultSubmissionMethod(form.properties.submissionTypes);
  const submissionMethodFromUrl = new URLSearchParams(search).has('sub') ? requestedSubmissionMethod : undefined;
  const submissionMethod = submissionMethodFromUrl ?? defaultSubmissionMethod;
  const shouldRenderFormFlow = submissionMethod !== undefined || (form.properties.submissionTypes?.length ?? 0) === 0;

  return (
    <SubmissionMethodProvider submissionMethod={submissionMethod}>
      <NologinTokenProvider form={form}>
        <SubmissionStateProvider initialSubmission={hydratedInitialSubmission}>
          <FormDefinitionProvider form={form}>
            <ValidationProvider initialPagesWithErrors={initialPagesWithErrors}>
              <FyllutFormActionsProvider
                form={form}
                initialInnsendingsId={initialInnsendingsId}
                setReceiptPdf={setReceiptPdf}
              >
                <AttachmentUploadProvider>
                  <FormLayout>
                    <FormLanguageSelector />
                    {shouldRenderFormFlow ? (
                      <FormRouter form={form} receiptPdf={receiptPdf} />
                    ) : (
                      <>
                        <FormHeader form={form} />
                        <SubmissionMethodSelection form={form} />
                      </>
                    )}
                  </FormLayout>
                </AttachmentUploadProvider>
              </FyllutFormActionsProvider>
            </ValidationProvider>
          </FormDefinitionProvider>
        </SubmissionStateProvider>
      </NologinTokenProvider>
    </SubmissionMethodProvider>
  );
};

export default FyllutFormFlow;
