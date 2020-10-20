import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import { forms } from "skjemapublisering";
import { AppConfigProvider } from "./configContext";

ReactDOM.render(
  <React.StrictMode>
    <AppConfigProvider>
      <BrowserRouter basename="/fyllut">
        <App forms={forms} />
      </BrowserRouter>
    </AppConfigProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
