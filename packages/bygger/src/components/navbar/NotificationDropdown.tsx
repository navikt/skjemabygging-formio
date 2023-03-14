import { makeStyles } from "@material-ui/styles";
import { InformationFilled } from "@navikt/ds-icons";
import { Alert, BodyShort, Detail, Heading } from "@navikt/ds-react";
import { Dropdown, Header } from "@navikt/ds-react-internal";
import { navCssVariables } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { usePusherNotifications } from "../../context/notifications/NotificationsContext";

const useStyles = makeStyles({
  notificationsMenu: {
    padding: 0,
    width: "28rem",
  },
  notificationPanel: {
    margin: "4px",
  },
});

const NotificationDropdown = () => {
  const styles = useStyles();
  const { messages, clearAll } = usePusherNotifications();

  if (messages.length === 0) return <></>;

  return (
    <Dropdown>
      <Header.Button as={Dropdown.Toggle} aria-label="Notifikasjoner">
        <InformationFilled color={navCssVariables.navWarning} fontSize="1.5rem" role="presentation" />
      </Header.Button>
      <Dropdown.Menu className={styles.notificationsMenu} onClose={() => clearAll()}>
        <Dropdown.Menu.List>
          {messages.map(({ title, message, type, id, created }) => (
            <Alert key={id} variant={type} className={styles.notificationPanel}>
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
