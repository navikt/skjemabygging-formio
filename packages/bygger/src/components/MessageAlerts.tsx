import { Close } from "@navikt/ds-icons";
import { Alert, BodyShort, Button } from "@navikt/ds-react";
import { makeStyles, navCssVariables } from "@navikt/skjemadigitalisering-shared-components";
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
  alertContent: {
    display: "flex",
    alignItems: "flex-start",
    "& .knapp": {
      color: navCssVariables.navMorkGra,
      backgroundColor: "transparent",
      "& svg": {
        fill: navCssVariables.navMorkGra,
      },
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
      <div className={styles.alertContent}>
        <BodyShort className={styles.body}>{message.message}</BodyShort>
        <Button
          variant="tertiary"
          icon={<Close aria-hidden />}
          onClick={() => message.clear()}
          type="button"
          aria-label="Lukk feilmelding"
        />
      </div>
    </Alert>
  );
};

export const WarningAlert = ({ message }: AlertProps) => {
  const styles = useStyles();
  return (
    <Alert variant="warning" className={styles.alert}>
      <div className={styles.alertContent}>
        <BodyShort className={styles.body}>{message.message}</BodyShort>
        <Button
          variant="tertiary"
          icon={<Close aria-hidden />}
          onClick={() => message.clear()}
          type="button"
          aria-label="Lukk advarsel"
        />
      </div>
    </Alert>
  );
};
