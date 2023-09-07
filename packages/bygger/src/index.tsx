import { AppConfigProvider, Modal } from "@navikt/skjemadigitalisering-shared-components";
import Pusher from "pusher-js";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/auth-context";
import { createRoot } from "react-dom/client";

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
  const container = document.getElementById("root");
  const root = createRoot(container!);
  root.render(
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
  );
};
