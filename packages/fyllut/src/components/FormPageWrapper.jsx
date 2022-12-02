import { LoadingComponent, useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import httpFyllut from "../util/httpFyllut";
import FormPage from "./FormPage";
import PageNotFound from "./PageNotFound";
import SubmissionMethodNotAllowed from "./SubmissionMethodNotAllowed";

export const FormPageWrapper = () => {
  const { formPath } = useParams();
  const [status, setStatus] = useState("LOADING");
  const [form, setForm] = useState();
  const { submissionMethod } = useAppConfig();

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
    const metaPropOgTitle = document.querySelector('meta[property="og:title"]');
    const metaNameDescr = document.querySelector('meta[name="description"]');
    const metaNameOgDescr = document.querySelector('meta[property="og:description"]');
    const setHeaderProp = function (headerObj, metaPropValue) {
      headerObj?.setAttribute("content", metaPropValue);
    };

    if (form) {
      if (form.title) {
        document.title = `${form.title} | www.nav.no`;
        setHeaderProp(metaPropOgTitle, `${form.title} | www.nav.no`);
      }
    }

    return function cleanup() {
      document.title = "Fyll ut skjema - www.nav.no";
      setHeaderProp(metaPropOgTitle, "Fyll ut skjema - www.nav.no");
      setHeaderProp(metaNameDescr, "NAV søknadsskjema");
      setHeaderProp(metaNameOgDescr, "NAV søknadsskjema");
    };
  }, [form]);

  if (status === "LOADING" || status === "UNAUTHENTICATED") {
    return <LoadingComponent />;
  }

  if (status === "FORM NOT FOUND" || !form) {
    return <PageNotFound />;
  }

  if (submissionMethod && !navFormUtils.isSubmissionMethodAllowed(submissionMethod, form)) {
    return <SubmissionMethodNotAllowed submissionMethod={submissionMethod} />;
  }

  return <FormPage form={form} />;
};
