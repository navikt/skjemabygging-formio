import { Navigate, useSearchParams } from 'react-router-dom';
import { useAppConfig } from '../configContext';
import { useSendInn } from '../context/sendInn/sendInnContext';
import { ErrorPage, LoadingComponent } from '../index';

export const SubmissionWrapper = ({ submission, url, children }) => {
  const { featureToggles } = useAppConfig();
  const { isMellomlagringReady, mellomlagringError } = useSendInn();
  const [searchParams] = useSearchParams();
  const innsendingsId = searchParams.get('innsendingsId');

  const expectsSavedSubmissionFromMellomlagring = featureToggles.enableMellomlagring && !!innsendingsId;

  if (mellomlagringError && mellomlagringError.type === 'NOT FOUND') {
    return <ErrorPage errorMessage={mellomlagringError.message} />;
  }

  if (expectsSavedSubmissionFromMellomlagring && !isMellomlagringReady) {
    return <LoadingComponent />;
  }

  if (!expectsSavedSubmissionFromMellomlagring && !submission) {
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
