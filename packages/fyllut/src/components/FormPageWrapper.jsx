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
    if (form?.title) {
      document.title = `${form.title} | www.nav.no`;
      document.querySelector('meta[property="og:title"]')?.setAttribute("content", `${form.title} | www.nav.no`);
    }

    const descriptionComponent = form?.components[0]?.components?.find((i) => i.key === "beskrivelsetekst");
    //sjekker på om finnes og om den inneholder defaultval: "Her skal det stå en kort beskrivelse av søknaden"
    //regner med at det er ønskelig med en "global prop" for dette hvis man skal løse det på denne måten..
    // annen måte å løse det på: påkrevd inputfelt? Hør med de andre i morgen..
    if (
      descriptionComponent?.content &&
      descriptionComponent?.content !== "Her skal det stå en kort beskrivelse av søknaden"
    ) {
      const descriptionTxt = descriptionComponent.content.replace(/[^a-zA-Z0-9 ]/g, "");
      document.querySelector('meta[name="description"]')?.setAttribute("content", descriptionTxt);
      document.querySelector('meta[property="og:description"]')?.setAttribute("content", descriptionTxt);
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
