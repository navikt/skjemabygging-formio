import { Navigate, useSearchParams } from 'react-router-dom';
import { useSendInn } from '../context/sendInn/sendInnContext';
import { ErrorPage, LoadingComponent } from '../index';

export const SubmissionWrapper = ({ submission, url, children }) => {
  const { isMellomlagringEnabled, mellomlagringError } = useSendInn();
  const [searchParams] = useSearchParams();
  const innsendingsId = searchParams.get('innsendingsId');

  const expectsSavedSubmissionFromMellomlagring = isMellomlagringEnabled && !!innsendingsId;

  if (mellomlagringError && mellomlagringError.type === 'NOT FOUND') {
    return <ErrorPage errorMessage={mellomlagringError.message} />;
  }

  if (!submission && expectsSavedSubmissionFromMellomlagring) {
    return <LoadingComponent />;
  }

  if (!submission && !expectsSavedSubmissionFromMellomlagring) {
    searchParams.delete('innsendingsId');
    return <Navigate to={`${url}?${searchParams.toString()}`} />;
  }
  return (
    <>
      {children(submission)}
      <div id="formio-summary-hidden" hidden />
    </>
  );
};
