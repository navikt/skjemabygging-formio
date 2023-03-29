import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import styled from "@material-ui/styles/styled";
import { Close } from "@navikt/ds-icons";
import { Alert, BodyShort, Button } from "@navikt/ds-react";
import { navCssVariables } from "@navikt/skjemadigitalisering-shared-components";
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
    overflowWrap: "anywhere",
  },
});

const AlertContent = styled("div")({
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
    <Alert variant="success" className={styles.alert}>
      {message.message}
    </Alert>
  );
};

export const ErrorAlert = ({ message }: AlertProps) => {
  const styles = useStyles();
  return (
    <Alert variant="error" className={styles.alert}>
      <AlertContent>
        <BodyShort className={styles.body}>{message.message}</BodyShort>
        <Button
          variant="tertiary"
          icon={<Close aria-hidden />}
          onClick={() => message.clear()}
          type="button"
          aria-label="Lukk feilmelding"
        />
      </AlertContent>
    </Alert>
  );
};

export const WarningAlert = ({ message }: AlertProps) => {
  const styles = useStyles();
  return (
    <Alert variant="warning" className={styles.alert}>
      <AlertContent>
        <BodyShort className={styles.body}>{message.message}</BodyShort>
        <Button
          variant="tertiary"
          icon={<Close aria-hidden />}
          onClick={() => message.clear()}
          type="button"
          aria-label="Lukk advarsel"
        />
      </AlertContent>
    </Alert>
  );
};
