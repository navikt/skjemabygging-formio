import { AppConfigProvider, Modal, Template as navdesign } from "@navikt/skjemadigitalisering-shared-components";
import { Formio } from "formiojs";
import Pusher from "pusher-js";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/auth-context";
import "./index.less";
import * as serviceWorker from "./serviceWorker";

Formio.use(navdesign);

const dokumentinnsendingDevURL = "https://tjenester-q0.nav.no/dokumentinnsending";

Pusher.logToConsole = true;

// @ts-ignore
if (process.env.NODE_ENV !== "test") Modal.setAppElement("#root");

fetch("/api/config")
  .then((res) => {
    const token = res.headers.get("Bygger-Formio-Token");
    if (token) {
      localStorage.setItem("formioToken", token);
    }
    return res.json();
  })
  .then((config) => renderReact(config));

const renderReact = (config) => {
  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <AppConfigProvider
          dokumentinnsendingBaseURL={dokumentinnsendingDevURL}
          fyllutBaseURL={config.fyllutBaseUrl}
          featureToggles={config.featureToggles}
          config={config}
          app="bygger"
        >
          <AuthProvider user={config.user}>
            <App projectURL={config.formioProjectUrl} serverURL={config.fyllutBaseUrl} />
          </AuthProvider>
        </AppConfigProvider>
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
  );
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
