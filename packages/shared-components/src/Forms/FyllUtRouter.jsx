import React, { useEffect, useState } from "react";
import { Route, Switch, useRouteMatch, Redirect } from "react-router-dom";
import { useAmplitude } from "../context/amplitude";
import { FillInFormPage } from "./FillInFormPage.jsx";
import { PrepareLetterPage } from "./PrepareLetterPage.jsx";
import { PrepareSubmitPage } from "./PrepareSubmitPage.jsx";
import { SubmissionWrapper } from "./SubmissionWrapper.jsx";
import { SummaryPage } from "./SummaryPage.tsx";
import { PrepareIngenInnsendingPage } from "./PrepareIngenInnsendingPage";
import { styled } from "@material-ui/styles";
import { LanguagesProvider, LanguageSelector } from "../context/languages";
import { useAppConfig } from "../configContext";
import { bootstrapStyles } from "./fyllUtRouterBootstrapStyles";

const FyllUtContainer = styled("div")({
  margin: "0 auto",
  maxWidth: "800px",
  ...bootstrapStyles,
});

const FyllUtRouter = ({ form, translations, countryNameTranslations }) => {
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
    <LanguagesProvider translations={translations} countryNameTranslations={countryNameTranslations}>
      <FyllUtContainer>
        {featureToggles.enableTranslations && <LanguageSelector />}
        <Switch>
          <Redirect from="/:url*(/+)" to={path.slice(0, -1)} />
          <Route exact path={path}>
            <FillInFormPage form={form} submission={submission} setSubmission={setSubmission} formUrl={url} />
          </Route>
          <Route path={`${path}/oppsummering`}>
            <SubmissionWrapper submission={submission} url={url}>
              {(submissionObject) => <SummaryPage form={form} submission={submissionObject} formUrl={url} />}
            </SubmissionWrapper>
          </Route>
          <Route path={`${path}/send-i-posten`}>
            <SubmissionWrapper submission={submission} url={url}>
              {(submissionObject) => <PrepareLetterPage form={form} submission={submissionObject} formUrl={url} />}
            </SubmissionWrapper>
          </Route>
          <Route path={`${path}/forbered-innsending`}>
            <SubmissionWrapper submission={submission} url={url}>
              {(submissionObject) => <PrepareSubmitPage form={form} submission={submissionObject} formUrl={url} />}
            </SubmissionWrapper>
          </Route>
          <Route path={`${path}/ingen-innsending`}>
            <SubmissionWrapper submission={submission} url={url}>
              {(submissionObject) => (
                <PrepareIngenInnsendingPage form={form} submission={submissionObject} formUrl={url} />
              )}
            </SubmissionWrapper>
          </Route>
        </Switch>
      </FyllUtContainer>
    </LanguagesProvider>
  );
};

export default FyllUtRouter;
