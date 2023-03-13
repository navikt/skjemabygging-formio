import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import React from "react";
import { useFeedbackMessages } from "../context/notifications/FeedbackContext";
import { usePusherNotifications } from "../context/notifications/NotificationsContext";
import { Message } from "../hooks/useMessageQueue";
import {
  ErrorAlert,
  FyllutDeploymentFailureAlert,
  FyllutDeploymentSuccessAlert,
  SuccessAlert,
  WarningAlert,
} from "./MessageAlerts";

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
        return <SuccessAlert message={message} />;
      case "warning":
        return <WarningAlert message={message} />;
      case "error":
        return <ErrorAlert message={message} />;
    }
  };

  const renderPusherMessages = (message: Message) => {
    switch (message.type) {
      case "success":
        return <FyllutDeploymentSuccessAlert message={message} />;
      case "error":
        return <FyllutDeploymentFailureAlert message={message} />;
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
