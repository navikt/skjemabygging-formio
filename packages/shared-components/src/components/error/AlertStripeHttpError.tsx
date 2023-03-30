import { Alert } from "@navikt/ds-react";
import { HttpError } from "./index";

interface Props {
  error: HttpError;
}

const AlertStripeHttpError = ({ error }: Props) => {
  return (
    <Alert variant="error" className="margin-bottom-default">
      <div>{error.message}</div>
    </Alert>
  );
};

export default AlertStripeHttpError;
