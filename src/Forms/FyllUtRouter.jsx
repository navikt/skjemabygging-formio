import React, { useState } from "react";
import { Route, Switch, useHistory, useRouteMatch } from "react-router-dom";
import NavForm from "../components/NavForm.jsx";
import { SummaryPage } from "./SummaryPage.jsx";
import { PrepareSubmitPage } from "./PrepareSubmitPage.jsx";

export const FyllUtRouter = ({ form }) => {
  let { path, url } = useRouteMatch();
  const history = useHistory();
  const [submission, setSubmission] = useState();

  return (
    <Switch>
      <Route exact path={`${path}`}>
        <NavForm
          key="1"
          form={form}
          onChange={(value) => setSubmission(value.data)}
          onSubmit={(submission) => {
            setSubmission(submission);
            history.push(`${url}/oppsummering`);
          }}
        />
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
