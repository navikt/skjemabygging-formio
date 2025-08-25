import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { Route, Routes } from 'react-router-dom';
import { useAppConfig } from '../context/config/configContext';
import { FormProvider } from '../context/form/FormContext';
import { SendInnProvider } from '../context/sendInn/sendInnContext';
import ActiveTasksPage from './active-tasks/ActiveTasksPage';
import { FillInFormPage } from './fill-in-form/FillInFormPage';
import FormLayout from './FormLayout';
import IntroPage from './intro/IntroPage';
import { PrepareIngenInnsendingPage } from './prepare-innsending/PrepareIngenInnsendingPage';
import { PrepareLetterPage } from './prepare-letter/PrepareLetterPage';
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
          <Route element={<FormLayout />}>
            <Route path={''} element={<IntroPage />} />
            <Route path={'/:panelSlug'} element={<FillInFormPage />} />
            {submissionMethod === 'digitalnologin' && <Route path={'/vedlegg'} element={<AttachmentsUploadPage />} />}
            <Route path={'/oppsummering'} element={<SummaryPage />} />

            <Route path={'/legitimasjon'} element={<UploadPersonalIdPage />} />
            <Route path={'/paabegynt'} element={<ActiveTasksPage />} />
            <Route path={'/send-i-posten'} element={<PrepareLetterPage />} />
            <Route path={'/ingen-innsending'} element={<PrepareIngenInnsendingPage />} />
          </Route>
        </Routes>
      </SendInnProvider>
    </FormProvider>
  );
};

export default FyllUtRouter;
