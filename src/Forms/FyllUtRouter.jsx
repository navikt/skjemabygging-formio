import React, { useEffect, useState } from "react";
import { Route, Switch, useRouteMatch, Redirect } from "react-router-dom";
import { useAmplitude } from "../context/amplitude";
import { FillInFormPage } from "./FillInFormPage.jsx";
import { PrepareLetterPage } from "./PrepareLetterPage.jsx";
import { PrepareSubmitPage } from "./PrepareSubmitPage.jsx";
import { SubmissionWrapper } from "./SubmissionWrapper.jsx";
import { SummaryPage } from "./SummaryPage.jsx";
import { styled } from "@material-ui/styles";

const FyllUtContainer = styled("div")({
  margin: "0 auto",
  maxWidth: "800px",
});

const FyllUtRouter = ({ form, translation }) => {
  let { path, url } = useRouteMatch();
  const [submission, setSubmission] = useState();
  const { loggSkjemaApnet } = useAmplitude();

  useEffect(() => {
    loggSkjemaApnet();
  }, [loggSkjemaApnet]);

  return (
    <FyllUtContainer>
      <Switch>
        <Redirect from="/:url*(/+)" to={path.slice(0, -1)} />
        <Route exact path={path}>
          <FillInFormPage
            form={form}
            submission={submission}
            setSubmission={setSubmission}
            formUrl={url}
            translation={translation}
          />
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
    </FyllUtContainer>
  );
};

export default FyllUtRouter;
