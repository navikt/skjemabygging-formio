import React, { useState } from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { SummaryPage } from "./SummaryPage.jsx";
import { PrepareSubmitPage } from "./PrepareSubmitPage.jsx";
import { FillInFormPage } from "./FillInFormPage.jsx";

export const FyllUtRouter = ({ form }) => {
  let { path, url } = useRouteMatch();
  const [submission, setSubmission] = useState();

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <FillInFormPage form={form} submission={submission} setSubmission={setSubmission} formUrl={url} />
      </Route>

      <Route path={`${path}/oppsummering`}>
        <SummaryPage form={form} submission={submission} formUrl={url} />
      </Route>
      <Route path={`${path}/forbered-innsending`}>
        <PrepareSubmitPage form={form} submission={submission} />
      </Route>
    </Switch>
  );
};
