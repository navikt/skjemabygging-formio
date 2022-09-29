import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import httpFyllut from "../util/httpFyllut";
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
    const metaPropOgTitle = document.querySelector('meta[property="og:title"]');
    const metaNameDescr = document.querySelector('meta[name="description"]');
    const metaNameOgDescr = document.querySelector('meta[property="og:description"]');
    const setHeaderProp = function (headerObj, metaPropValue) {
      headerObj?.setAttribute("content", metaPropValue);
    };

    if (form?.title) {
      document.title = `${form.title} | www.nav.no`;
      setHeaderProp(metaPropOgTitle, `${form.title} | www.nav.no`);
    }

    for (let i = 0; i < form?.components.length; i++) {
      if (form?.components[i]?.components?.find((j) => j.key === "beskrivelsetekst")) {
        const descriptionTxt = form?.components[i]?.components?.find((j) => j.key === "beskrivelsetekst")?.content;
        //const descriptionTxt = descriptionComponent?.content?;
        setHeaderProp(metaNameDescr, descriptionTxt);
        setHeaderProp(metaNameOgDescr, descriptionTxt);
        break;
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

  return <FormPage form={form} />;
};
