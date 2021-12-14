import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import * as Sentry from "@sentry/browser";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import featureToggles from "./featureToggles.js";
import getDokumentinnsendingBaseURL from "./getDokumentinnsendingBaseURL";
import * as serviceWorker from "./serviceWorker";

class HttpError extends Error {}

fetch("/fyllut/config", { headers: { accept: "application/json" } })
  .then((response) => {
    if (!response.ok) {
      throw new HttpError(response.statusText);
    }
    return response.json();
  })
  .then((json) => {
    if (json.REACT_APP_SENTRY_DSN) {
      Sentry.init({ dsn: json.REACT_APP_SENTRY_DSN });
    }
    renderReact(getDokumentinnsendingBaseURL(json.NAIS_CLUSTER_NAME));
  })
  .catch((error) => {
    if (process.env.NODE_ENV === "development") {
      console.log("config not loaded, using dummy config in development");
      // TODO løse hvordan skjema lastes ved lokal utvikling
      renderReact("https://example.org/dokumentinnsendingbaseurl");
    } else {
      console.error(`Could not fetch config from server: ${error}`);
    }
  });

function renderReact(dokumentInnsendingBaseURL) {
  ReactDOM.render(
    <React.StrictMode>
      <AppConfigProvider
        dokumentinnsendingBaseURL={dokumentInnsendingBaseURL}
        featureToggles={featureToggles}
        baseUrl={"/fyllut"}
        fyllutBaseURL={"/fyllut"}
      >
        <BrowserRouter basename="/fyllut">
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
