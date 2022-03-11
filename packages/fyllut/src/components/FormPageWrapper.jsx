import { http, LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormPage from "./FormPage";
import PageNotFound from "./PageNotFound";

export const FormPageWrapper = () => {
  const { formPath } = useParams();
  const [status, setStatus] = useState("LOADING");
  const [form, setForm] = useState();
  useEffect(() => {
    http
      .get(`/fyllut/api/forms/${formPath}`)
      .then((form) => {
        setForm(form);
        setStatus("FINISHED LOADING");
      })
      .catch((err) => {
        setStatus(err.unauthorized ? "UNAUTHORIZED" : "FORM NOT FOUND");
      });
  }, [formPath]);

  useEffect(() => {
    if (form && form.title) {
      document.title = `${form.title} | www.nav.no`;
    }
  }, [form]);

  if (status === "LOADING") {
    return <LoadingComponent />;
  }

  if (status === "UNAUTHORIZED") {
    return <div>Unauthorized</div>;
  }

  if (status === "FORM NOT FOUND" || !form) {
    return <PageNotFound />;
  }

  return <FormPage form={form} />;
};
