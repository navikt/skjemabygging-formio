import React from "react";
import ReactDOM from "react-dom";
import "./index.less";
import * as serviceWorker from "./serviceWorker";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import Pusher from "pusher-js";
import { Formio } from "formiojs";
import featureToggles from "./featureToggles.js";
import { AppConfigProvider, Template as navdesign } from "@navikt/skjemadigitalisering-shared-components";
import { AuthProvider } from "./context/auth-context";

Formio.use(navdesign);

const projectURL = process.env.REACT_APP_FORMIO_PROJECT_URL || "https://protected-island-44773.herokuapp.com";
const serverURL = "https://skjemautfylling-formio.labs.nais.io/fyllut";
const dokumentinnsendingDevURL = "https://tjenester-q0.nav.no/dokumentinnsending";
const fyllutBaseURL = process.env.REACT_APP_FYLLUT_BASE_URL || "https://www.nav.no/fyllut";

Pusher.logToConsole = true;

const pusherAppKey = process.env.REACT_APP_PUSHER_KEY;
const pusherAppCluster = process.env.REACT_APP_PUSHER_CLUSTER;

const pusher = new Pusher(pusherAppKey, {
  cluster: pusherAppCluster,
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppConfigProvider
        dokumentinnsendingBaseURL={dokumentinnsendingDevURL}
        fyllutBaseURL={fyllutBaseURL}
        featureToggles={featureToggles}
      >
        <AuthProvider>
          <App projectURL={projectURL} serverURL={serverURL} pusher={pusher} />
        </AuthProvider>
      </AppConfigProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
