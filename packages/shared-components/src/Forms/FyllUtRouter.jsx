import { styled } from "@material-ui/styles";
import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { useEffect, useState } from "react";
import { Prompt, Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { LanguageSelector, LanguagesProvider } from "../context/languages";
import { MellomlagringProvider } from "../context/sendInn/mellomlagringContext";
import { addBeforeUnload, removeBeforeUnload } from "../util/unload";
import { FillInFormPage } from "./FillInFormPage.jsx";
import { IntroPage } from "./IntroPage.tsx";
import { PrepareIngenInnsendingPage } from "./PrepareIngenInnsendingPage";
import { SubmissionWrapper } from "./SubmissionWrapper.jsx";
import { SummaryPage } from "./SummaryPage.tsx";
import { FormTitle } from "./components/FormTitle.tsx";
import { PrepareLetterPage } from "./letter/PrepareLetterPage";

const FyllUtContainer = styled("div")({
  margin: "0 auto",
  maxWidth: "960px",
  padding: "2rem 0",
  "@media screen and (max-width: 992px)": {
    padding: "1rem",
  },
});

const ALERT_MESSAGE_BACK_BUTTON =
  "Hvis du går vekk fra denne siden kan du miste dataene du har fylt ut. Er du sikker på at du vil gå tilbake?";

const FyllUtRouter = ({ form, translations }) => {
  const { featureToggles, submissionMethod, app } = useAppConfig();
  const { path, url: formBaseUrl } = useRouteMatch();
  const [formForRendering, setFormForRendering] = useState();
  const [submission, setSubmission] = useState();
  useEffect(() => {
    setFormForRendering(submissionMethod === "digital" ? navFormUtils.removeVedleggspanel(form) : form);
  }, [form, submissionMethod]);

  useEffect(() => {
    addBeforeUnload();
    return () => {
      removeBeforeUnload();
    };
  }, []);

  return (
    <LanguagesProvider translations={translations}>
      <MellomlagringProvider form={form} translations={translations}>
        <FormTitle form={form} />
        <FyllUtContainer>
          <div className="fyllut-layout">
            <div className="main-col"></div>
            <div className="right-col">{featureToggles.enableTranslations && <LanguageSelector />}</div>
          </div>
          <Switch>
            <Redirect from="/:url*(/+)" to={path.slice(0, -1)} />
            <Route exact path={path}>
              <>
                <IntroPage form={form} formUrl={formBaseUrl} />
              </>
            </Route>
            <Route path={`${path}/oppsummering`}>
              <SubmissionWrapper submission={submission} url={formBaseUrl}>
                {(submissionObject) => <SummaryPage form={form} submission={submissionObject} formUrl={formBaseUrl} />}
              </SubmissionWrapper>
            </Route>
            <Route path={`${path}/send-i-posten`}>
              <SubmissionWrapper submission={submission} url={formBaseUrl}>
                {(submissionObject) => (
                  <PrepareLetterPage
                    form={form}
                    submission={submissionObject}
                    formUrl={formBaseUrl}
                    translations={translations}
                  />
                )}
              </SubmissionWrapper>
            </Route>
            <Route path={`${path}/ingen-innsending`}>
              <SubmissionWrapper submission={submission} url={formBaseUrl}>
                {(submissionObject) => (
                  <PrepareIngenInnsendingPage
                    form={form}
                    submission={submissionObject}
                    formUrl={formBaseUrl}
                    translations={translations}
                  />
                )}
              </SubmissionWrapper>
            </Route>
            <Route path={`${path}/:panelSlug`}>
              {formForRendering && (
                <>
                  {app !== "bygger" && (
                    <Prompt
                      message={(location) => (location.pathname === formBaseUrl ? ALERT_MESSAGE_BACK_BUTTON : true)}
                    />
                  )}
                  <FillInFormPage
                    form={formForRendering}
                    submission={submission}
                    setSubmission={setSubmission}
                    formUrl={formBaseUrl}
                  />
                </>
              )}
            </Route>
          </Switch>
        </FyllUtContainer>
      </MellomlagringProvider>
    </LanguagesProvider>
  );
};

export default FyllUtRouter;
