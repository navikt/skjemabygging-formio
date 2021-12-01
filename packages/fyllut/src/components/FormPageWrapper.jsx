import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormPage from "./FormPage";

class HttpError extends Error {}

export const FormPageWrapper = () => {
  const { formpath } = useParams();
  const [status, setStatus] = useState("LOADING");
  const [targetForm, setTargetForm] = useState({});
  useEffect(() => {
    fetch(`/fyllut/forms/${formpath}`, { headers: { accept: "application/json" } })
      .then((response) => {
        if (!response.ok) {
          throw new HttpError(response.statusText);
        }
        return response.json();
      })
      .then((results) => {
        if (results.length !== 0) setTargetForm(results[0]);
        setStatus("FINISHED LOADING");
      });
  }, [formpath]);

  const formTitle = Object.keys(targetForm).length !== 0 ? targetForm.title : "";

  useEffect(() => {
    document.title = `${formTitle} | www.nav.no`;
  }, [formTitle]);

  if (status === "LOADING") {
    return <LoadingComponent />;
  }

  if (Object.keys(targetForm).length === 0) {
    return (
      <h1>
        Finner ikke skjemaet <em>{formpath}</em>
      </h1>
    );
  }
  return <FormPage form={targetForm} />;
};
