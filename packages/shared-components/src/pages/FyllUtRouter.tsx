import { FyllutState, I18nTranslations, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { FormContainer } from '../components/form/container/FormContainer';
import { FormTitle } from '../components/form/form-title/FormTitle';
import { SubmissionWrapper } from '../components/summary/submission-wrapper/SubmissionWrapper';
import { LanguageSelector, useLanguages } from '../context/languages';
import { PrefillDataProvider } from '../context/prefill-data/PrefillDataContext';
import { SendInnProvider } from '../context/sendInn/sendInnContext';
import ActiveTasksPage from './active-tasks/ActiveTasksPage';
import { FillInFormPage } from './fill-in-form/FillInFormPage';
import { PrepareIngenInnsendingPage } from './prepare-innsending/PrepareIngenInnsendingPage';
import { PrepareLetterPage } from './prepare-letter/PrepareLetterPage';
import { SummaryPage } from './summary/SummaryPage';

const FyllUtRouter = ({ form }) => {
  const { translationsForNavForm: translations } = useLanguages();
  const [submission, setSubmission] = useState<Submission>();
  const formBaseUrl = useResolvedPath('').pathname;

  const onFyllutStateChange = (fyllutState: FyllutState) => {
    setSubmission((prevSubmission) => {
      return {
        ...prevSubmission,
        fyllutState,
      } as Submission;
    });
  };

  return (
    <PrefillDataProvider form={form}>
      <SendInnProvider
        form={form}
        formUrl={formBaseUrl}
        translations={translations as I18nTranslations}
        updateSubmission={(submission) => {
          setSubmission(submission);
        }}
        onFyllutStateChange={onFyllutStateChange}
      >
        <FormTitle form={form} />
        <FormContainer>
          <div className="fyllut-layout">
            <div className="main-col"></div>
            <div className="right-col">
              <LanguageSelector />
            </div>
          </div>
          <Routes>
            <Route
              path={'/oppsummering'}
              element={
                <SubmissionWrapper submission={submission} url={formBaseUrl}>
                  {(submissionObject) => (
                    <SummaryPage form={form} submission={submissionObject} formUrl={formBaseUrl} />
                  )}
                </SubmissionWrapper>
              }
            />
            <Route
              path={'/send-i-posten'}
              element={
                <SubmissionWrapper submission={submission} url={formBaseUrl}>
                  {(submissionObject) => (
                    <PrepareLetterPage
                      form={form}
                      submission={submissionObject}
                      translations={translations}
                      formUrl={formBaseUrl}
                    />
                  )}
                </SubmissionWrapper>
              }
            />
            <Route
              path={'/ingen-innsending'}
              element={
                <SubmissionWrapper submission={submission} url={formBaseUrl}>
                  {(submissionObject) => (
                    <PrepareIngenInnsendingPage
                      form={form}
                      submission={submissionObject}
                      translations={translations}
                      formUrl={formBaseUrl}
                    />
                  )}
                </SubmissionWrapper>
              }
            />
            <Route path={'/paabegynt'} element={<ActiveTasksPage form={form} formUrl={formBaseUrl} />} />
            <Route
              path={'/:panelSlug'}
              element={
                <FillInFormPage
                  form={form}
                  submission={submission}
                  setSubmission={setSubmission}
                  formUrl={formBaseUrl}
                />
              }
            />
          </Routes>
        </FormContainer>
      </SendInnProvider>
    </PrefillDataProvider>
  );
};

export default FyllUtRouter;
