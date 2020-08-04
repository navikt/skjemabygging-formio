import React, {useState} from "react";
import {Switch, Route, Link} from "react-router-dom";
import {Components, Form} from "react-formio";
import {
  Innholdstittel,
  Normaltekst,
  Sidetittel,
} from "nav-frontend-typografi";
import components from "./Custom";
import "nav-frontend-typografi-style";
import "formiojs/dist/formio.full.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.less";
import navdesign from "template";
import {Formio} from "formiojs";

Components.setComponents(components);
Formio.use(navdesign);

function App({forms}) {
  const [submission, setSubmission] = useState({});
  return (
    <div className="app">
      <nav>
        <ul>
          {forms
            .sort((a, b) => (a.modified < b.modified ? 1 : -1))
            .map((form) => (
              <li key={form._id}>
                <Link to={`/${form.path}`}>
                  <Normaltekst>{form.title}</Normaltekst>
                </Link>
              </li>
            ))}
        </ul>
      </nav>
      <Switch>
        <Route exact path="/" render={() => <h1>Velg et skjema</h1>}/>
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
                  form={form}
                  options={{readOnly: false}}
                  onSubmit={(submission) => {
                    setSubmission({[form.path]: submission});
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
              form.display === "wizard" ? {...form, display: "form"} : form;
            return (
              <>
                <Sidetittel>{form.title}</Sidetittel>
                <Innholdstittel>Din søknad</Innholdstittel>
                <Form
                  key="2"
                  form={resultForm}
                  options={{readOnly: true}}
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
