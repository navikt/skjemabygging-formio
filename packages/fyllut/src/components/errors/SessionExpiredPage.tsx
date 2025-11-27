import { ErrorPageWrapper } from './ErrorPageWrapper';
import SessionExpiredContent from './content/SessionExpiredContent';

const SessionExpiredPage = () => {
  return (
    <ErrorPageWrapper>
      <SessionExpiredContent />
    </ErrorPageWrapper>
  );
};

export default SessionExpiredPage;
