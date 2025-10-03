import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { Route, Routes } from 'react-router';
import AttachmentUploadProvider from '../components/attachment/AttachmentUploadContext';
import { useAppConfig } from '../context/config/configContext';
import { FormProvider } from '../context/form/FormContext';
import { SendInnProvider } from '../context/sendInn/sendInnContext';
import ActiveTasksPage from './active-tasks/ActiveTasksPage';
import { FillInFormPage } from './fill-in-form/FillInFormPage';
import FormLayout from './FormLayout';
import IntroPage from './intro/IntroPage';
import { PrepareIngenInnsendingPage } from './prepare-innsending/PrepareIngenInnsendingPage';
import { PrepareLetterPage } from './prepare-letter/PrepareLetterPage';
import { ReceiptPage } from './receipt/ReceiptPage';
import { SummaryPage } from './summary/SummaryPage';
import AttachmentsUploadPage from './upload-attachments/AttachmentsUploadPage';
import UploadPersonalIdPage from './upload-personal-id/UploadPersonalIdPage';

interface Props {
  form: NavFormType;
}

const FyllUtRouter = ({ form }: Props) => {
  const { submissionMethod } = useAppConfig();

  return (
    <FormProvider form={form}>
      <SendInnProvider>
        <Routes>
          <Route element={<FormLayout stepper={true} />}>
            <Route path="oppsummering" element={<SummaryPage />} />
            {submissionMethod === 'digitalnologin' && (
              <Route
                path="vedlegg"
                element={
                  <AttachmentUploadProvider>
                    <AttachmentsUploadPage />
                  </AttachmentUploadProvider>
                }
              />
            )}
            <Route path=":panelSlug" element={<FillInFormPage />} />
          </Route>
          <Route element={<FormLayout />}>
            <Route path="" element={<IntroPage />} />
            <Route path="legitimasjon" element={<UploadPersonalIdPage />} />
            <Route path="send-i-posten" element={<PrepareLetterPage />} />
            <Route path="ingen-innsending" element={<PrepareIngenInnsendingPage />} />
            <Route path="paabegynt" element={<ActiveTasksPage />} />
            <Route path="kvittering" element={<ReceiptPage />} />
          </Route>
        </Routes>
      </SendInnProvider>
    </FormProvider>
  );
};

export default FyllUtRouter;
