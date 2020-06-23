import React, { useEffect, useState } from "react";
import { Switch, Route, Link } from "react-router-dom";
import { Components, Form } from "react-formio";
import {
  Innholdstittel,
  Normaltekst,
  Sidetittel,
} from "nav-frontend-typografi";
import components from "./Custom";
import "nav-frontend-typografi-style";
import "../node_modules/formiojs/dist/formio.full.min.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.less";
import navdesign from "template";
import { Formio } from "formiojs";
import { forms as NAVForms } from "skjemapublisering";

Components.setComponents(components);
Formio.use(navdesign);

function App({ projectURL, getFormsFromSkjemapublisering }) {
  const [forms, setForms] = useState([]);
  const [submission, setSubmission] = useState({});

  useEffect(() => {
    if (getFormsFromSkjemapublisering) {
      setForms(NAVForms);
    } else {
      fetch(`${projectURL}/form?type=form&tags=nav-skjema`)
        .then((res) => res.json())
        .then((forms) => setForms(forms))
        .catch((message) => console.log("Kunne ikke hente forms", message));
    }
  }, [getFormsFromSkjemapublisering, projectURL]);

  return (
    <div className="app">
      <nav>
        {forms && (
          <ul>
            {forms.map((form) => (
              <li key={form._id}>
                <Link to={`/${form.path}`}>
                  <Normaltekst>{form.title}</Normaltekst>
                </Link>
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
          render={(routeProps) => {
            const form = forms.find(
              (form) => form.path === routeProps.match.params.formpath
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
                  onSubmit={(submission) => {
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
          render={(routeProps) => {
            const form = forms.find(
              (form) => form.path === routeProps.match.params.formpath
            );
            if (!form) {
              return <h1>Laster..</h1>;
            }
            const resultForm =
              form.display === "wizard" ? { ...form, display: "form" } : form;
            return (
              <>
                <Sidetittel>{form.title}</Sidetittel>
                <Innholdstittel>Din søknad</Innholdstittel>
                <Form
                  key="2"
                  url={`${projectURL}${form.path}`}
                  form={resultForm}
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
