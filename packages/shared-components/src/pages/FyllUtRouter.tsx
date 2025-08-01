import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { Route, Routes } from 'react-router-dom';
import { FormProvider } from '../context/form/FormContext';
import { SendInnProvider } from '../context/sendInn/sendInnContext';
import ActiveTasksPage from './active-tasks/ActiveTasksPage';
import { FillInFormPage } from './fill-in-form/FillInFormPage';
import FormLayout from './FormLayout';
import IntroPage from './intro/IntroPage';
import { PrepareIngenInnsendingPage } from './prepare-innsending/PrepareIngenInnsendingPage';
import { PrepareLetterPage } from './prepare-letter/PrepareLetterPage';
import { SummaryPage } from './summary/SummaryPage';
import UploadAttachments from './upload-attachments/UploadAttachments';
import UploadPersonalIdPage from './upload-personal-id/UploadPersonalIdPage';

interface Props {
  form: NavFormType;
}

const FyllUtRouter = ({ form }: Props) => {
  return (
    <FormProvider form={form}>
      <SendInnProvider>
        <Routes>
          <Route element={<FormLayout stepper={true} />}>
            <Route path={'/oppsummering'} element={<SummaryPage />} />
            <Route path={'/legitimasjon'} element={<UploadPersonalIdPage />} />
            <Route path={'/vedlegg'} element={<UploadAttachments />} />
            <Route path={'/:panelSlug'} element={<FillInFormPage />} />
          </Route>
          <Route element={<FormLayout />}>
            <Route path={''} element={<IntroPage />} />
            <Route path={'/send-i-posten'} element={<PrepareLetterPage />} />
            <Route path={'/ingen-innsending'} element={<PrepareIngenInnsendingPage />} />
            <Route path={'/paabegynt'} element={<ActiveTasksPage />} />
          </Route>
        </Routes>
      </SendInnProvider>
    </FormProvider>
  );
};

export default FyllUtRouter;
