import { get, LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import { Normaltekst } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const AllForms = () => {
  const [status, setStatus] = useState("LOADING");
  const [forms, setForms] = useState([]);

  useEffect(() => {
    get(`/fyllut/forms`)
      .then((forms) => {
        setForms(forms);
        setStatus("FINISHED LOADING");
      })
      .catch((e) => {
        console.log(e);
        setStatus("FORMS NOT FOUND");
      });
  }, []);

  if (status === "LOADING") {
    return <LoadingComponent />;
  }

  if (status === "FORMS NOT FOUND" || forms.length === 0) {
    return <h1>Finner ingen skjemaer</h1>;
  }

  return (
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
};
