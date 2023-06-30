import { makeStyles } from "@navikt/skjemadigitalisering-shared-components";
import { useFeedbackMessages } from "../context/notifications/FeedbackContext";
import { Message } from "../hooks/useMessageQueue";
import { ErrorAlert, SuccessAlert, WarningAlert } from "./MessageAlerts";

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
  const style = useStyles();

  const renderUserFeedback = (message: Message) => {
    switch (message.type) {
      case "success":
        setTimeout(() => message.clear(), 5000);
        return <SuccessAlert key={message.id} message={message} />;
      case "warning":
        return <WarningAlert key={message.id} message={message} />;
      case "error":
        return <ErrorAlert key={message.id} message={message} />;
    }
  };

  return (
    <aside className={style.alertstripe} aria-live="polite">
      {feedbackMessages.map(renderUserFeedback)}
    </aside>
  );
};

export default UserFeedback;
