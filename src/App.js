import React, { useEffect, useState } from "react";
import { Switch, Route, Link } from "react-router-dom";
import "../node_modules/formiojs/dist/formio.full.min.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.less";
import { Components, Form } from "react-formio";
import { projectURL } from "./config";

import components from "./Custom";
import {Innholdstittel, Normaltekst, Sidetittel} from "nav-frontend-typografi";

Components.setComponents(components);

function App() {
  const [forms, setForms] = useState([]);
  const [submission, setSubmission] = useState({});

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
                <Link to={`/${form.path}`}><Normaltekst>{form.title}</Normaltekst></Link>
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
          render={routeProps => {
            const form = forms.find(
              form => form.path === routeProps.match.params.formpath
            );
            if (!form) {
              return <h1>Laster..</h1>;
            }
            return (
              <>
                <Sidetittel>{form.title}</Sidetittel>
                <Innholdstittel>Fyll ut</Innholdstittel>
                <Form
                  key="1"
                  url={`${projectURL}${form.path}`}
                  form={form}
                  options={{ readOnly: false }}
                  onSubmit={submission => {
                    setSubmission({ [form.path]: submission });
                    routeProps.history.push(
                      `/${routeProps.match.params.formpath}/result`
                    );
                  }}
                />
              </>
            );
          }}
        />
        <Route
          path="/:formpath/result"
          render={routeProps => {
            const form = forms.find(
              form => form.path === routeProps.match.params.formpath
            );
            if (!form) {
              return <h1>Laster..</h1>;
            }
            return (
              <>
                <Sidetittel>{form.title}</Sidetittel>
                <Innholdstittel>Din søknad</Innholdstittel>
                <Form
                  key="2"
                  url={`${projectURL}${form.path}`}
                  form={form}
                  options={{ readOnly: true }}
                  submission={submission[form.path]}
                />
                <button onClick={window.print}>Skriv ut</button>
              </>
            );
          }}
        />
      </Switch>
    </div>
  );
}

export default App;
