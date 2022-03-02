import { makeStyles } from "@material-ui/styles";
import {
  CustomComponents,
  ErrorPage,
  FyllUtRouter,
  globalStyles,
  LoadingComponent,
} from "@navikt/skjemadigitalisering-shared-components";
import "@navikt/skjemadigitalisering-shared-components/src/overrideFormioStyles.less";
import { Components } from "formiojs";
import "nav-frontend-typografi-style";
import React, { useEffect, useState } from "react";
import { useLocation, useParams, useHistory } from "react-router-dom";
import { Tilbakeknapp } from "nav-frontend-ikonknapper";

const useStyles = makeStyles((theme) => ({
  "@global": globalStyles,
  backContainer: {
    maxWidth: "800px",
    margin: "0 auto 1rem auto",
  },
}));

Components.setComponents(CustomComponents);

const MigrationFormPreview = () => {
  const [form, setForm] = useState();
  const [error, setError] = useState<string>();
  const { formPath } = useParams();
  const { search } = useLocation();
  const history = useHistory();

  const styles = useStyles();
  useEffect(() => {
    try {
      fetch(`/api/migrate/preview/${formPath}${search}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      }).then((response) => response.json().then(setForm));
    } catch (err: any) {
      setError(err instanceof Error ? (err as Error).message : "Noe galt skjedde da vi prøvde å laste skjemaet");
    }
  }, [formPath, search]);

  if (!form && !error) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorPage errorMessage={error} />;
  }

  return (
    <div>
      <div className={styles.backContainer}>
        <Tilbakeknapp onClick={history.goBack}>Tilbake</Tilbakeknapp>
      </div>
      <FyllUtRouter form={form} translations={{}} />
    </div>
  );
};

export default MigrationFormPreview;
