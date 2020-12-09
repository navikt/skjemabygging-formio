import React, { useEffect, useState } from "react";
import { Route, Switch, useRouteMatch, Redirect } from "react-router-dom";
import { FillInFormPage } from "./FillInFormPage.jsx";
import { PrepareLetterPage } from "./PrepareLetterPage.jsx";
import { PrepareSubmitPage } from "./PrepareSubmitPage.jsx";
import { SubmissionWrapper } from "./SubmissionWrapper.jsx";
import { SummaryPage } from "./SummaryPage.jsx";

import { initAmplitude, logAmplitudeEvent } from "../util/amplitude";

export const FyllUtRouter = ({ form }) => {
  let { path, url } = useRouteMatch();
  const [submission, setSubmission] = useState();

  useEffect(() => {
    initAmplitude();
    logAmplitudeEvent("skjema åpnet", {
      skjemanavn: form.title,
      skjemaId: form.properties.skjemanummer,
    });
  }, [form.properties.skjemanummer, form.title]);

  return (
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
          {(submissionObject) => <PrepareLetterPage form={form} submission={submissionObject} />}
        </SubmissionWrapper>
      </Route>
      <Route path={`${path}/forbered-innsending`}>
        <SubmissionWrapper submission={submission} url={url}>
          {(submissionObject) => <PrepareSubmitPage form={form} submission={submissionObject} />}
        </SubmissionWrapper>
      </Route>
    </Switch>
  );
};
