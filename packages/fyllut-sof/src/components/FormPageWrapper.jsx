import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { useParams } from "react-router-dom";
import FormPage from "./FormPage";

export const FormPageWrapper = ({ forms }) => {
  const { formpath } = useParams();
  const targetForm = forms.find(navFormUtils.formMatcherPredicate(formpath));
  const formTitle = targetForm ? targetForm.title : "";

  useEffect(() => {
    document.title = `${formTitle} | www.nav.no`;
  }, [formTitle]);

  if (!targetForm) {
    return <h1>Finner ikke skjemaet som du prøver å etterpørre.</h1>;
  } else {
    return <FormPage form={targetForm}></FormPage>;
  }
};

FormPageWrapper.propTypes = {
  forms: PropTypes.array.isRequired,
};
