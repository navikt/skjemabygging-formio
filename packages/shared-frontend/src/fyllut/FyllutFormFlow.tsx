import { Form, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLocation } from 'react-router';
import { SubmissionMethodProvider } from '../context/submission-method/SubmissionMethodContext';
import { AttachmentUploadProvider } from './attachments/context/AttachmentUploadContext';
import FormLanguageSelector from './FormLanguageSelector';
import {
  applyPrefilledValuesToSubmission,
  FormDefinitionProvider,
  FormHeader,
  FormLayout,
  SubmissionStateProvider,
  ValidationProvider,
} from './framework';
import FyllutFormActionsProvider from './FyllutFormActionsProvider';
import { NologinTokenProvider } from './nologin-token/NologinTokenContext';
import { resolveDefaultSubmissionMethod } from './submissionMethodResolution';
import SubmissionMethodSelection from './SubmissionMethodSelection';
import Wizard from './wizard/Wizard';

interface Props {
  form: Form;
  initialSubmission?: Submission;
  initialInnsendingsId?: string;
  initialNologinToken?: string;
  initialPagesWithErrors?: string[];
  requestedSubmissionMethod?: SubmissionMethod;
  currentLanguage: string;
}

const FyllutFormFlow = ({
  form,
  initialSubmission,
  initialInnsendingsId,
  initialNologinToken,
  initialPagesWithErrors,
  requestedSubmissionMethod,
  currentLanguage,
}: Props) => {
  const { search } = useLocation();
  const [receiptPdf, setReceiptPdf] = useState<Blob>();
  const hydratedInitialSubmission = applyPrefilledValuesToSubmission(form, initialSubmission, currentLanguage);
  const defaultSubmissionMethod = resolveDefaultSubmissionMethod(form.properties.submissionTypes);
  const submissionMethodFromUrl = new URLSearchParams(search).has('sub') ? requestedSubmissionMethod : undefined;
  const submissionMethod = submissionMethodFromUrl ?? defaultSubmissionMethod;
  const shouldRenderWizard = submissionMethod !== undefined || (form.properties.submissionTypes?.length ?? 0) === 0;

  return (
    <SubmissionMethodProvider submissionMethod={submissionMethod}>
      <NologinTokenProvider form={form} initialToken={initialNologinToken}>
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
                    {shouldRenderWizard ? (
                      <Wizard form={form} receiptPdf={receiptPdf} />
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
