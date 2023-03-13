import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import styled from "@material-ui/styles/styled";
import { Alert, BodyShort, Heading } from "@navikt/ds-react";
import { navCssVariables } from "@navikt/skjemadigitalisering-shared-components";
import { Xknapp } from "nav-frontend-ikonknapper";
import React from "react";
import { Message } from "../hooks/useMessageQueue";

interface AlertProps {
  message: Message;
}

const useStyles = makeStyles({
  alert: {
    marginBottom: "1rem",
  },
  body: {
    overflowWrap: "break-word",
  },
});

const AlertContent = styled("div")({
  overflowWrap: "break-word",
  display: "flex",
  alignItems: "flex-start",
  "& .knapp": {
    color: navCssVariables.navMorkGra,
    backgroundColor: "transparent",
    "& svg": {
      fill: navCssVariables.navMorkGra,
    },
  },
});

export const SuccessAlert = ({ message }: AlertProps) => {
  const styles = useStyles();
  return (
    <Alert variant="success" key={message.id} className={styles.alert}>
      {message.message}
    </Alert>
  );
};

export const ErrorAlert = ({ message }: AlertProps) => {
  const styles = useStyles();
  return (
    <Alert variant="error" key={message.id} className={styles.alert}>
      <AlertContent>
        <BodyShort>{message.message}</BodyShort>
        <Xknapp onClick={() => message.clear()} />
      </AlertContent>
    </Alert>
  );
};

export const WarningAlert = ({ message }: AlertProps) => {
  const styles = useStyles();
  return (
    <Alert variant="warning" key={message.id} className={styles.alert}>
      <AlertContent>
        <BodyShort>{message.message}</BodyShort>
        <Xknapp onClick={() => message.clear()} />
      </AlertContent>
    </Alert>
  );
};

export const FyllutDeploymentSuccessAlert = ({ message }: AlertProps) => {
  const styles = useStyles();
  return (
    <Alert variant="success" key={message.id} className={styles.alert}>
      <AlertContent>
        <div>
          <Heading level="3" size="small">
            {message.title}
          </Heading>
          <BodyShort className={styles.body}>{message.message}</BodyShort>
        </div>
        <Xknapp type="flat" onClick={() => message.clear()} />
      </AlertContent>
    </Alert>
  );
};

export const FyllutDeploymentFailureAlert = ({ message }: AlertProps) => {
  const styles = useStyles();
  return (
    <Alert variant="error" key={message.id} className={styles.alert}>
      <AlertContent>
        <div>
          <Heading level="3" size="small">
            {message.title}
          </Heading>
          <BodyShort>{message.message}</BodyShort>
        </div>
        <Xknapp type="flat" onClick={() => message.clear()} />
      </AlertContent>
    </Alert>
  );
};
