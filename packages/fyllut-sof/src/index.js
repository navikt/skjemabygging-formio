import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { getDokumentinnsendingBaseURL } from "./getDokumentinnsendingBaseURL";

class HttpError extends Error {}

fetch("/fyllut/config", { headers: { accept: "application/json" } })
  .then((response) => {
    if (!response.ok) {
      throw new HttpError(response.statusText);
    }
    return response.json();
  })
  .then((json) => {
    renderReact(getDokumentinnsendingBaseURL(json.NAIS_CLUSTER_NAME), json.FORMS || []);
  })
  .catch((error) => {
    if (process.env.NODE_ENV === "development") {
      console.log("config not loaded, using dummy config in development");
      // TODO løse hvordan skjema lastes ved lokal utvikling
      renderReact("https://example.org/dokumentinnsendingbaseurl", []);
    } else {
      console.error(`Could not fetch config from server: ${error}`);
    }
  });

function renderReact(dokumentInnsendingBaseURL, forms) {
  ReactDOM.render(
    <React.StrictMode>
      <AppConfigProvider
        dokumentinnsendingBaseURL={dokumentInnsendingBaseURL}
        featureToggles={[]}
        fyllutBaseURL={"/fyllut"}
      >
        <BrowserRouter basename="/fyllut">
          <App forms={forms} />
        </BrowserRouter>
      </AppConfigProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
}
