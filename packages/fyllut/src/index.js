import { AppConfigProvider, Modal, url } from "@navikt/skjemadigitalisering-shared-components";
import * as Sentry from "@sentry/browser";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ConfirmDelingslenkeModal from "./components/ConfirmDelingslenkeModal";
import getDokumentinnsendingBaseURL from "./getDokumentinnsendingBaseURL";
import * as serviceWorker from "./serviceWorker";
import httpFyllut from "./util/httpFyllut";

if (process.env.NODE_ENV !== "test") Modal.setAppElement("#root");

let featureToggles = {};

const subissionMethod = url.getUrlParam(window.location.search, "sub");

httpFyllut
  .get("/fyllut/api/config")
  .then((json) => {
    if (json.REACT_APP_SENTRY_DSN) {
      Sentry.init({ dsn: json.REACT_APP_SENTRY_DSN });
    }
    if (json.FEATURE_TOGGLES) {
      featureToggles = json.FEATURE_TOGGLES;
    }
    renderReact(getDokumentinnsendingBaseURL(json.NAIS_CLUSTER_NAME), json);
  })
  .catch((error) => {
    console.error(`Could not fetch config from server: ${error}`);
  });

function renderReact(dokumentInnsendingBaseURL, config) {
  ReactDOM.render(
    <React.StrictMode>
      <AppConfigProvider
        dokumentinnsendingBaseURL={dokumentInnsendingBaseURL}
        featureToggles={featureToggles}
        baseUrl={"/fyllut"}
        fyllutBaseURL={"/fyllut"}
        submissionMethod={subissionMethod}
        app="fyllut"
        config={config}
        http={httpFyllut}
        enableFrontendLogger
      >
        <BrowserRouter basename="/fyllut">
          {config.isDelingslenke && <ConfirmDelingslenkeModal />}
          <App />
        </BrowserRouter>
      </AppConfigProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
