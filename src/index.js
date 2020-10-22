import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/browser";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import { forms } from "skjemapublisering";
import { AppConfigProvider } from "./configContext";

try {
  fetch("/skjema/config")
    .then((config) => config.json())
    .then((json) => {
      if (json.REACT_APP_SENTRY_DSN) {
        Sentry.init({ dsn: json.REACT_APP_SENTRY_DSN });
      }
      renderReact(json.NAIS_CLUSTER_NAME);
    });
} catch {
  if (process.env.NODE_ENV === "development") {
    renderReact();
  } else {
    console.error("Could not fetch config from server");
  }
}

function renderReact(naisClusterName) {
  ReactDOM.render(
    <React.StrictMode>
      <AppConfigProvider naisClusterName={naisClusterName}>
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
