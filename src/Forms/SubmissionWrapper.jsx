import React from "react";
import { Redirect } from "react-router-dom";

export const SubmissionWrapper = ({ submission, url, children }) => {
  if (!submission) {
    return <Redirect to={url} />;
  }
  return children;
};
