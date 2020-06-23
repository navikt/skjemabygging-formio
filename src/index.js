import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";

const projectURL =
  process.env.REACT_APP_FORMIO_PROJECT_URL ||
  "https://protected-island-44773.herokuapp.com";
const getFormsFromSkjemapublisering = (process.env.REACT_APP_USE_SKJEMAPUBLISERING === "true") || false;

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App
        projectURL={projectURL}
        getFormsFromSkjemapublisering={getFormsFromSkjemapublisering}
      />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
