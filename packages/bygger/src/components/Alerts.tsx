import styled from "@material-ui/styles/styled";
import { navCssVariables } from "@navikt/skjemadigitalisering-shared-components";
import { AlertStripeAdvarsel, AlertStripeFeil, AlertStripeSuksess } from "nav-frontend-alertstriper";
import { Xknapp } from "nav-frontend-ikonknapper";
import React from "react";

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

export const ErrorAlert = ({ exception, onClose }) => (
  <AlertStripeFeil>
    <AlertContent>
      <p>{exception.message || exception}</p>
      <Xknapp onClick={onClose} />
    </AlertContent>
  </AlertStripeFeil>
);

export const WarningAlert = ({ message, onClose }) => (
  <AlertStripeAdvarsel>
    <AlertContent>
      <p>{message}</p>
      <Xknapp onClick={onClose} />
    </AlertContent>
  </AlertStripeAdvarsel>
);

export const FyllutDeploymentSuccessAlert = ({ title, message, onClose }) => {
  return (
    <AlertStripeSuksess>
      <AlertContent>
        <div>
          <h3>{title}</h3>
          <div>{message}</div>
        </div>
        <Xknapp type="flat" onClick={onClose} />
      </AlertContent>
    </AlertStripeSuksess>
  );
};

export const FyllutDeploymentFailureAlert = ({ title, message, onClose }) => {
  return (
    <AlertStripeFeil>
      <AlertContent>
        <div>
          <h3>{title}</h3>
          <div>{message}</div>
        </div>
        <Xknapp type="flat" onClick={onClose} />
      </AlertContent>
    </AlertStripeFeil>
  );
};
