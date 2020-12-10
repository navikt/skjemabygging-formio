import { Link } from "react-router-dom";
import { Normaltekst } from "nav-frontend-typografi";
import React from "react";

const FormsList = ({ forms, children }) => {
  return <ul>{forms.sort((a, b) => (a.modified < b.modified ? 1 : -1)).map(children)}</ul>;
};
export const AllForms = ({ forms }) => (
  <main>
    <h1>Velg et skjema, din nappetass dette er et devbuild</h1>
    <nav>
      <FormsList forms={forms}>
        {(form) => (
          <li key={form._id}>
            <Link to={form.path}>
              <Normaltekst>{form.title}</Normaltekst>
            </Link>
          </li>
        )}
      </FormsList>
    </nav>
  </main>
);
