import React from "react";
import { useFeedbackMessage } from "../context/notifications/feedbackContext";
import { usePusherNotificationSubscription } from "../context/notifications/notificationsContext";

const UserFeedback = () => {
  const feedbackAlertComponent = useFeedbackMessage();
  const pusherAlertComponent = usePusherNotificationSubscription();
  return (
    <aside aria-live="polite">
      {feedbackAlertComponent()}
      {pusherAlertComponent()}
    </aside>
  );
};

export default UserFeedback;
