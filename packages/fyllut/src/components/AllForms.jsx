import { makeStyles } from "@material-ui/styles";
import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import httpFyllut from "../util/httpFyllut";
import FormRow from "./FormRow";

const useStyles = makeStyles({
  skjemaliste: {
    borderCollapse: "collapse",
  },
});

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
    <main>
      <h1>Velg et skjema</h1>
      <nav>
        <table className={styles.skjemaliste}>
          <thead>
            <tr>
              <th>Skjematittel</th>
              <th colSpan="3">Innsending</th>
            </tr>
          </thead>
          <tbody>
            {forms
              .sort((a, b) => (a.modified < b.modified ? 1 : -1))
              .map((form) => (
                <FormRow key={form._id} form={form} />
              ))}
          </tbody>
        </table>
      </nav>
    </main>
  );
};
