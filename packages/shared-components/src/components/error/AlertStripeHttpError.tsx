import { AlertStripeFeil } from "nav-frontend-alertstriper";
import React from "react";
import { HttpError } from "./index";

interface Props {
  error: HttpError;
}

const AlertStripeHttpError = ({ error }: Props) => {
  return (
    <AlertStripeFeil className="margin-bottom-default">
      <div>{error.message}</div>
    </AlertStripeFeil>
  );
};

export default AlertStripeHttpError;
