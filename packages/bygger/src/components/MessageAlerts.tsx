import { XMarkIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Button } from '@navikt/ds-react';
import { makeStyles, navCssVariables } from '@navikt/skjemadigitalisering-shared-components';
import { Message } from '../context/notifications/messageQueueReducer';

interface AlertProps {
  message: Message;
  clearMessage?: () => void;
}

const useStyles = makeStyles({
  alert: {
    marginBottom: '1rem',
  },
  body: {
    overflowWrap: 'anywhere',
  },
  alertContent: {
    display: 'flex',
    alignItems: 'flex-start',
    '& .knapp': {
      color: navCssVariables.navMorkGra,
      backgroundColor: 'transparent',
      '& svg': {
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

export const ErrorAlert = ({ message, clearMessage }: AlertProps) => {
  const styles = useStyles();
  return (
    <Alert variant="error" className={styles.alert}>
      <div className={styles.alertContent}>
        <BodyShort className={styles.body}>{message.message}</BodyShort>
        <Button
          variant="tertiary"
          icon={<XMarkIcon aria-hidden />}
          onClick={clearMessage}
          type="button"
          aria-label="Lukk feilmelding"
        />
      </div>
    </Alert>
  );
};

export const WarningAlert = ({ message, clearMessage }: AlertProps) => {
  const styles = useStyles();
  return (
    <Alert variant="warning" className={styles.alert}>
      <div className={styles.alertContent}>
        <BodyShort className={styles.body}>{message.message}</BodyShort>
        <Button
          variant="tertiary"
          icon={<XMarkIcon aria-hidden />}
          onClick={clearMessage}
          type="button"
          aria-label="Lukk advarsel"
        />
      </div>
    </Alert>
  );
};
