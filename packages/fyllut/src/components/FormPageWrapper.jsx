import React, { useEffect } from "react";
import PropTypes from "prop-types";

export const FormPageWrapper = ({ routeProps, forms, children }) => {
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
  return children(targetForm);
};

FormPageWrapper.propTypes = {
  routeProps: PropTypes.object.isRequired,
  forms: PropTypes.array.isRequired,
  children: PropTypes.func.isRequired,
};
