import { styled } from "@material-ui/styles";
import React, { useEffect, useState } from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { LanguageSelector, LanguagesProvider } from "../context/languages";
import ModalPrompt from "./components/ModalPrompt";
import { FillInFormPage } from "./FillInFormPage.jsx";
import { bootstrapStyles } from "./fyllUtRouterBootstrapStyles";
import { PrepareIngenInnsendingPage } from "./PrepareIngenInnsendingPage";
import { PrepareLetterPage } from "./PrepareLetterPage.jsx";
import { PrepareSubmitPage } from "./PrepareSubmitPage.jsx";
import { SubmissionWrapper } from "./SubmissionWrapper.jsx";
import { SummaryPage } from "./SummaryPage.tsx";

const FyllUtContainer = styled("div")({
  margin: "0 auto",
  maxWidth: "800px",
  ...bootstrapStyles,
});

const FyllUtRouter = ({ form, translations }) => {
  const { featureToggles } = useAppConfig();
  let { path, url } = useRouteMatch();
  const [submission, setSubmission] = useState();
  const { loggSkjemaApnet } = useAmplitude();

  function beforeUnload(e) {
    e.preventDefault();
    e.returnValue = "";
  }

  useEffect(() => {
    loggSkjemaApnet();
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [loggSkjemaApnet]);

  return (
    <LanguagesProvider translations={translations}>
      <FyllUtContainer>
        {featureToggles.enableTranslations && <LanguageSelector />}
        <Switch>
          <Redirect from="/:url*(/+)" to={path.slice(0, -1)} />
          <Route exact path={path}>
            <>
              <ModalPrompt />
              <FillInFormPage form={form} submission={submission} setSubmission={setSubmission} formUrl={url} />
            </>
          </Route>
          <Route path={`${path}/oppsummering`}>
            <SubmissionWrapper submission={submission} url={url}>
              {(submissionObject) => <SummaryPage form={form} submission={submissionObject} formUrl={url} />}
            </SubmissionWrapper>
          </Route>
          <Route path={`${path}/send-i-posten`}>
            <SubmissionWrapper submission={submission} url={url}>
              {(submissionObject) => (
                <PrepareLetterPage
                  form={form}
                  submission={submissionObject}
                  formUrl={url}
                  translations={translations}
                />
              )}
            </SubmissionWrapper>
          </Route>
          <Route path={`${path}/forbered-innsending`}>
            <SubmissionWrapper submission={submission} url={url}>
              {(submissionObject) => (
                <PrepareSubmitPage
                  form={form}
                  submission={submissionObject}
                  formUrl={url}
                  translations={translations}
                />
              )}
            </SubmissionWrapper>
          </Route>
          <Route path={`${path}/ingen-innsending`}>
            <SubmissionWrapper submission={submission} url={url}>
              {(submissionObject) => (
                <PrepareIngenInnsendingPage
                  form={form}
                  submission={submissionObject}
                  formUrl={url}
                  translations={translations}
                />
              )}
            </SubmissionWrapper>
          </Route>
        </Switch>
      </FyllUtContainer>
    </LanguagesProvider>
  );
};

export default FyllUtRouter;
