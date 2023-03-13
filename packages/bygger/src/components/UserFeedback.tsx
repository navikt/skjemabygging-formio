import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { Alert } from "@navikt/ds-react";
import React from "react";
import { useFeedbackMessages } from "../context/notifications/FeedbackContext";
import { usePusherNotifications } from "../context/notifications/NotificationsContext";
import { Message } from "../hooks/useMessageQueue";
import { ErrorAlert, FyllutDeploymentFailureAlert, FyllutDeploymentSuccessAlert, WarningAlert } from "./Alerts";

const useStyles = makeStyles({
  alertstripe: {
    display: "flex",
    flexDirection: "column",
    minWidth: "15rem",
  },
  alert: {
    marginBottom: "1rem",
  },
});

const UserFeedback = () => {
  const feedbackMessages = useFeedbackMessages();
  const pusherMessages = usePusherNotifications();
  const style = useStyles();

  const renderUserFeedback = (message: Message) => {
    switch (message.type) {
      case "success":
        setTimeout(() => message.clear(), 5000);
        return (
          <Alert variant="success" className={style.alert} key={message.id}>
            {message.message}
          </Alert>
        );
      case "warning":
        return (
          <WarningAlert
            className={style.alert}
            key={message.id}
            message={message.message}
            onClose={() => message.clear()}
          />
        );
      case "error":
        return (
          <ErrorAlert
            className={style.alert}
            key={message.id}
            exception={message.message}
            onClose={() => message.clear()}
          />
        );
    }
  };

  const renderPusherMessages = (message: Message) => {
    switch (message.type) {
      case "success":
        return (
          <FyllutDeploymentSuccessAlert
            className={style.alert}
            title={message.title}
            message={message.message}
            onClose={() => message.clear()}
          />
        );
      case "error":
        return (
          <FyllutDeploymentFailureAlert
            className={style.alert}
            title={message.title}
            message={message.message}
            onClose={() => message.clear()}
          />
        );
    }
  };

  return (
    <aside className={style.alertstripe} aria-live="polite">
      {feedbackMessages.map(renderUserFeedback)}
      {pusherMessages.map(renderPusherMessages)}
    </aside>
  );
};

export default UserFeedback;
