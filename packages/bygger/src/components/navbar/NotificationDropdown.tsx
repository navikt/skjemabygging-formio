import { makeStyles } from "@material-ui/styles";
import { InformationFilled } from "@navikt/ds-icons";
import { Alert, BodyShort, Heading } from "@navikt/ds-react";
import { Dropdown, Header } from "@navikt/ds-react-internal";
import React from "react";
import { usePusherNotifications } from "../../context/notifications/NotificationsContext";

const useStyles = makeStyles({
  notificationsMenu: {
    width: "28rem",
  },
  notificationPanel: {
    margin: "4px",
  },
});

const NotificationDropdown = () => {
  const styles = useStyles();
  const pusherMessages = usePusherNotifications();

  if (pusherMessages.length === 0) return <></>;

  return (
    <Dropdown>
      <Header.Button as={Dropdown.Toggle} aria-label="Notifikasjoner">
        <InformationFilled fontSize="1.5rem" role="presentation" />
      </Header.Button>
      <Dropdown.Menu className={styles.notificationsMenu}>
        <Dropdown.Menu.List>
          {pusherMessages.map(({ title, message, type, id }) => (
            <Alert key={id} variant={type} className={styles.notificationPanel}>
              <Heading level="3" size="small">
                {title}
              </Heading>
              <BodyShort>{message}</BodyShort>
            </Alert>
          ))}
        </Dropdown.Menu.List>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;
