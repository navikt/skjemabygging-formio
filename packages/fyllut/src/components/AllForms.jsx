import makeStyles from "@material-ui/styles/makeStyles";
import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import { Normaltekst } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import httpFyllut from "../util/httpFyllut";

const useStyles = makeStyles({
  linkContainer: {
    display: "flex",
    flexDirection: "row",
  },
  formLink: {
    marginRight: "1em",
  },
});

export const AllForms = () => {
  const [status, setStatus] = useState("LOADING");
  const [forms, setForms] = useState([]);
  const styles = useStyles();

  useEffect(() => {
    httpFyllut
      .get(`/fyllut/api/forms`)
      .then((forms) => {
        setForms(forms);
        setStatus("FINISHED LOADING");
      })
      .catch(() => {
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
                <div className={styles.linkContainer}>
                  <Link className={styles.formLink} to={form.path}>
                    <Normaltekst>{form.title}</Normaltekst>
                  </Link>
                </div>
              </li>
            ))}
        </ul>
      </nav>
    </main>
  );
};
