import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import AppProviders from "./context/AppProviders";
import App from "./App";

const projectURL =
  process.env.REACT_APP_FORMIO_PROJECT_URL || "https://kxzxmneixaglyxf.form.io";

const store = {forms: []};

ReactDOM.render(
  <React.StrictMode>
    <AppProviders>
      <App store={store} projectURL={projectURL}/>
    </AppProviders>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
