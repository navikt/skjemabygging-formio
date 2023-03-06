import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { AlertStripeSuksess } from "nav-frontend-alertstriper";
import React from "react";
import { useFeedbackMessages } from "../context/notifications/feedbackContext";
import { usePusherNotificationSubscription } from "../context/notifications/notificationsContext";
import { Message } from "../hooks/useMessageQueue";
import { ErrorAlert, FyllutDeploymentFailureAlert, FyllutDeploymentSuccessAlert, WarningAlert } from "./Alerts";

const useStyles = makeStyles({
  alertstripe: {
    display: "flex",
    minWidth: "15rem",
  },
});

const UserFeedback = () => {
  const feedbackMessages = useFeedbackMessages();
  const pusherMessages = usePusherNotificationSubscription();
  const style = useStyles();

  const renderUserFeedback = (message: Message) => {
    switch (message.type) {
      case "success":
        setTimeout(() => message.clear(), 5000);
        return <AlertStripeSuksess key={message.id}>{message.message}</AlertStripeSuksess>;
      case "warning":
        return <WarningAlert key={message.id} message={message.message} onClose={() => message.clear()} />;
      case "error":
        return <ErrorAlert key={message.id} exception={message.message} onClose={() => message.clear()} />;
    }
  };

  const renderPusherMessages = (message: Message) => {
    switch (message.type) {
      case "success":
        return (
          <FyllutDeploymentSuccessAlert
            title={message.title}
            message={message.message}
            onClose={() => message.clear()}
          />
        );
      case "error":
        return (
          <FyllutDeploymentFailureAlert
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
