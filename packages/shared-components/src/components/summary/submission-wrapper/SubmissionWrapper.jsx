import { Navigate, useSearchParams } from 'react-router-dom';
import { useSendInn } from '../../../context/sendInn/sendInnContext';
import { LoadingComponent } from '../../../index';

export const SubmissionWrapper = ({ submission, children, url }) => {
  const { isMellomlagringAvailable } = useSendInn();
  const [searchParams] = useSearchParams();
  const innsendingsId = searchParams.get('innsendingsId');

  const expectsSavedSubmissionFromMellomlagring = isMellomlagringAvailable && !!innsendingsId;

  if (!submission) {
    if (expectsSavedSubmissionFromMellomlagring) {
      return <LoadingComponent />;
    } else {
      searchParams.delete('innsendingsId');
      return <Navigate to={`${url}?${searchParams.toString()}`} />;
    }
  }

  return (
    <>
      {children(submission)}
      <div id="formio-summary-hidden" hidden />
    </>
  );
};
