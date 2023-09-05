import { AppConfigProvider, Modal, url } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ConfirmDelingslenkeModal from "./components/ConfirmDelingslenkeModal";
import getDokumentinnsendingBaseURL from "./getDokumentinnsendingBaseURL";
import httpFyllut from "./util/httpFyllut";

if (process.env.NODE_ENV !== "test") Modal.setAppElement("#root");

let featureToggles = {};

const subissionMethod = url.getUrlParam(window.location.search, "sub");

httpFyllut
  .get("/fyllut/api/config")
  .then((json) => {
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
      <BrowserRouter basename="/fyllut">
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
          {config.isDelingslenke && <ConfirmDelingslenkeModal />}
          <App />
        </AppConfigProvider>
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root"),
  );
}
