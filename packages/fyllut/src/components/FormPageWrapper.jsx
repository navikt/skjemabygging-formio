import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import FormPage from "./FormPage";

class HttpError extends Error {}

export const FormPageWrapper = ({ routeProps }) => {
  const formPath = routeProps.match.params.formpath;
  // const targetForm = forms.find(navFormUtils.formMatcherPredicate(formPath));
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
      .then((results) => {
        setTargetForm(results[0]);
        setStatus("FINISHED LOADING");
      });
  }, [formPath]);

  const formTitle = targetForm ? targetForm.title : "";

  useEffect(() => {
    document.title = `${formTitle} | www.nav.no`;
  }, [formTitle]);

  if (status === "LOADING") {
    return <LoadingComponent />;
  }

  if (!targetForm) {
    return (
      <h1>
        Finner ikke skjemaet <em>{formPath}</em>
      </h1>
    );
  }
  return <FormPage form={targetForm} />;
};

FormPageWrapper.propTypes = {
  routeProps: PropTypes.object.isRequired,
  //forms: PropTypes.array.isRequired,
  children: PropTypes.func.isRequired,
};
