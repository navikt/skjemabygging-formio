import { AppConfigProvider, Template as navdesign } from "@navikt/skjemadigitalisering-shared-components";
import { Formio } from "formiojs";
import Pusher from "pusher-js";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/auth-context";
import featureToggles from "./featureToggles.js";
import "./index.less";
import * as serviceWorker from "./serviceWorker";

Formio.use(navdesign);

const projectURL = process.env.REACT_APP_FORMIO_PROJECT_URL || "https://protected-island-44773.herokuapp.com";
const serverURL = "https://skjemaforhandsvisning.ekstern.dev.nav.no/fyllut";
const dokumentinnsendingDevURL = "https://tjenester-q0.nav.no/dokumentinnsending";
const fyllutBaseURL = process.env.REACT_APP_FYLLUT_BASE_URL || "http://localhost:3001/fyllut";

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
