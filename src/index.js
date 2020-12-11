import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/browser";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import { forms } from "skjemapublisering";
import { AppConfigProvider } from "skjemabygging-formio";
import getDokumentinnsendingBaseURL from "./getDokumentinnsendingBaseURL";

fetch("/fyllut/config")
  .then((config) => config.json())
  .then((json) => {
    if (json.REACT_APP_SENTRY_DSN) {
      Sentry.init({ dsn: json.REACT_APP_SENTRY_DSN });
    }
    renderReact(json.NAIS_CLUSTER_NAME);
  })
  .catch((error) => {
    if (process.env.NODE_ENV === "development") {
      renderReact();
    } else {
      console.error(`Could not fetch config from server: ${error}`);
    }
  });

function renderReact(naisClusterName) {
  console.log(process.env.NODE_ENV);
  ReactDOM.render(
    <React.StrictMode>
      <AppConfigProvider
        dokumentinnsendingBaseURL={getDokumentinnsendingBaseURL(naisClusterName)}
        featureToggles={{ sendPaaPapir: true }}
      >
        <BrowserRouter basename="/fyllut">
          <App forms={forms} />
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
