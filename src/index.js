import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import AppProviders from "./context/AppProviders";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import Pusher from "pusher-js";

require('../node_modules/moment/locale/nb.js'); // For datovelger

const projectURL = process.env.REACT_APP_FORMIO_PROJECT_URL || "https://protected-island-44773.herokuapp.com";

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
      <AppProviders>
        <App
          store={store}
          projectURL={projectURL}
          pusher={pusher}
        />
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
