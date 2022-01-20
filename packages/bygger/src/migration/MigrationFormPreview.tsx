import { ErrorPage, FyllUtRouter, LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const MigrationFormPreview = () => {
  const [form, setForm] = useState();
  const [error, setError] = useState<string>();
  const { formPath } = useParams();
  useEffect(() => {
    try {
      fetch(`/api/migrate/preview/${formPath}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      }).then((response) => response.json().then(setForm));
    } catch (err: any) {
      setError(err instanceof Error ? (err as Error).message : "Noe galt skjedde da vi prøvde å laste skjemaet");
    }
  }, [formPath]);

  if (!form && !error) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorPage errorMessage={error} />;
  }

  return <FyllUtRouter form={form} />;
};

export default MigrationFormPreview;
