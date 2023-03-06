import styled from "@material-ui/styles/styled";
import { Alert } from "@navikt/ds-react";
import { navCssVariables } from "@navikt/skjemadigitalisering-shared-components";
import { Xknapp } from "nav-frontend-ikonknapper";
import React from "react";

interface AlertProps {
  className?: string;
  title?: string;
  message: string;
  onClose: () => void;
}

interface ErrorAlertProps extends Omit<AlertProps, "message"> {
  exception: { message: string } | string;
}

const AlertContent = styled("div")({
  display: "flex",
  alignItems: "flex-start",
  "& p": {
    margin: 0,
  },
  "& .knapp": {
    color: navCssVariables.navMorkGra,
    backgroundColor: "transparent",
    "& svg": {
      fill: navCssVariables.navMorkGra,
    },
  },
});

export const ErrorAlert = ({ className, exception, onClose }: ErrorAlertProps) => (
  <Alert className={className} variant="error">
    <AlertContent>
      <p>{typeof exception === "object" ? exception.message : exception}</p>
      <Xknapp onClick={onClose} />
    </AlertContent>
  </Alert>
);

export const WarningAlert = ({ className, message, onClose }: AlertProps) => (
  <Alert className={className} variant="warning">
    <AlertContent>
      <p>{message}</p>
      <Xknapp onClick={onClose} />
    </AlertContent>
  </Alert>
);

export const FyllutDeploymentSuccessAlert = ({ className, title, message, onClose }: AlertProps) => {
  return (
    <Alert className={className} variant="success">
      <AlertContent>
        <div>
          <h3>{title}</h3>
          <div>{message}</div>
        </div>
        <Xknapp type="flat" onClick={onClose} />
      </AlertContent>
    </Alert>
  );
};

export const FyllutDeploymentFailureAlert = ({ className, title, message, onClose }: AlertProps) => {
  return (
    <Alert className={className} variant="error">
      <AlertContent>
        <div>
          <h3>{title}</h3>
          <div>{message}</div>
        </div>
        <Xknapp type="flat" onClick={onClose} />
      </AlertContent>
    </Alert>
  );
};
