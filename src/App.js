import React, { useEffect, useState } from "react";
import { Switch, Route, Link } from "react-router-dom";
import "../node_modules/formiojs/dist/formio.full.min.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Components, Form } from "react-formio";
import { projectURL } from "./config";

import components from "./Custom";

Components.setComponents(components);

function App() {
  const [forms, setForms] = useState();
  const [submission, setSubmission] = useState();

  useEffect(() => {
    fetch(`${projectURL}/form?type=form&tags=nav-skjema`)
      .then(res => res.json())
      .then(forms => {
        setForms(forms);
      })
      .catch(message => console.log("Kunne ikke hente forms", message));
  }, []);

  return (
    <div className="app">
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
          exact
          path="/:formpath"
          render={routeProps => (
            <>
              <h1>Fyll ut søknaden</h1>
              <Form
                key="1"
                src={`${projectURL}${routeProps.match.params.formpath}`}
                options={{ readOnly: false }}
                onSubmit={submission => {
                  setSubmission(submission);
                  routeProps.history.push(
                    `/${routeProps.match.params.formpath}/result/${submission._id}`
                  );
                }}
              />
            </>
          )}
        />
        <Route
          path="/:formpath/result/:id"
          render={routeProps => (
            <>
              <h1>Din søknad</h1>
              <Form
                key="2"
                src={`${projectURL}${routeProps.match.params.formpath}`}
                options={{ readOnly: true }}
                submission={submission}
              />
              <button onClick={window.print}>Skriv ut</button>
            </>
          )}
        />
      </Switch>
    </div>
  );
}

export default App;
