import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";

export const FormPageWrapper = ({ routeProps, forms, submissionObject, children, hasSubmission }) => {
  const formPath = routeProps.match.params.formpath;
  const targetForm = forms.find((form) => form.path === formPath);
  const formTitle = targetForm ? targetForm.title : "";

  useEffect(() => {
    document.title = `${formTitle} | www.nav.no`;
  }, [formTitle]);

  if (!targetForm) {
    return (
      <h1>
        Finner ikke skjemaet <em>{formPath}</em>
      </h1>
    );
  }

  if (hasSubmission && !submissionObject[targetForm.path]) {
    return <Redirect to={`/${targetForm.path}`} />;
  }

  return children(targetForm, submissionObject[targetForm.path]);
};

FormPageWrapper.propTypes = {
  routeProps: PropTypes.object.isRequired,
  forms: PropTypes.array.isRequired,
  submissionObject: PropTypes.object.isRequired,
  children: PropTypes.func.isRequired,
  hasSubmission: PropTypes.bool,
};
