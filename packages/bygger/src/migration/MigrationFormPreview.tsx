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
import { useLocation, useParams } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  "@global": globalStyles,
}));

Components.setComponents(CustomComponents);

const MigrationFormPreview = () => {
  const [form, setForm] = useState();
  const [error, setError] = useState<string>();
  const { formPath } = useParams();
  const { search } = useLocation();

  useStyles();
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

  return <FyllUtRouter form={form} translations={{}} />;
};

export default MigrationFormPreview;
