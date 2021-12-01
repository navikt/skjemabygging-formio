import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormPage from "./FormPage";

class HttpError extends Error {}

export const FormPageWrapper = () => {
  const { formPath } = useParams();
  const [status, setStatus] = useState("LOADING");
  const [targetForm, setTargetForm] = useState();
  useEffect(() => {
    fetch(`/fyllut/forms/${formPath}`, { headers: { accept: "application/json" } })
      .then((response) => {
        if (!response.ok) {
          throw new HttpError(response.statusText);
        }
        return response.json();
      })
      .then((form) => {
        setTargetForm(form);
        setStatus("FINISHED LOADING");
      })
      .catch((e) => {
        console.debug(e);
        setStatus("FORM NOT FOUND");
      });
  }, [formPath]);

  const formTitle = !!targetForm ? targetForm.title : "";

  useEffect(() => {
    document.title = `${formTitle} | www.nav.no`;
  }, [formTitle]);

  if (status === "LOADING") {
    return <LoadingComponent />;
  }

  if (status === "FORM NOT FOUND" || !targetForm) {
    return (
      <h1>
        Finner ikke skjemaet <em>{formPath}</em>
      </h1>
    );
  }
  return <FormPage form={targetForm} />;
};
