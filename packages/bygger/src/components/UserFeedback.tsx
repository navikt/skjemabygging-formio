import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { useFeedbackMessages } from '../context/notifications/FeedbackContext';
import { Message } from '../context/notifications/messageQueueReducer';
import { ErrorAlert, SuccessAlert, WarningAlert } from './MessageAlerts';

const useStyles = makeStyles({
  alertstripe: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '15rem',
  },
  alert: {
    marginBottom: '1rem',
  },
});

const UserFeedback = () => {
  const { messages, clearMessage } = useFeedbackMessages();
  const style = useStyles();

  const renderUserFeedback = (message: Message) => {
    const removeMessage = () => clearMessage(message.id);
    switch (message.type) {
      case 'success':
        setTimeout(removeMessage, 5000);
        return <SuccessAlert key={message.id} message={message} />;
      case 'warning':
        return <WarningAlert key={message.id} message={message} clearMessage={removeMessage} />;
      case 'error':
        return <ErrorAlert key={message.id} message={message} clearMessage={removeMessage} />;
    }
  };

  return (
    <aside className={style.alertstripe} aria-live="polite">
      {messages.map(renderUserFeedback)}
    </aside>
  );
};

export default UserFeedback;
