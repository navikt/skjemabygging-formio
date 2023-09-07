import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { LanguageSelector, LanguagesProvider } from "../context/languages";
import { SendInnProvider } from "../context/sendInn/sendInnContext";
import makeStyles from "../util/jss";
import { addBeforeUnload, removeBeforeUnload } from "../util/unload";
import { FillInFormPage } from "./FillInFormPage.jsx";
import { IntroPage } from "./IntroPage";
import { PrepareIngenInnsendingPage } from "./PrepareIngenInnsendingPage";
import { FormTitle } from "./components/FormTitle";
import { PrepareLetterPage } from "./letter/PrepareLetterPage";
import { SummaryPage } from "./summary/SummaryPage";
import { Submission } from "@navikt/skjemadigitalisering-shared-domain";

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

/*
const ALERT_MESSAGE_BACK_BUTTON =
  "Hvis du går vekk fra denne siden kan du miste dataene du har fylt ut. Er du sikker på at du vil gå tilbake?";
*/
// TODO: Add propmpt back again

const FyllUtRouter = ({ form, translations }) => {
  const { featureToggles } = useAppConfig();
  const [submission, setSubmission] = useState<Submission>({} as Submission);

  const styles = useStyles();

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      addBeforeUnload();
      return () => {
        removeBeforeUnload();
      };
    }
  }, []);

  return (
    <LanguagesProvider translations={translations}>
      <SendInnProvider form={form} translations={translations}>
        <FormTitle form={form} />
        <div className={styles.container}>
          <div className="fyllut-layout">
            <div className="main-col"></div>
            <div className="right-col">{featureToggles!.enableTranslations && <LanguageSelector />}</div>
          </div>
          <Routes>
            <Route path="/" element={<IntroPage form={form} />} />
            <Route path={"/oppsummering"} element={<SummaryPage form={form} submission={submission} />} />
            <Route
              path={"/send-i-posten"}
              element={<PrepareLetterPage form={form} submission={submission} translations={translations} />}
            />
            <Route
              path={"/ingen-innsending"}
              element={<PrepareIngenInnsendingPage form={form} submission={submission} translations={translations} />}
            />
            <Route
              path={"/:panelSlug"}
              element={<FillInFormPage form={form} submission={submission} setSubmission={setSubmission} />}
            />
          </Routes>
        </div>
      </SendInnProvider>
    </LanguagesProvider>
  );
};

export default FyllUtRouter;
