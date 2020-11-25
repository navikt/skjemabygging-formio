import React, { useState } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { SummaryPage } from "./SummaryPage.jsx";
import { PrepareSubmitPage } from "./PrepareSubmitPage.jsx";
import { FillInFormPage } from "./FillInFormPage.jsx";
import { SubmissionWrapper } from "./SubmissionWrapper.jsx";

export const FyllUtRouter = ({ form }) => {
  let { path, url } = useRouteMatch();
  const [submission, setSubmission] = useState();

  return (
    <Switch>
      <Route exact path={path}>
        <FillInFormPage form={form} submission={submission} setSubmission={setSubmission} formUrl={url} />
      </Route>
      <Route path={`${path}/oppsummering`}>
        <SubmissionWrapper submission={submission} url={url}>
          <SummaryPage form={form} submission={submission} formUrl={url} />
        </SubmissionWrapper>
      </Route>
      <Route path={`${path}/forbered-innsending`}>
        <SubmissionWrapper submission={submission} url={url}>
          <PrepareSubmitPage form={form} submission={submission} />
        </SubmissionWrapper>
      </Route>
    </Switch>
  );
};
