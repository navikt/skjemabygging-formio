import makeStyles from "@material-ui/styles/makeStyles";
import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import { Normaltekst } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import httpFyllut from "../util/httpFyllut";

const useStyles = makeStyles(() => ({
  maxContentWidth: {
    maxWidth: "960px",
    margin: "0 auto",
  },
}));

export const AllForms = () => {
  const [status, setStatus] = useState("LOADING");
  const [forms, setForms] = useState([]);
  const history = useHistory();
  const styles = useStyles();

  useEffect(() => {
    const params = new URLSearchParams(history.location.search);
    const formId = params.get("form");
    if (formId) {
      history.replace(`/${formId}`);
    } else {
      httpFyllut
        .get(`/fyllut/api/forms`)
        .then((forms) => {
          setForms(forms);
          setStatus("FINISHED LOADING");
        })
        .catch(() => {
          setStatus("FORMS NOT FOUND");
        });
    }
  }, [history]);

  if (status === "LOADING") {
    return <LoadingComponent />;
  }

  if (status === "FORMS NOT FOUND" || forms.length === 0) {
    return <h1>Finner ingen skjemaer</h1>;
  }

  return (
    <main className={styles.maxContentWidth}>
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
