import { FyllutState, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { FormTitle } from '../components/form/form-title/FormTitle';
import { SubmissionWrapper } from '../components/summary/submission-wrapper/SubmissionWrapper';
import { useAppConfig } from '../context/config/configContext';
import { LanguageSelector, LanguagesProvider } from '../context/languages';
import { PrefillDataProvider } from '../context/prefill-data/PrefillDataContext';
import { SendInnProvider } from '../context/sendInn/sendInnContext';
import makeStyles from '../util/styles/jss/jss';
import ActiveTasksPage from './active-tasks/ActiveTasksPage';
import { FillInFormPage } from './fill-in-form/FillInFormPage';
import { IntroPage } from './intro/IntroPage';
import { PrepareIngenInnsendingPage } from './prepare-innsending/PrepareIngenInnsendingPage';
import { PrepareLetterPage } from './prepare-letter/PrepareLetterPage';
import { SummaryPage } from './summary/SummaryPage';

const useStyles = makeStyles({
  container: {
    margin: '0 auto',
    maxWidth: '960px',
    padding: '2rem 0',
    '@media screen and (max-width: 992px)': {
      padding: '1rem',
    },
  },
});

const FyllUtRouter = ({ form, translations }) => {
  const { featureToggles } = useAppConfig();
  const [submission, setSubmission] = useState<Submission | { fyllutState: FyllutState }>();
  const formBaseUrl = useResolvedPath('').pathname;
  const styles = useStyles();

  const onFyllutStateChange = (fyllutState: FyllutState) => {
    setSubmission((prevSubmission) => {
      return {
        ...prevSubmission,
        fyllutState,
      };
    });
  };

  return (
    <LanguagesProvider translations={translations}>
      <PrefillDataProvider form={form}>
        <SendInnProvider
          form={form}
          formUrl={formBaseUrl}
          translations={translations}
          updateSubmission={(submission) => {
            setSubmission(submission);
          }}
          onFyllutStateChange={onFyllutStateChange}
        >
          <FormTitle form={form} />
          <div className={styles.container}>
            <div className="fyllut-layout">
              <div className="main-col"></div>
              <div className="right-col">{featureToggles!.enableTranslations && <LanguageSelector />}</div>
            </div>
            <Routes>
              <Route path="/" element={<IntroPage form={form} formUrl={formBaseUrl} />} />
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
          </div>
        </SendInnProvider>
      </PrefillDataProvider>
    </LanguagesProvider>
  );
};

export default FyllUtRouter;
