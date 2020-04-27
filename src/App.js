import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "../node_modules/formiojs/dist/formio.full.min.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Components, Form } from "react-formio";
import { projectURL } from "./config";

import components from "./Custom";

Components.setComponents(components);

function App() {
  const [forms, setForms] = useState();

  useEffect(() => {
    fetch(`${projectURL}/form?type=form`)
      .then(res => res.json())
      .then(forms => {
        setForms(forms);
      })
      .catch(message => console.log("Kunne ikke hente forms", message));
  }, []);

  return (
    <div className="app">
      <Router>
        <nav>
          {forms && (
            <ul>
              {forms.map(form => (
                <li key={form._id}>
                  <Link to={`/${form.path}`}>{form.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </nav>
        <Switch>
          <Route exact path="/" render={() => <h1>Velg et skjema</h1>} />
          <Route
            path="/:formpath"
            render={routeProps => (
              <Form src={`${projectURL}${routeProps.match.params.formpath}`} />
            )}
          />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
