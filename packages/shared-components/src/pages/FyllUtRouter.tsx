import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { Route, Routes } from 'react-router-dom';
import { SubmissionWrapper } from '../components/summary/submission-wrapper/SubmissionWrapper';
import { FormProvider } from '../context/form/FormContext';
import { SendInnProvider } from '../context/sendInn/sendInnContext';
import ActiveTasksPage from './active-tasks/ActiveTasksPage';
import { FillInFormPage } from './fill-in-form/FillInFormPage';
import FormLayout from './FormLayout';
import { PrepareIngenInnsendingPage } from './prepare-innsending/PrepareIngenInnsendingPage';
import { PrepareLetterPage } from './prepare-letter/PrepareLetterPage';
import { SummaryPage } from './summary/SummaryPage';

interface Props {
  form: NavFormType;
}

const FyllUtRouter = ({ form }: Props) => {
  return (
    <FormProvider form={form}>
      <SendInnProvider>
        <Routes>
          <Route element={<FormLayout stepper={true} />}>
            <Route
              path={'/oppsummering'}
              element={
                <SubmissionWrapper>
                  <SummaryPage />
                </SubmissionWrapper>
              }
            />
            <Route path={'/:panelSlug'} element={<FillInFormPage />} />
          </Route>
          <Route element={<FormLayout />}>
            <Route
              path={'/send-i-posten'}
              element={
                <SubmissionWrapper>
                  <PrepareLetterPage />
                </SubmissionWrapper>
              }
            />
            <Route
              path={'/ingen-innsending'}
              element={
                <SubmissionWrapper>
                  <PrepareIngenInnsendingPage />
                </SubmissionWrapper>
              }
            />
            <Route path={'/paabegynt'} element={<ActiveTasksPage />} />
          </Route>
        </Routes>
      </SendInnProvider>
    </FormProvider>
  );
};

export default FyllUtRouter;
