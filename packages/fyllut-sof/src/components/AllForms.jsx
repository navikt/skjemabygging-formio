import React from "react";
import { Link } from "react-router-dom";
import { Normaltekst } from "nav-frontend-typografi";

export const AllForms = ({ forms }) => (
  <main>
    <h1>Velg et skjema</h1>
    <nav>
      <ul>
        {forms
          .sort((a, b) => (a.modified < b.modified ? 1 : -1))
          .map((form) => (
            <li key={form._id}>
              <Link to={form.path}>
                <Normaltekst>{form.title}</Normaltekst>
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  </main>
);
