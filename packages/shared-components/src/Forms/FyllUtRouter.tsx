import { useState } from "react";
import { Route, Routes, useResolvedPath } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { LanguageSelector, LanguagesProvider } from "../context/languages";
import { SendInnProvider } from "../context/sendInn/sendInnContext";
import makeStyles from "../util/jss";
import { FillInFormPage } from "./FillInFormPage.jsx";
import { IntroPage } from "./IntroPage";
import { PrepareIngenInnsendingPage } from "./PrepareIngenInnsendingPage";
import { FormTitle } from "./components/FormTitle";
import { PrepareLetterPage } from "./letter/PrepareLetterPage";
import { SummaryPage } from "./summary/SummaryPage";
import { Submission } from "@navikt/skjemadigitalisering-shared-domain";
import { SubmissionWrapper } from "./SubmissionWrapper";

const useStyles = makeStyles({
  container: {
    margin: "0 auto",
    maxWidth: "960px",
    padding: "2rem 0",
    "@media screen and (max-width: 992px)": {
      padding: "1rem",
    },
  },
});

const FyllUtRouter = ({ form, translations }) => {
  const { featureToggles } = useAppConfig();
  const [submission, setSubmission] = useState<Submission>();
  const formBaseUrl = useResolvedPath("").pathname;
  const styles = useStyles();

  return (
    <LanguagesProvider translations={translations}>
      <SendInnProvider
        form={form}
        translations={translations}
        updateSubmission={(submission) => {
          setSubmission(submission);
        }}
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
              path={"/oppsummering"}
              element={
                <SubmissionWrapper submission={submission} url={formBaseUrl}>
                  {(submissionObject) => (
                    <SummaryPage form={form} submission={submissionObject} formUrl={formBaseUrl} />
                  )}
                </SubmissionWrapper>
              }
            />
            <Route
              path={"/send-i-posten"}
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
              path={"/ingen-innsending"}
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
            <Route
              path={"/:panelSlug"}
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
    </LanguagesProvider>
  );
};

export default FyllUtRouter;
