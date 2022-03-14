import { styled } from "@material-ui/styles";
import React, { useEffect, useState } from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { LanguageSelector, LanguagesProvider } from "../context/languages";
import { FillInFormPage } from "./FillInFormPage.jsx";
import { bootstrapStyles } from "./fyllUtRouterBootstrapStyles";
import ModalPrompt from "./ModalPrompt";
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
  const [openModal, setOpenModal] = useState(false);

  const beforeUnload = (event) => {
    //top.window.onbeforeunload = null;
    window.onbeforeunload = null;
    setOpenModal(true);
    //event.preventDefault()
    //event.returnValue = msg

    console.log("test onbeforeunload=null");
  };

  useEffect(() => {
    loggSkjemaApnet();
    window.addEventListener("beforeunload", beforeUnload);
    //window.addEventListener("unload", setOpenModal(true));
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      //window.addEventListener("unload", setOpenModal(true));
    };
  }, [loggSkjemaApnet, openModal]);

  function unloadTest(e) {
    //top.window.onbeforeunload = null;
    e.preventDefault();
    e.returnValue = "";
    console.log("test unload");
    setOpenModal(true);
    /* return <Prompt when={true} message="Are you sure you want to leave the page?" />; */
  }

  useEffect(() => {
    window.addEventListener("unload", (e) => {
      console.log("unloading...");
    });
    return () => {
      window.addEventListener("unload", unloadTest);
    };
  }, [openModal]);

  return (
    <LanguagesProvider translations={translations}>
      <ModalPrompt
        openModal={openModal}
        closeModal={() => setOpenModal(false)}
        title={"Forlate siden?"}
        promptText="Component unload"
        contentLabel="Forlate siden?"
      />
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
