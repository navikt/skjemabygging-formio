import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import Pusher from "pusher-js";
import { Formio } from "formiojs";
import navdesign from "./template";
import featureToggles from "./featureToggles.json";
import { AppConfigProvider } from "./configContext";
import { AuthProvider } from "./context/auth-context";

Formio.use(navdesign);

const projectURL = process.env.REACT_APP_FORMIO_PROJECT_URL || "https://protected-island-44773.herokuapp.com";
const dokumentinnsendingDevURL = "https://tjenester-q0.nav.no/dokumentinnsending";
const fyllutBaseURL = "https://www.nav.no/fyllut";

const store = { forms: null };

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
          <App store={store} projectURL={projectURL} pusher={pusher} />
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
