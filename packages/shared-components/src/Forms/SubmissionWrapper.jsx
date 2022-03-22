import React from "react";
import { Redirect, useLocation } from "react-router-dom";

export const SubmissionWrapper = ({ submission, url, children }) => {
  const { search } = useLocation();
  if (!submission) {
    return <Redirect to={`${url}${search}`} />;
  }
  return children(submission);
};
