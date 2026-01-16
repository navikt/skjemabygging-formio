import { InformationSquareFillIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Detail, Dropdown, Heading, InternalHeader } from '@navikt/ds-react';
import { makeStyles, navCssVariables } from '@navikt/skjemadigitalisering-shared-components';
import { usePusherNotifications } from '../../../context/notifications/NotificationsContext';

const useStyles = makeStyles({
  notificationsMenu: {
    padding: 0,
    width: '28rem',
  },
  messagePanel: {
    margin: '4px',
  },
});

const NotificationDropdown = () => {
  const styles = useStyles();
  const { messages, clearAll } = usePusherNotifications();

  if (messages.length === 0) return <></>;

  return (
    <Dropdown>
      <InternalHeader.Button as={Dropdown.Toggle} aria-label="Notifikasjoner">
        <InformationSquareFillIcon color={navCssVariables.navWarning} fontSize="1.5rem" role="presentation" />
      </InternalHeader.Button>
      <Dropdown.Menu className={`${styles.notificationsMenu}`} onClose={clearAll}>
        <Dropdown.Menu.List>
          {messages.map(({ title, message, type, id, created }) => (
            <Alert key={id} variant={type} className={styles.messagePanel}>
              <Heading level="3" size="small">
                {title}
              </Heading>
              <BodyShort>{message}</BodyShort>
              <Detail>{created}</Detail>
            </Alert>
          ))}
        </Dropdown.Menu.List>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;
