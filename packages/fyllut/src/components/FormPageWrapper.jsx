import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import httpFyllut from "../util/httpFyllut.ts";
import FormPage from "./FormPage";
import PageNotFound from "./PageNotFound";

export const FormPageWrapper = () => {
  const { formPath } = useParams();
  const [status, setStatus] = useState("LOADING");
  const [form, setForm] = useState();
  useEffect(() => {
    httpFyllut
      .get(`/fyllut/api/forms/${formPath}`)
      .then((form) => {
        setForm(form);
        setStatus("FINISHED LOADING");
      })
      .catch((err) => {
        setStatus(err instanceof httpFyllut.UnauthenticatedError ? "UNAUTHENTICATED" : "FORM NOT FOUND");
      });
  }, [formPath]);

  useEffect(() => {
    if (form && form.title) {
      document.title = `${form.title} | www.nav.no`;
    }
  }, [form]);

  if (status === "LOADING" || status === "UNAUTHENTICATED") {
    return <LoadingComponent />;
  }

  if (status === "FORM NOT FOUND" || !form) {
    return <PageNotFound />;
  }

  return <FormPage form={form} />;
};
