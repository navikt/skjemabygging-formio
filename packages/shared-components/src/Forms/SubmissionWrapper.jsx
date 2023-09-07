import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export const SubmissionWrapper = ({ submission, url, children }) => {
  const { search } = useLocation();
  if (!submission) {
    return <Navigate to={`${url}${search}`} replace />;
  }
  return children(submission);
};
